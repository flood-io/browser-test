import { escapeCss } from './utils/escape'

export default class By {
  public readonly command: string
  public readonly args: string[]

  constructor(command: string, ...args) {
    this.command = command
    this.args = args
  }

  public static css(selector: string): By {
    return new By('find-element-by-selector', selector)
  }

  /**
   * Locates elements by the ID attribute. This locator uses the CSS selector
   * `*[id="$ID"]`, _not_ `document.getElementById`.
   *
   * @param {string} id The ID to search for
   */
  public static id(id: string): By {
    return this.css(`*[id="${id}"]`)
  }

  /**
   * Locates link elements whose `textContent` matches the given
   * string.
   *
   * @param {string} text The link text to search for.
   */
  static linkText(text): By {
    return new By('find-element-with-text', 'a[href]', text)
  }

  /**
   * Locates an elements by evaluating a JavaScript expression.
   * The result of this expression must be an element or list of elements.
   *
   * @param {!(string|Function)} script The script to execute.
   * @param {...*} var_args The arguments to pass to the script.
   */
  static js(script: string | Function, ...args): By {
    return new By('evaluate', script, args)
  }

  /**
   * Locates elements whose `name` attribute has the given value.
   *
   * @param {string} name The name attribute to search for.
   * @return {!By} The new locator.
   */
  public static nameAttr(name: string): By {
    return By.css('*[name="' + escapeCss(name) + '"]')
  }

  /**
   * Locates link elements whose `textContent` contains the given
   * substring.
   *
   * @param {string} text The substring to check for in a link's visible text.
   */
  static partialLinkText(text): By {
    return new By('find-element-with-partial-text', 'a[href]', text)
  }

  /**
   * Locates elements with a given tag name.
   *
   * @param {string} name The tag name to search for.
   * @return {!By} The new locator.
   */
  static tagName(name: string): By {
    return new By('find-element-with-tagname', name)
  }

  /**
   * Locates elements matching a XPath selector. Care should be taken when
   * using an XPath selector with a {@link webdriver.WebElement} as WebDriver
   * will respect the context in the specified in the selector. For example,
   * given the selector `//div`, WebDriver will search from the document root
   * regardless of whether the locator was used with a WebElement.
   *
   * @param {string} xpath The XPath selector to use.
   * @return {!By} The new locator.
   * @see http://www.w3.org/TR/xpath/
   */
  static xpath(xpath) {
    return new By('find-element-by-xpath', xpath)
  }

  toString() {
    return `By(${this.command}, ${this.args.join(', ')})`
  }
}
