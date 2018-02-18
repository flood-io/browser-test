import { HtmlRenderer, Parser } from 'commonmark'
import { join, dirname, resolve, normalize, relative } from 'path'
import * as table from 'markdown-table'
import * as camelcase from 'lodash.camelcase'
import * as glob from 'glob'
import * as frontMatter from 'front-matter'
import {
	mkdirpSync,
	copySync,
	emptyDirSync,
	createFileSync,
	writeFileSync,
	readFileSync,
} from 'fs-extra'

function commentFromNode(node) {
	let { comment: { shortText, text } = { shortText: null, text: null } } = node
	return [shortText, text].filter(t => t && t.length).join('\n\n')
}

function findReferences(text: string): string[] {
	let r = /\[(\w+)\]/gi
	let matches = r.exec(text)
	if (matches) {
		let [orig, ...rest] = matches
		return rest
	}

	return []
}

/**
 * Translates the node type and name to a relative file path, and ensures the file exists
 */
function filePathForNameAndType(kind: string, name: string): string {
	let paths = {
		Class: name => join('api', `${name}.md`),
		Interface: name => join('api', `Interfaces.md`),
		Module: name => join('api', `${name}.md`),
		Function: name => join('api', `Functions.md`),
		'Type alias': name => join('api', `Interfaces.md`),
		Enumeration: name => join('api', `Interfaces.md`),
		Index: name => name,
	}

	let relativePath = paths[kind](name)
	return relativePath
}

interface Comment {
	shortText: string
	text: string
}

type RefsMap = Map<string, { target: string; title?: string }>

type ParamType =
	| { type: 'intrinsic'; name: string }
	| { type: 'reference'; name: string | 'Promise'; typeArguments?: ParamType[] }
	| { type: 'stringLiteral'; value: string }
	| { type: 'reflection'; declaration: any }
	| { type: 'array'; elementType: ParamType }
	| { type: 'union'; types: ParamType[] }

class ParamTypeFormatter {
	constructor(public input: ParamType) {}

	public toString() {
		let { type } = this.input

		if (this.input.type === 'intrinsic') {
			return `${this.input.name}`
		} else if (this.input.type === 'stringLiteral') {
			return this.input.value
		} else if (this.input.type === 'array') {
			let formatter = new ParamTypeFormatter(this.input.elementType)
			return `${formatter.toString()}[]`
		} else if (this.input.type === 'union') {
			let formattedArgs = this.input.types.map(t =>
				new ParamTypeFormatter(t).toString(),
			)
			return `${formattedArgs.join('|')}`
		} else if (this.input.type === 'reflection') {
			return new ReflectedDeclarationFormatter(
				this.input.declaration,
			).toString()
		} else if (this.input.type === 'reference') {
			if (this.input.name === 'Promise') {
				let formattedArgs = this.input.typeArguments.map(t =>
					new ParamTypeFormatter(t).toString(),
				)
				return `[Promise]<${formattedArgs.join('|')}>`
			} else {
				return `[${this.input.name}]`
			}
		} else {
			console.assert(true, `Found unknown type: "${type}"`)
		}
	}
}

type Variable = {
	id: string
	name: string
	kindString: 'Variable'
	flags: object
	type: ParamType
}
type CallSignature = {
	name: '__call'
	kindString: 'Call signature'
	type: ParamType
}
type ReflectedDeclaration = {
	name: '__type'
	kindString: 'Type literal'
	children?: Variable[]
	signatures?: CallSignature[]
}

class ReflectedDeclarationFormatter {
	constructor(
		public declaration: ReflectedDeclaration | Variable | CallSignature,
	) {}

	toString() {
		if (this.declaration.kindString === 'Type literal') {
			if (this.declaration.children) {
				let children = this.declaration.children
					.map(child => new ReflectedDeclarationFormatter(child).toString())
					.reduce((memo, obj) => {
						memo = { ...obj, ...memo }
						return memo
					}, {})
				return JSON.stringify(children)
			}
		} else if (this.declaration.kindString === 'Variable') {
			let { name, type } = this.declaration
			let formattedType = new ParamTypeFormatter(type)
			let obj = {}
			obj[name] = formattedType.toString()
			return obj
		}
	}
}

class MarkdownDocument {
	constructor(
		public path: string,
		public lines: string[] = [],
		public referencesNeeded: string[] = [],
		public enableReferences = true,
	) {}

