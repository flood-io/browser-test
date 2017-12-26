// Type definitions for @flood/browser-test 0.1.0
// Project: browser-test
// Definitions by: Ivan Vanderbyl <github.com/ivanvanderbyl>

export as namespace BrowserTest
export interface TestOptions {
  /**
   * Maximum duration to run this for, regardless of other timeouts specified on Flood.
   *
   * Defaults to `-1` for no timeout.
   */
  duration?: number

  /**
   * Number of times to run this test.
   * Defaults to `-1` for infinite.
   */
  loopCount?: number

  /**
   * Specifies the time (in seconds) to wait between each action call, to simulate a normal user
   * thinking about what to do next.
   */
  actionDelay?: number

  /**
   * Specifies the time (in seconds) to wait after each step.
   */
  stepDelay?: number

  /**
   * Specifies a custom User Agent (UA) string to send.
   */
  userAgent?: string

  /**
   * Global wait timeout applied to all wait tasks
   */
  waitTimeout?: number

  /**
   * Specifies whether cookies should be cleared after each loop.
   *
   * @default true
   */
  clearCookies?: boolean

  /**
   * Speicifies the name of the test specified in the comments section
   */
  name?: string

  /**
   * Speicifies the description of the test specified in the comments section
   */
  description?: string

  /**
   * Take a screenshot of the page when a command fails, to aid in debugging.
   *
   * Screenshots are saved to `/flood/result/screenshots` in the test archive.
   */
  screenshotOnFailure?: boolean

  /**
   * Take a DOM snapshot of the page when a command fails, to aid in debugging.
   */
  DOMSnapshotOnFailure?: boolean
}

export interface StepOptions {
  /**
   * Take a screenshot on failure.
   * @default true
   */
  screenshotOnFailure?: boolean

  /**
   * Timeout in seconds for all wait and navigation operations.
   * @default `30` seconds
   */
  timeout?: number
}

/**
 * Declares the settings for the test
 *
 * @export
 * @param {TestOptions} settings
 */
export declare function setup(settings: TestOptions): void

/**
 * Declares each step in your test. This must go within the callback from `test()`.
 *
 * @export
 * @param {string} name Step Name
 * @param {(driver: Driver) => Promise<void>} fn Actual implementation of step
 */
export declare function step(name: string, fn: (driver: Driver) => Promise<void>)
export declare function step(
  name: string,
  options: StepOptions,
  fn: (driver: Driver) => Promise<void>,
)

export declare class Driver {
  /**
   * Clears browser cookies.
   */
  public clearCookies(): Promise<void>

  /**
   * Instructs the browser to navigate to a specific page. This is typically used as the
   * entrypoint to your test, as the first instruction it is also responsible for creating
   * a new Browser tab for this page to load into.
   *
   * @param {string} url
   * @returns {Promise<void>}
   * @memberof Driver
   */
  public visit(url: string, options?: NavigationOptions): Promise<void>

  /**
   * Sends a click event to the element located at `selector`. If the element is
   * currently outside the viewport it will first scroll to that element.
   *
   * @param {string} selector
   */
  public click(selector: string): Promise<void>

  public rightClick(selector: string): Promise<void>

  public middleClick(selector: string): Promise<void>

  public selectByValue(locatorOrSelector: Locator | string, value: string): Promise<void>

  public selectByIndex(locatorOrSelector: Locator | string, index: string): Promise<void>

  public selectByText(locatorOrSelector: Locator | string, text: string): Promise<void>

  public clearSelect(locatorOrSelector: Locator | string): Promise<void>

  public fillIn(selector: string, text: string, options?: { delay: number }): Promise<void>

  public blur(selector: string): Promise<void>

  public focus(selector: string): Promise<void>

  public pressKey(keyCode: string, options?: { text: string }): Promise<void>

  public keyboardDown(keyCode: string, options?: { text: string }): Promise<void>

