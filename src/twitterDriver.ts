import { Builder, Browser, By, until, type WebDriver } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome.js'
import * as dotenv from 'dotenv'
import { type Tweet } from './types'

export class TwitterDriver {
  jobs: Array<Promise<any>> = []
  options: Options

  // TODO: add more options and options for non chromium webdrivers
  constructor ({ binaryPath }: { binaryPath?: string }) {
    this.options = new Options().excludeSwitches('enable-logging').headless()

    if (binaryPath == null) {
      dotenv.config()
      if (process.env.CHROME_PATH != null) {
        this.options.setChromeBinaryPath(process.env.CHROME_PATH)
      }
    } else {
      this.options.setChromeBinaryPath(binaryPath)
    }
  }

  async newDriver (): Promise<WebDriver> {
    return await new Builder().forBrowser(Browser.CHROME).setChromeOptions(this.options).build()
  }

  async exec (): Promise<any> {
    const results = await Promise.all(this.jobs)
    this.jobs = []
    return results
  }

  getTweetContent (id: string): void {
    this.jobs.push((async (): Promise<Tweet> => {
      const driver = await this.newDriver()
      const tweetSelector = By.css('div.tweet-text')
      await driver.get(`https://www.sotwe.com/tweet/${id}`) // sotwe gets around age filter
      await driver.wait(until.elementLocated(tweetSelector))
      const tweetElement = await driver.findElement(tweetSelector)
      const tweetText = (await tweetElement.getText()).trim()
      await driver.close()
      return {
        id,
        text: tweetText,
        edit_history_tweet_ids: []
      }
    })())
  }

  getTweetHistoryIds (id: string): void {
    this.jobs.push((async (): Promise<string[]> => {
      const driver = await this.newDriver()
      await driver.get(`https://www.twitter.com/x/status/${id}/history`)
      await driver.wait(async () => {
        return (await driver.findElements(By.css('div[data-testid="empty_state_header_text"]'))).length > 0 ||
          (await driver.findElements(By.css('time'))).length > 0
      })

      // check if there is a history
      if ((await driver.findElements(By.css('div[data-testid="empty_state_header_text"]'))).length > 0) {
        return [id]
      }

      const tweetHistoryIds: string[] = []
      const timeElements = await driver.findElements(By.css('time'))
      for (const timeElement of timeElements) {
        const tweetUrl = await timeElement.findElement(By.xpath('./..')).getAttribute('href')
        const tweetIdMatch = tweetUrl.match(/^https:\/\/twitter\.com\/.*?\/.*?\/(.*)$/)
        if (tweetIdMatch != null) {
          tweetHistoryIds.push(tweetIdMatch[1])
        }
      }
      await driver.close()
      return tweetHistoryIds
    })())
  }
}