	public writeLine(text: string = '') {
		this.referencesNeeded = [...this.referencesNeeded, ...findReferences(text)]
		this.writeLineRaw(text)
	}

	public writeHeading(text: string, depth: number = 1) {
		this.writeLine(`${'#'.repeat(depth)} ${text}`)
	}

	public writeBullet(text: string, depth: number = 1) {
		let b = ` `.repeat(depth)
		this.writeLine(`${b}* ${text}`)
	}

	public writeParameterLine(
		name: string,
		type: ParamType,
		desc: string = '',
		isOptional = false,
	) {
		let formattedType = new ParamTypeFormatter(type).toString()
		let t = `<${formattedType}>`

		if (name.startsWith('returns')) {
			this.writeLine(`* ${name} ${t} ${desc.trim()}`)
		} else {
			this.writeLine(
				`* \`${name}\` ${t} ${isOptional ? '(Optional)' : ''} ${desc.trim()}`,
			)
		}
	}

	public writeComment(comment: Comment) {
		let { shortText, text } = comment || { shortText: null, text: null }
		if (shortText) {
			this.writeLine(shortText)
			this.writeLine()
		}
		if (text) this.writeLine(text)
	}

	public writeSection(name: string) {
		this.writeLine(`-------`)
		this.writeHeading(name, 1)
		this.writeLine()
	}

	public applyReferences(references: RefsMap) {
		if (!this.enableReferences) return
		let refs: RefsMap = new Map()

		this.referencesNeeded.forEach(ref => {
			let { target, title } = references.get(ref) || { target: '', title: null }

			if (target.length > 0) {
				if (!target.startsWith('http')) {
					target = relative(join(bookDir, this.path, '..'), target)
				}
				if (references.has(ref)) refs.set(ref, { target, title })
			}
		})

		this.writeReferences(refs)
	}

	public writeTable(rows: string[][]) {
		let md = table(rows)
		this.writeLineRaw(md)
	}

	public writeTableHeader(...cols: string[]) {
		let str = cols.map(col => `| ${col} `).join('')
		this.writeLineRaw(str)
		this.writeLineRaw('-'.repeat(str.length))
	}

	public writeTableRow(...cols: string[]) {
		let str = cols.map(col => `| ${col} `).join('')
		this.writeLineRaw(str)
	}

	private writeReferences(references) {
		this.writeLineRaw('')
		references.forEach(({ title, target }, name) => {
			this.writeLineRaw(`[${name}]: ${target}${title ? `"${title}"` : ''}`)
		})
	}

	private writeLineRaw(text: string) {
		this.lines.push(text)
	}

	toString() {
		return this.lines.join(`\n`)
	}
}

const root = join(__dirname, '..')
const bookDir = join(root, 'docs')

class DocsParser {
	title: string

	references: Map<string, { target: string; title?: string }> = new Map()
	summaryParts: Map<string, string[]> = new Map()
	enumerations: MarkdownDocument[] = []

	docs: Map<string, MarkdownDocument[]> = new Map()

	constructor(public docsJSON: string) {
		mkdirpSync(bookDir)
		copySync(join(root, 'README.md'), join(bookDir, 'README.md'))

		for (const [key, target] of Object.entries(internalRefs)) {
			this.references.set(key, { target })
		}
	}

	/**
	 * This method processes the entire documentation AST and returns documentation.
	 *
	 * Steps:
	 * 1. Build Markdown documents for each "kind"
	 * 2. Create a reference list of each Kind and method/property linking to the file it belongs to.
	 * 3. Find all references mentioned in all markdown documents and append these references to those files.
	 *
	 * @memberof DocsParser
	 */
	process() {
		let mainModule = docsJSON.children.find(n => n.name === '"index.d"')
		mainModule.children.forEach(child => {
			let doc = new MarkdownDocument(
				filePathForNameAndType(child.kindString, child.name),
			)
			if (!this.docs.has(child.kindString)) this.docs.set(child.kindString, [])

			if (child.kindString === 'Module') {
				this.processClass(doc, child)
				// this.processModule(child)
			} else if (child.kindString === 'Enumeration') {
				this.processClass(doc, child)
				// this.processEnumeration(child)
			} else if (child.kindString === 'Class') {
				this.processClass(doc, child)
			} else if (child.kindString === 'Interface') {
				this.processClass(doc, child)
			} else if (child.kindString === 'Function') {
				this.processFunction(doc, child)
			} else if (child.kindString === 'Type alias') {
				this.processAlias(doc, child)
				// console.log(child)
			}

			this.docs.get(child.kindString).push(doc)
			// let relativePath = filePathForNameAndType(node.kindString, name)
			this.addReference(child.name, join(bookDir, doc.path))

			if (!this.summaryParts.has(child.name))
				this.summaryParts.set(child.name, [])
			console.log(doc.path)
			this.summaryParts.get(child.name).push(`[${child.name}](${doc.path})`)
		})

		this.createSummary()
		this.writeDocsToFiles()
	}

