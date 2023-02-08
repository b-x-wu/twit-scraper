import { TweetGetter } from './tweetGetter'

const tweetGetter = new TweetGetter()
console.log('start')
void (async () => {
  try {
    // await tweetGetter.init('1622000934535725057') // age restricted tweet
    await tweetGetter.init('1460323737035677698')
    await tweetGetter.getCreatedAt()
    await tweetGetter.getAuthorId()
    await tweetGetter.getEditControls()
    console.log(tweetGetter.tweet)
  } catch (e: any) {
    console.log(e.toString())
  }
})()
