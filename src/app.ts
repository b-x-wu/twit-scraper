import { TwitterDriver } from './twitterDriver'

const twitterDriver = new TwitterDriver({})
twitterDriver.getTweetContent('1460323737035677698')
twitterDriver.getTweetHistoryIds('1460323737035677698')
twitterDriver.exec().then(console.log).catch(console.log)
