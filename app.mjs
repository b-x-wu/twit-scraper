import App from 'express'
import { Builder, Browser, By, Key, until, Capabilities } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome.js'
import * as dotenv from 'dotenv'
dotenv.config()

const app = new App()

const getDriver = async () => {
  const options = new Options().setChromeBinaryPath(process.env.CHROME_PATH).excludeSwitches('enable-logging').headless()
  return await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
}

app.get('/', async (req, res) => {
  await (async function example() {
    const driver = await getDriver()
    try {
      await driver.get('https://www.twitter.com/');
      res.send('Hello, world!');
    } catch(e) {
      res.json({ message: e.toString() })
    } finally {
      await driver.quit();
    }
  })();
})

app.get('/tweets/:id', async (req, res) => {
  try {
    const id = req.params.id
    await (async function getTweet() {
      const driver = await getDriver()
      const tweetSelector = By.css('div.tweet-text')
      try {
        await driver.get(`https://www.sotwe.com/tweet/${id}`)
        await driver.wait(until.elementLocated(tweetSelector))
        const tweetElement = await driver.findElement(tweetSelector)
        const tweetText = (await tweetElement.getText()).trim()
        res.json({ id, text: tweetText })
      } catch(e) {
        res.json({ message: e.toString() })
      } finally {
        await driver.quit()
      }
    })()
  } catch(err) {
    res.json({message: err.toString()})
  }
})

app.listen(3000)
