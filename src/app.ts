import { TwitterDriver } from './twitterDriver'

const twitterDriver = new TwitterDriver({})
console.log('start')
twitterDriver.getTweetContent('1621549616515653634')
twitterDriver.getTweetContent('1622063241760317440')
twitterDriver.getTweetContent('1622402492536594433')
twitterDriver.exec().then(console.log).catch(console.log)