  /**
   * @deprecated
   * @param selector
   * @param options
   */
  public waitForElement(selector: string, options?: {}): Promise<any>

  /**
   * Uses the provided locator to find the first element it matches, returning an ElementHandle.
   */
  public findElement(locator: string | Locator): Promise<ElementHandle>

  /**
   * Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles
   */
  public findAllElements(locator: string | Locator): Promise<ElementHandle[]>

  /**
   * Creates a waiter which will pause the test until a condition is met or a timeout is reached.
   *
   * You can use either a numeric value in milliseconds to wait for a specific time,
   * or a {@linkcode Condition}, for more advanced capabilities.
   */
  public wait(timeoutOrCondition: Condition | number): Promise<boolean>
}

declare class ElementHandle {
  /**
   * Fetches the value of an attribute on this element
   *
   * @param {string} name HTMLElementAttribute
   * @returns {Promise<string>}
   * @memberof ElementHandle
   */
  attr(name: string): Promise<string>

  /**
   * Sends a click event to the element attached to this handle. If the element is
   * currently outside the viewport it will first scroll to that element.
   */
  public click(): Promise<void>

  /**
   * Sends a right click event to the element attached to this handle. If the element is
   * currently outside the viewport it will first scroll to that element.
   */
  public rightClick(): Promise<void>

  /**
   * Sends a middle click event to the element attached to this handle. If the element is
   * currently outside the viewport it will first scroll to that element.
   */
  public middleClick(): Promise<void>

  /**
   * Takes a screenshot of this element and saves it to the results folder with a random name.
   */
  public screenshot(options?): Promise<void>

  /**
   * Retrieves the text content of this element excluding leading and trailing whitespace.
   */
  public text(): Promise<string>

  /**
   * Sends a sequence of key presses to this element.
   */
  public press(...keys: Array<Key | string>): Promise<void>

  /**
   * Schedules a command to clear the value of this element.
   * This command has no effect if the underlying DOM element is neither a text
   * INPUT, SELECT, or a TEXTAREA element.
   */
  public clear(): Promise<void>

  /**
   * Locates an element using the supplied {@linkcode Locator}, returning an {@linkcode ElementHandle}
   */
  public findElement(Locator: Locator): Promise<ElementHandle>

  /**
   * Locates all elements using the supplied {@linkcode Locator}, returning an array of {@linkcode ElementHandle}'s
   */
  public findElements(Locator: Locator): Promise<ElementHandle[]>
}

declare class Condition {}
declare class Locator {}

declare class By {
  /**
   * Locates an element using a CSS (jQuery) style selector
   * @param selector
   */
  static css(selector: string): Locator

  /**
   * Finds an element by ID
   * @param id
   */
  static id(id: string): Locator

  /**
   * Recives a function which runs on the page and returns an element or elements.
   * @param func
   */
  static js(func: () => ElementHandle): Locator

  /**
   * Locates a link containing the specified text.
   * @param text
   */
  static linkText(text: string): Locator

  /**
   * Locates a link (<a>) containing some of the specified text
   * @param text
   */
  static partialLinkText(text: string): Locator

  /**
   * Finds an element containing a specified attribute value
   * @param tagName TagName to scope selection to
   * @param attrName The attribute to search for
   * @param attrValue Optional attribute value to compare
   */
  static attr(tagName: string, attrName: string, attrValue?: string): Locator

  /**
   * Locates an element using an XPath expression
   * @param path XPath selector
   */
  static xpath(path: string): Locator
}

declare class Until {
  /**
   * Creates a condition that will wait until the input driver is able to switch to the designated frame.
   *
   * The target frame may be specified as:
   * - numeric index into window.frames for the currently selected frame.
   * - ElementHandle, which must references a FRAME or IFRAME element on the current page.
   * - locator which may be used to first locate a FRAME or IFRAME on the current page before attempting to switch to it.
   *
   * Upon successful resolution of this condition, the driver will be left focused on the new frame.
   */
  static ableToSwitchToFrame(): Condition