	public writeDocsToFiles() {
		let contents: Map<string, string[]> = new Map()
		this.docs.forEach((docs, path) => {
			docs.forEach(doc => {
				doc.applyReferences(this.references)
				let absPath = join(bookDir, doc.path)
				if (!contents.has(absPath)) contents.set(absPath, [])
				contents.get(absPath).push(doc.toString())
			})
		})
		contents.forEach((content, absPath) => {
			createFileSync(absPath)
			writeFileSync(absPath, content.join('\n'))
		})
	}

	private addReference(name, target, title?) {
		if (!name) return
		if (!target) return
		this.references.set(name, { target, title })
	}

	private createSummary() {
		let doc = new MarkdownDocument('SUMMARY.md')
		doc.enableReferences = false
		doc.writeHeading('Documentation', 1)
		doc.writeLine('')
		doc.writeLine('[Quick Start](README.md)')

		// Adds everything in the examples directory
		let examples = glob.sync('docs/examples/**/*.md')
		examples.forEach(file => {
			let content = readFileSync(file).toString('utf8')
			let { title } = frontMatter(content).attributes
			if (title) {
				let relativePath = relative(bookDir, file)
				doc.writeLine(`[${title}](${relativePath})`)
			}
		})

		doc.writeLine('')

		doc.writeHeading('API', 1)
		this.summaryParts.forEach((methods, name) => {
			methods.forEach(m => {
				doc.writeBullet(m, 2)
			})
		})

		this.docs.set('Index', [doc])

		doc = new MarkdownDocument('Enumerations.md')
		doc.writeHeading('Enumerations')
		doc.writeLine(
			'Here you will find a list of all the possible values for fields which accept a typed enumerated property, such as `userAgent` or `click()`',
		)
		this.docs.get('Enumeration').unshift(doc)
	}

	private processCallSignature(doc, sig, prefix?) {
		let { name, kindString, type, parameters = [] } = sig

		if (prefix) name = `${camelcase(prefix)}.${name}`

		let params = []
		parameters.forEach(p => {
			let { name, type, flags: { isOptional = false } } = p
			let desc = commentFromNode(p)
			params.push({ name, desc, type, isOptional })
		})

		let required = params
			.filter(p => !p.isOptional)
			.map(p => p.name)
			.join(`, `)
		let optional = params
			.filter(p => p.isOptional)
			.map(p => p.name)
			.join(`, `)

		name = `\`${name}(${required}${optional.length ? `[, ${optional}]` : ''})\``

		// if (prefix) {
		// 	let anchor = name
		// 		.toLowerCase()
		// 		.replace(/\s+/gi, '-')
		// 		.replace(/[^a-z0-9-]/gi, '')

		// 	// this.summaryParts.get(prefix).push(`[${name}](api/${prefix}.md#${anchor})`)
		// }

		if (sig.name === 'alertIsPresent') {
			// console.log(sig)
		}

		this.writeCallSignature(doc, name, sig.comment, params, type)
	}

	private writeCallSignature(
		doc: MarkdownDocument,
		name: string,
		comment: Comment,
		params: {
			name: string
			type: ParamType
			desc?: string
			isReference: boolean
			isOptional: boolean
		}[],
		returnType?: any,
	) {
		doc.writeHeading(`${name}`, 4)

		params.forEach(param => {
			// this.addReference(param.type, lookupTarget(param.type))
			if (param.name && param.type)
				doc.writeParameterLine(
					param.name,
					param.type,
					param.desc,
					param.isOptional,
				)
		})

		if (returnType) doc.writeParameterLine('returns:', returnType)

		doc.writeLine()
		doc.writeComment(comment)
	}

