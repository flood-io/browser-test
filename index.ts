import Test from './lib/Test'
import Step from './lib/Step'

export function test(options: {}, fn) {
  return new Test(options, fn)
}
