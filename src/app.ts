import { TweetBuilder } from './tweetBuilder'

console.log('start')
void (async () => {
  try {
    // '1622000934535725057' age restricted tweet
    const tweet = await new TweetBuilder('1620933138598993924', true)
      .getAuthorId()
      .getCreatedAt()
      .getEditControls()
      .getInReplyToUserId()
      .getConversationId()
      .getReferencedTweets()
      .getAttachments()
      .getEntities()
      .build()
    console.log(JSON.stringify(tweet, null, 2))
  } catch (e: any) {
    console.log(e.toString())
  }
})()
