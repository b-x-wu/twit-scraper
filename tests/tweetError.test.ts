import { describe, expect, test } from '@jest/globals'
import { ErrorReason } from '../src/types'
import { TweetError } from '../src/tweetError'

describe('TweetError', () => {
  test('has correct status for reason age-restricted-tweet', async () => {
    const tweetError = new TweetError(ErrorReason.AGE_RESTRICTED, 'This is an age restricted tweet.')

    const expectedStatus = 403

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason server-error', async () => {
    const tweetError = new TweetError(ErrorReason.SERVER_ERROR, 'Server error encountered.')

    const expectedStatus = 500

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason cannot-find-tweet', async () => {
    const tweetError = new TweetError(ErrorReason.CANNOT_FIND_TWEET, 'Unable to find tweet with this id.')

    const expectedStatus = 404

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason tweet-from-private-account', async () => {
    const tweetError = new TweetError(ErrorReason.PRIVATE_ACCOUNT, 'Tweet from private account.')

    const expectedStatus = 403

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason tweet-unavailable', async () => {
    const tweetError = new TweetError(ErrorReason.TWEET_UNAVAILABLE, 'Tweet is unavailable.')

    const expectedStatus = 403

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason undefined error reason', async () => {
    const tweetError = new TweetError('invalid error reason' as ErrorReason, 'Invalid.')

    const expectedStatus = 500

    expect(tweetError.status).toBe(expectedStatus)
  })
})
