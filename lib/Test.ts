import { Step } from './Step'
import { Builder } from './Builder'

export default class Test {
  options = {}
  fn: any
  driver: Builder
  steps: Step[] = []

  constructor(options = {}, fn: (driver) => {}) {
    this.options = options
    this.fn = fn
    this.driver = new Builder()
  }

  /**
   * Adds a new step to the test plan
   *
   * @param {string} name
   * @param {any} options
   * @param {any} fn
   * @memberof Test
   */
  step(name: string, options, fn) {
    let step = new Step(this.driver, name, options, fn)
    this.steps.push(step)
    return this
  }

  call() {
    this.steps.forEach(step => step.call())
  }
}
