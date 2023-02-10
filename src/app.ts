import express from 'express'
import { TweetBuilder } from './tweetBuilder'
import { type TweetError } from './tweetError'
import { TweetField } from './types'

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
        includes: {} // TODO: add support for includes objects
      })
    } catch (e: any) {
      const tweetError: TweetError = e
      res.status(tweetError.status).json({ errors: e })
    }
  })()
})

app.listen(3000)

console.log('start')
void (async () => {
  try {
    // '1622000934535725057' age restricted tweet
    const tweet = await new TweetBuilder('1623387211910488075', true)
      .buildTweetFromFields([
        TweetField.REPLY_SETTINGS,
        TweetField.PUBLIC_METRICS,
        TweetField.SOURCE
      ])
    console.log(JSON.stringify(tweet, null, 2))
  } catch (e: any) {
    console.log(e.toString())
  }
})()