	private processEnumeration(node) {
		let doc = new MarkdownDocument('Enumerations.md')
		doc.writeHeading(`\`${node.name}\``, 4)
		doc.writeLine('')

		let { children = [] } = node
		children.forEach(node => {
			let { name, defaultValue } = node
			let comment = commentFromNode(node)
			doc.writeBullet(
				`\`${name}\`${defaultValue ? ` = ${defaultValue}` : ''} ${
					comment ? comment : ''
				}`,
			)
		})

		this.enumerations.push(doc)
	}

	private processFunction(doc, node) {
		node.signatures.forEach(sig => {
			this.addReference(
				sig.name,
				join(bookDir, filePathForNameAndType('Function', node.name)),
			)
			this.processCallSignature(doc, sig, null)
		})
	}

	private processAlias(doc: MarkdownDocument, node) {
		// console.log(node)

		doc.writeHeading(`\`${node.name}\``)

		// node.signatures.forEach(sig => {
		// 	this.addReference(sig.name, join(bookDir, filePathForNameAndType('Type alias', node.name)))
		// 	this.processCallSignature(doc, sig, null)
		// })
	}

	private processClass(doc, node) {
		let { name, children } = node

		let relativePath = filePathForNameAndType(node.kindString, name)

		// 1. Create file and reference
		let filePath = join(bookDir, relativePath)
		let comment = commentFromNode(node)

		doc.writeSection(`\`${name}\``)
		doc.writeComment(node.comment)

		// this.summaryParts.set(name, [])

		if (!children) children = []

		children
			.filter(node => node.kindString === 'Method')
			.forEach(node => this.processMethod(name, node, doc))

		children
			.filter(node => node.kindString === 'Property')
			.forEach(node => this.processProperty(name, node, doc))

		let members = children.filter(
			node => node.kindString === 'Enumeration member',
		)

		if (members.length) {
			this.processMembers(name, members, doc)
			// doc.writeTableHeader('Member', 'Default Value', 'Comment')
			// members.forEach(node => this.processMember(name, node, doc))
		}

		doc.writeLine()
		doc.writeComment(node.comment)

		// console.log(children.filter(node => !['Method', 'Property'].includes(node.kindString)))
	}

	private processMethod(parent, node, doc) {
		node.signatures.forEach(sig => {
			this.processCallSignature(doc, sig, parent)
			if (doc.filePath)
				this.addReference(
					`${camelcase(parent)}.${sig.name}`,
					join(bookDir, doc.filePath),
				)
		})
	}

	private processProperty(parent, node, doc) {
		let { name, flags, kindString, type } = node
		let comment = commentFromNode(node)
		doc.writeParameterLine(name, type, comment, flags.isOptional === true)
	}

	private processMembers(parent, members, doc: MarkdownDocument) {
		doc.writeTable([
			['Member', 'Default Value', 'Comment'],
			...members.map(node => {
				let { name, defaultValue } = node
				let comment = commentFromNode(node)
				return [
					`\`${name}\``,
					defaultValue ? defaultValue : '',
					comment ? comment : '',
				]
			}),
		])
	}

	private processMember(parent, node, doc: MarkdownDocument) {
		let { name, defaultValue } = node
		let comment = commentFromNode(node)

		// doc.writeTableRow(`\`${name}\``, defaultValue ? defaultValue : '', comment ? comment : '')
	}
}

const internalRefs = {
	void:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void',
	null:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null',
	Array:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
	boolean:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type',
	Buffer: 'https://nodejs.org/api/buffer.html#buffer_class_buffer',
	function:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
	number:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
	Object:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
	Promise:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
	string:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
	'stream.Readable':
		'https://nodejs.org/api/stream.html#stream_class_stream_readable',
	Error: 'https://nodejs.org/api/errors.html#errors_class_error',
	ChildProcess: 'https://nodejs.org/api/child_process.html',
	iterator:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
	Element: 'https://developer.mozilla.org/en-US/docs/Web/API/element',
	Map:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map',
	selector: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors',
	'UIEvent.detail':
		'https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail',
	Serializable:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Description',
	xpath: 'https://developer.mozilla.org/en-US/docs/Web/XPath',
	UnixTime: 'https://en.wikipedia.org/wiki/Unix_time',
	Key: 'Enumerations.md/#key',
	MouseButtons: 'Enumerations.md/#mousebuttons',
	Device: 'Enumerations.md/#device',
}

function lookupTarget(name: string) {
	return internalRefs[name]
}

let docsJSON = require(__dirname + '/../docs.json')
let parser = new DocsParser(docsJSON)
try {
	parser.process()
} catch (err) {
	console.error(err)
}
