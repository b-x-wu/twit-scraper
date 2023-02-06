import { Builder, Browser, By, Key, until, Capabilities, type WebDriver } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome.js'
import * as dotenv from 'dotenv'

export class TwitterDriver {
  driver: WebDriver | undefined
  options: Options

  // TODO: add more options and options for non chromium webdrivers
  constructor ({ binaryPath, headless }: { binaryPath?: string, headless?: boolean }) {
    this.options = new Options().excludeSwitches('enable-logging').headless()
    if (binaryPath == null) {
      dotenv.config()
      this.options.setChromeBinaryPath(process.env.CHROME_PATH ?? './')
    } else {
      this.options.setChromeBinaryPath(binaryPath)
    }

    if (headless != null && headless) {
      this.options.headless()
    }
  }

  async init (): Promise<TwitterDriver> {
    this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(this.options).build()
    return this
  }
}
