import { TweetBuilder } from './tweetBuilder'

console.log('start')
const tweetBuilder = new TweetBuilder('1460323737035677698')
void (async () => {
  try {
    // '1622000934535725057' age restricted tweet
    const tweet = await tweetBuilder.getAuthorId()
      .getCreatedAt()
      .getEditControls()
      .build()
    console.log(tweet)
  } catch (e: any) {
    console.log(e.toString())
  }
})()
