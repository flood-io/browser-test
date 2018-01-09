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
   * Creates a waiter which will pause the test until a condition is met or a timeout is reached.
   *
   * You can use either a numeric value in seconds to wait for a specific time,
   * or a {@linkcode Condition}, for more flexible conditions.
   */
  public wait(timeoutOrCondition: Condition | number): Promise<boolean>

  /**
   * Sends a click event to the element located at `selector`. If the element is
   * currently outside the viewport it will first scroll to that element.
   */
  public click(selectorOrLocator: string | Locator, options?: ClickOptions): Promise<void>

  /**
   * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
   * currently outside the viewport it will first scroll to that element.
   */
  public doubleClick(locatable: Locatable, options?: ClickOptions): Promise<void>

  /**
   * Selects an option within a <select> tag using the value of the <option> element.
   */
  public selectByValue(locatable: Locatable, ...values: string[]): Promise<void>

  /**
   * Selects an option within a <select> tag by its index in the list.
   */
  public selectByIndex(locatable: Locatable, index: string): Promise<void>

  /**
   * Selects an option within a <select> tag by matching its visible text.
   */
  public selectByText(locatable: Locatable, text: string): Promise<void>

  /**
   * Clears the selected value of an input or select control.
   */
  public clear(locatable: Locatable): Promise<void>

  /**
   * Types a string into an <input> control, key press by key press.
   */
  public type(locatable: Locatable, text: string, options?: { delay: number }): Promise<void>

  public blur(locator: Locatable): Promise<void>

  public focus(locator: Locatable): Promise<void>

  public press(
    keyCode: string,
    options?: {
      /**
       * A string of text to type
       */
      text?: string /**
       * Delay between key presses, in milliseconds.
       */
      delay?: number
    },
  ): Promise<void>

  /**
   * Takes a screenshot of the whole page and saves it to the results folder with a random sequential name.
   */
  public takeScreenshot(options?: ScreenshotOptions): Promise<void>

  /**
   * Uses the provided locator to find the first element it matches, returning an ElementHandle.
   */
  public findElement(locator: string | Locator): Promise<ElementHandle>

  /**
   * Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles
   */
  public findAllElements(locator: string | Locator): Promise<ElementHandle[]>
}

declare class ElementHandle {
  /**
   * Fetches the value of an attribute on this element
   *
   * @param {string} name HTMLElementAttribute
   * @returns {Promise<string>}
   * @memberof ElementHandle
   */
  public getAttribute(name: string): Promise<string>

  /**
   * Sends a click event to the element attached to this handle. If the element is
   * currently outside the viewport it will first scroll to that element.
   */
  public click(options?: ClickOptions): Promise<void>

  /**
   * Schedules a command to clear the value of this element.
   * This command has no effect if the underlying DOM element is neither a text
   * INPUT, SELECT, or a TEXTAREA element.
   */
  public clear(): Promise<void>

  public sendKeys(...keys: string[]): Promise<void>

  public type(text: string): Promise<void>

  /**
   * Sends focus to this element so that it receives keyboard inputs.
   */
  public focus(): Promise<void>

  /**
   * Clears focus from this element so that it will no longer receive keyboard inputs.
   */
  public blur(): Promise<void>

  /**
   * Takes a screenshot of this element and saves it to the results folder with a random name.
   */
  public takeScreenshot(options?: ScreenshotOptions): Promise<void>

  /**
   * Locates an element using the supplied {@linkcode Locator}, returning an {@linkcode ElementHandle}
   */
  public findElement(locator: Locator | string): Promise<ElementHandle>

  /**
   * Locates all elements using the supplied {@linkcode Locator}, returning an array of {@linkcode ElementHandle}'s
   */
  public findElements(locator: Locator | string): Promise<ElementHandle[]>

  public tagName(): Promise<string>

  public getId(): Promise<string>

  public getAttribute(key: string): Promise<string>

  public isSelected(): Promise<boolean>

  public isSelectable(): Promise<boolean>

  public isDisplayed(): Promise<boolean>

  public isEnabled(): Promise<boolean>

  /**
   * Retrieves the text content of this element excluding leading and trailing whitespace.
   */
  public text(): Promise<string>

  public size(): Promise<{ width: number; height: number }>

  public location(): Promise<{ x: number; y: number }>
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
   * Locates all elements whose `textContent` equals the given
   * substring and is not hidden by CSS.
   *
   * @param {string} text The string to check for in a elements's visible text.
   */
  static visibleText(text: string): Locator

  /**
   * Locates all elements whose `textContent` contains the given
   * substring and is not hidden by CSS.
   *
   * @param {string} text The substring to check for in a elements's visible text.
   */
  static partialVisibleText(text: string): Locator

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
  static elementIsDisabled(locatable: Locatable): Condition

  /**
   * Creates a condition that will wait for the given element to be enabled
   * @param selectorOrLocator
   */
  static elementIsEnabled(locatable: Locatable): Condition

  /**
   * Creates a condition that will wait for the given element to be deselected.
   * @param selectorOrLocator
   */
  static elementIsSelected(locatable: Locatable): Condition

  /**
   * Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user
   * @param selectorOrLocator
   */
  static elementIsNotSelected(locatable: Locatable): Condition

  /**
   * Creates a condition that will wait for the given element to be selected.
   * @param selectorOrLocator
   */
  static elementIsVisible(locatable: Locatable): Condition

  /**
   * Creates a condition that will wait for the given element to become visible.
   * @param selectorOrLocator
   */
  static elementIsNotVisible(locatable: Locatable): Condition

  /**
   * Creates a condition which will wait until the element is located on the page.
   */
  static elementLocated(locatable: Locatable): Condition

  /**
   * Creates a condition which will wait until the element's text content contains
   * the target text.
   */
  static elementTextContains(locatable: Locatable, text: string): Condition

  /**
   * Creates a condition which will wait until the element's text exactly matches the target text,
   * excluding leading and trailing whitespace.
   */
  static elementTextIs(locatable: Locatable, text: string): Condition

  /**
   * Creates a condition which will wait until the element's text matches the target Regular Expression.
   */
  static elementTextMatches(locatable: Locatable, regex: RegExp): Condition

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

export type Locatable = Locator | ElementHandle | string

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

export enum MouseButtons {
  LEFT = 'left',
  RIGHT = 'right',
  MIDDLE = 'middle',
}
export interface ClickOptions {
  /** defaults to left */
  button?: MouseButtons
  /** defaults to 1 */
  clickCount?: number
  /**
   * Time to wait between mousedown and mouseup in milliseconds.
   * Defaults to 0.
   */
  delay?: number
}

/** Defines the screenshot options. */
export interface ScreenshotOptions {
  /**
   * The file path to save the image to. The screenshot type will be inferred from file extension.
   * If `path` is a relative path, then it is resolved relative to current working directory.
   * If no path is provided, the image won't be saved to the disk.
   */
  path?: string
  /**
   * The screenshot type.
   * @default png
   */
  type?: 'jpeg' | 'png'
  /** The quality of the image, between 0-100. Not applicable to png images. */
  quality?: number
  /**
   * When true, takes a screenshot of the full scrollable page.
   * @default false
   */
  fullPage?: boolean
  /**
   * An object which specifies clipping region of the page.
   */
  clip?: BoundingBox
  /**
   * Hides default white background and allows capturing screenshots with transparency.
   * @default false
   */
  omitBackground?: boolean
}

export interface BoundingBox {
  /** The x-coordinate of top-left corner. */
  x: number
  /** The y-coordinate of top-left corner. */
  y: number
  /** The width. */
  width: number
  /** The height. */
  height: number
}
