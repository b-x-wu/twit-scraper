import express from 'express'
import { TweetBuilder } from './tweetBuilder'
import { type TweetError } from './tweetError'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.get('/tweets/:id', (req, res) => {
  void (async () => {
    const id = req.params.id
    try {
      const tweet = await new TweetBuilder(id, true).build()
      res.json({
        data: tweet,
        includes: {} // TODO: work on includes
      })
    } catch (e: any) {
      const tweetError: TweetError = e
      res.status(tweetError.status).json({ errors: e })
    }
  })()
})

app.listen(3000)

// console.log('start')
// void (async () => {
//   try {
//     // '1622000934535725057' age restricted tweet
//     const tweet = await new TweetBuilder('1529447517645025280', true)
//       .getAuthorId()
//       .getCreatedAt()
//       .getEditControls()
//       .getInReplyToUserId()
//       .getConversationId()
//       .getReferencedTweets()
//       .getAttachments()
//       .getEntities()
//       .getPublicMetrics()
//       .getIsPossiblySensitive()
//       .getLanguage()
//       .getReplySettings()
//       .getSource()
//       .build()
//     console.log(JSON.stringify(tweet, null, 2))
//   } catch (e: any) {
//     console.log(e.toString())
//   }
// })()
