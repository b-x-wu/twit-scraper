import { TwitterDriver } from './twitterDriver'

const twitterDriver = new TwitterDriver({})
twitterDriver.getTweetContent('1622402492536594433')
twitterDriver.getTweetHistoryIds('1622402492536594433')
twitterDriver.exec().then(console.log).catch(console.log)
