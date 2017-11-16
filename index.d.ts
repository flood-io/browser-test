// Type definitions for @flood/browser-test 0.1.0
// Project: browser-test
// Definitions by: Ivan Vanderbyl <github.com/ivanvanderbyl>

export as namespace BrowserTest
export interface TestOptions {
	duration?: number
	loopCount?: number
}

export declare function test(options: TestOptions, fn: () => void)
export declare function step(name: string, fn: (driver: Driver) => Promise<void>)

export declare class Driver {
	/**
   * Returns a Promise which resolves when the first promise in `...promises` resolves.
   *
   * @param {...Promise[]} promises
   */
	public race(...promises)

	/**
  * Creates a waiter, which accepts any wait arguments. This essentially creates a
  * Promise which will resolve when the condition is met, or reject when it times out.
  *
  * @param {number} timeout
  * @returns {Promise<void>}
  * @memberof Driver
  */
	public wait(timeout: number): Promise<void>

	/**
  * Instructs the browser to navigate to a specific page. This is typically used as the
  * entrypoint to your test, as the first instruction it is also responsible for creating
  * a new Browser tab for this page to load into.
  *
  * @param {string} url
  * @returns {Promise<void>}
  * @memberof Driver
  */
	public visit(url: string): Promise<void>

	/**
   * Sends a click event to the element located at `selector`. If the element is
   * currently outside the viewport it will first scroll to that element.
   *
   * @param {string} selector
   */
	public click(selector: string): Promise<void>

	public rightClick(selector: string): Promise<void>

	public middleClick(selector: string): Promise<void>

	public selectByValue(selector: string, value: string): Promise<void>

	public selectByIndex(selector: string, index: string): Promise<void>

	public selectByText(selector: string, text: string): Promise<void>

	public clearSelect(selector: string): Promise<void>

	public fillIn(selector: string, text: string, options?: { delay: number }): Promise<void>

	public blur(selector: string): Promise<void>

	public focus(selector: string): Promise<void>

	public pressKey(keyCode: string, options: { text: string }): Promise<void>

	public keyboardDown(keyCode: string, options: { text: string }): Promise<void>

	public waitForElement(selector: string, options: {}): Promise<any>

	public findElementWithText(selector: string, text: string): Promise<any>
}
