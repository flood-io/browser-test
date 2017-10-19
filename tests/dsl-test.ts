import { script, expect } from 'lab'
export const lab = script()
const { describe, it, before, after } = lab

let buffer

describe('Test DSL', () => {
  // import { Builder, By, Key, test, step, before } from '../index'

  test({ duration: 30 * 60 }, () => {
    // before(() => (driver: Driver) {
    //   driver.resetCache()
    //   driver.resetCookies()
    //   driver.resetServiceWorkers()
    // })
    // step('Flood Challenge: Step 1', async driver => {
    //   await driver.get('https://challenge.flood.io')
    //   let title = await driver.findElement(By.tagName('h2'))
    //   driver.setVariable('STEP_1_TITLE', title)
    //   await driver.findElement(By.css('#new_challenger > input.btn.btn-xl.btn-default')).click()
    // })
    // step('Flood Challenge: Step 2', async driver => {
    //   let title = await driver.findElement(By.tagName('h2'))
    //   driver.setVariable('STEP_2_TITLE', title)
    //   let select = await driver.findElement(By.id('#challenger_age'))
    //   await select.selectByVisibleText('28')
    //   await driver.findElement('input.btn').click()
    // })
  })
})
