import express from 'express'
import { TweetBuilder } from './tweetBuilder'
import { TweetError } from './tweetError'
import { queryToCommaSeparatedString } from './utils'
import { type ApiSuccessResult, ErrorReason, type Tweet, type TweetField } from './types'
import cors from 'cors'

export const app = express()

app.use(cors())

app.get('/tweets', (req, res) => {
  void (async () => {
    const ids = queryToCommaSeparatedString(req.query.ids as string | string[] | undefined)?.split(',')
    if (ids == null) {
      const noIdsError = new TweetError(
        ErrorReason.INVALID_REQUEST,
        'Requests to the /tweets endpoint must contain at least one tweet id. None were provided.'
      )
      res.status(noIdsError.status).json(noIdsError)
      return
    }

    const tweetFields =
      queryToCommaSeparatedString(req.query['tweet.fields'] as string | string[] | undefined)?.split(',')

    const settledTweets = await Promise.allSettled(ids.map(async (id) => {
      return await new TweetBuilder(id, true).buildTweetFromFields(tweetFields as TweetField[] | undefined)
    }))

    const [fulfilledTweets, rejectedTweets] = settledTweets.reduce<[Array<PromiseFulfilledResult<Tweet>>, PromiseRejectedResult[]]>(
      (prev, curr) => {
        if (curr.status === 'fulfilled') { prev[0].push(curr) } else { prev[1].push(curr) }
        return prev
      },
      [[], []]
    )

    const response: ApiSuccessResult = { data: fulfilledTweets.map(fulfilledTweet => fulfilledTweet.value) }
    if (fulfilledTweets.length === 0) { res.status(400) }
    if (rejectedTweets.length > 0) { response.errors = rejectedTweets.map(rejectedTweet => rejectedTweet.reason) }
    res.json(response)
  })()
})

app.get('/tweets/:id', (req, res) => {
  void (async () => {
    const id = req.params.id
    const tweetFields =
        queryToCommaSeparatedString(req.query['tweet.fields'] as string | string[] | undefined)?.split(',')

    try {
      const tweet = await new TweetBuilder(id, true).buildTweetFromFields(tweetFields as TweetField[] | undefined)
      const response: ApiSuccessResult = { data: tweet } // TODO: add support for includes objects
      res.json(response)
    } catch (e: any) {
      const tweetError: TweetError = e
      res.status(tweetError.status).json({ errors: tweetError })
    }
  })()
})

app.get('*', (req, res) => {
  const error = new TweetError(ErrorReason.INVALID_REQUEST, 'Invalid enpoint accessed')
  res.status(400).json(error)
})
