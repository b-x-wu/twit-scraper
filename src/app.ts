import { TweetBuilder } from './tweetBuilder'

console.log('start')
void (async () => {
  try {
    // '1622000934535725057' age restricted tweet
    const tweet = await new TweetBuilder('1623202372360208386', true)
      .getAuthorId()
      .getCreatedAt()
      .getEditControls()
      .getInReplyToUserId()
      .getConversationId()
      .getReferencedTweets()
      .build()
    console.log(tweet)
  } catch (e: any) {
    console.log(e.toString())
  }
})()
