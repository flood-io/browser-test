import By from './by'

class Command {
  name: string
  args: Array<string | By>
}

export class Builder {
  private commandQueue: Command[] = []

  public createStep(fn: (driver: Builder) => {}) {
    fn.apply(this, [this])
  }

  public async get(url): Promise<Builder> {
    this.commandQueue.push({ name: 'visit', args: [url] })
    return this
  }

  public findElement(locator: By): Builder {
    this.commandQueue.push({ name: locator.command, args: locator.args })
    return this
  }

  public sendKeys(key: string): Builder {
    key = new Buffer(key).toString('base64')
    this.commandQueue.push({ name: 'press', args: [key] })
    return this
  }

  public toJSON() {
    return JSON.stringify(
      {
        actions: this.commandQueue.map(command => {
          return { type: command.name, arguments: command.args }
        }),
      },
      null,
      2,
    )
  }
}
