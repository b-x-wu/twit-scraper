import { TweetBuilder } from './tweetBuilder'

console.log('start')
void (async () => {
  try {
    // '1622000934535725057' age restricted tweet
    const tweet = await new TweetBuilder('1529447517645025280', true)
      .getAuthorId()
      .getCreatedAt()
      .getEditControls()
      .getInReplyToUserId()
      .getConversationId()
      .getReferencedTweets()
      .getAttachments()
      .getEntities()
      .getPublicMetrics()
      .getIsPossiblySensitive()
      .getLanguage()
      .getReplySettings()
      .getSource()
      .build()
    console.log(JSON.stringify(tweet, null, 2))
  } catch (e: any) {
    console.log(e.toString())
  }
})()
