# Browser Level Load Testing with Flood

> Flood Chrome brings the familiar power of traditional browser scripting tools with the proven performance of Flood to create an easy to use and maintainable performance testing tool.

This package provides the type definitions to help you write Flood Chrome "BLU" scripts and run them on Flood using real browsers.

# Get Started

**1. Create a Workspace**

Create a new project directory or skip to step 2 if you're using an existing project

**2. Install `@flood/chrome`**

Add `@flood/chrome` as a development dependency to your `package.json`:

```bash
# using yarn
yarn add @flood/chrome

# using NPM
npm install -sd @flood/chrome
```

**3. Create test script**

Flood Chrome uses TypeScript for type correctness and inline documentation as you write. Make sure you have TypeScript support enabled in your editor.

```ts
// 1. Import the basic test components from this package
import { test, step, assert } from '@flood/chrome'

// 2. Define the test. Every test must make this call to register itself
test(() => {
  /**
   * 3. Define your first step.
   *
   * Each step must have a unique label as the first argument, and an async callback function
   * as the second argument. The callback function receives an instance of the Driver, which
   * exposes all the functions you can call on Browser during a test.
   *
   * Using async/await is simply a cleaner way of using Promises, and allows us to keep the test plan
   * very clean and succinct without declaring multiple Promise chain callbacks.
   */
  step('1. Start challenge', async (driver: Driver) => {
    await driver.visit('https://challenge.flood.io')
    let h2 = await driver.waitForElement('h2')
    let h2Text = await driver.extractText(h2)
    assert.equal(h2Text, 'Flood Challenge')
  })
})
```

**4. Upload to Flood**

Once you've written your first script, simply [upload it to Flood](https://flood.io/app) and launch a test.