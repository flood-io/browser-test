# Browser Level Load Testing

This project provides a WebDriver.js / Selenium compatible DSL for creating Browser Load Test scripts which will run in the Flood Chrome test environment.

## Example

Example for completing the first 2 steps of the Flood Challenge.

(Script in ES6 format)

```js
import { test, step, By } from "@flood-io/browser-test"
test(() => {
  step("Start", (driver) => {
    driver.goto("https://challenge.flood.io")
    driver.screenshot()
    let startButton = driver.findElement(By.css("#new_challenger > input.btn.btn-xl.btn-default"))startButton.click()
  })

  step("Step 2", (driver) => {
    driver.findElement(By.css("#challenger_age")).selectByText("28")
    driver.findElement(By.css("input.btn")).click()
  })
})
```

> Notice that you don't need to use async or Promises, we automatically handle them for you,
> however you can use them for syntactic sugar if you need.