import { TweetGetter } from './tweetGetter'

const tweetGetter = new TweetGetter()
console.log('start')
void (async () => {
  await tweetGetter.init('1460323737035677698')
  console.log(tweetGetter.tweet)
})()
