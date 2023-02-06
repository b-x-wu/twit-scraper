import { Builder, Browser, By, until, type WebDriver } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome.js'
import * as dotenv from 'dotenv'
import { type Tweet } from './types'

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

  async getTweet (id: string): Promise<Tweet> {
    if (this.driver == null) {
      throw new Error('Driver is uninitialized.')
    }

    const tweetSelector = By.css('div.tweet-text')
    await this.driver.get(`https://www.sotwe.com/tweet/${id}`)
    await this.driver.wait(until.elementLocated(tweetSelector))
    const tweetElement = await this.driver.findElement(tweetSelector)
    const tweetText = (await tweetElement.getText()).trim()
    return {
      id,
      text: tweetText,
      edit_history_tweet_ids: []
    }
  }
}
