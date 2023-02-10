import express from 'express'
import { TweetBuilder } from './tweetBuilder'
import { type TweetError } from './tweetError'
import dotenv from 'dotenv'
import { queryToCommaSeparatedString } from './utils'
import { type TweetField } from './types'

const app = express()
dotenv.config()

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.get('/tweets/:id', (req, res) => {
  void (async () => {
    const id = req.params.id
    const tweetFields =
      queryToCommaSeparatedString(req.query['tweet.fields'] as string | string[] | undefined)?.split(',')
    try {
      const tweet = await new TweetBuilder(id, true).buildTweetFromFields(tweetFields as TweetField[] | undefined)
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

app.listen(process.env.PORT ?? 3000)
