import { Builder } from './Builder'

export class Step {
  options = {}
  fn: any
  driver: Builder
  actions = []

  constructor(driver: Builder, name: string, options = {}, fn: (driver) => {}) {
    this.driver = driver
    this.options = options
    this.fn = fn
  }

  public call() {
    this.driver.createStep(this.fn)
  }
}
