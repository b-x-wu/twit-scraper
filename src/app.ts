import { TweetBuilder } from './tweetBuilder'

console.log('start')
void (async () => {
  try {
    // '1622000934535725057' age restricted tweet
    const tweet = await new TweetBuilder('1623446320198344708', true)
      .getAuthorId()
      .getCreatedAt()
      .getEditControls()
      .getInReplyToUserId()
      .getConversationId()
      .build()
    console.log(tweet)
  } catch (e: any) {
    console.log(e.toString())
  }
})()