  /**
   * Creates a condition that waits for an alert to be opened. Upon success, the returned promise will be fulfilled with the handle for the opened alert
   * @param alertText
   */
  static alertIsPresent(alertText: string): Condition

  /**
   * Creates a condition that will wait for the given element to be disabled
   * @param selectorOrLocator
   */
  static elementIsDisabled(selectorOrLocator: ElementHandle | Locator | string): Condition

  /**
   * Creates a condition that will wait for the given element to be enabled
   * @param selectorOrLocator
   */
  static elementIsEnabled(selectorOrLocator: ElementHandle | Locator | string): Condition

  /**
   * Creates a condition that will wait for the given element to be deselected.
   * @param selectorOrLocator
   */
  static elementIsSelected(selectorOrLocator: ElementHandle | Locator | string): Condition

  /**
   * Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user
   * @param selectorOrLocator
   */
  static elementIsNotSelected(selectorOrLocator: ElementHandle | Locator | string): Condition

  /**
   * Creates a condition that will wait for the given element to be selected.
   * @param selectorOrLocator
   */
  static elementIsVisible(selectorOrLocator: ElementHandle | Locator | string): Condition

  /**
   * Creates a condition that will wait for the given element to become visible.
   * @param selectorOrLocator
   */
  static elementIsNotVisible(selectorOrLocator: ElementHandle | Locator | string): Condition
  static elementLocated(selectorOrLocator: ElementHandle | Locator | string): Condition
  static elementTextContains(
    selectorOrLocator: ElementHandle | Locator | string,
    text: string,
  ): Condition
  static elementTextIs(selectorOrLocator: ElementHandle | Locator | string, text: string): Condition
  static elementTextMatches(
    selectorOrLocator: ElementHandle | Locator | string,
    regex: RegExp,
  ): Condition

  /**
   * Creates a condition that will loop until at least one element is found with the given locator.
   */
  static elementsLocated(selectorOrLocator: Locator | string): Condition

  /**
   * Creates a condition that will wait for the given element to become stale.
   * An element is considered stale once it is removed from the DOM, or a new page has loaded.
   */
  static stalenessOf(selectorOrLocator: Locator | string): Condition
  static titleContains(title: string): Condition
  static titleIs(title: string): Condition
  static titleMatches(title: RegExp): Condition
  static urlContains(url: string): Condition
  static urlIs(url: string): Condition
  static urlMatches(url: RegExp): Condition
}

export enum Key {
  NULL,
  CANCEL, // ^break
  HELP,
  BACK_SPACE,
  TAB,
  CLEAR,
  RETURN,
  ENTER,
  SHIFT,
  CONTROL,
  ALT,
  PAUSE,
  ESCAPE,
  SPACE,
  PAGE_UP,
  PAGE_DOWN,
  END,
  HOME,
  ARROW_LEFT,
  LEFT,
  ARROW_UP,
  UP,
  ARROW_RIGHT,
  RIGHT,
  ARROW_DOWN,
  DOWN,
  INSERT,
  DELETE,
  SEMICOLON,
  EQUALS,

  NUMPAD0,
  NUMPAD1,
  NUMPAD2,
  NUMPAD3,
  NUMPAD4,
  NUMPAD5,
  NUMPAD6,
  NUMPAD7,
  NUMPAD8,
  NUMPAD9,
  MULTIPLY,
  ADD,
  SEPARATOR,
  SUBTRACT,
  DECIMAL,
  DIVIDE,

  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12,

  COMMAND,
  META,
}

/** The navigation options. */
export interface NavigationOptions {
  /**
   * Maximum navigation time in milliseconds, pass 0 to disable timeout.
   * @default 30000
   */
  timeout?: number
  /**
   * When to consider navigation succeeded.
   * @default load Navigation is consider when the `load` event is fired.
   */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
}
