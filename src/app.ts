import { TwitterDriver } from './twitterDriver'

const twitterDriver = new TwitterDriver({})
twitterDriver.init().then((driver: TwitterDriver) => {
  driver.getTweet('1621549616515653634').then(console.log).catch(console.log)
}).catch(console.log)
