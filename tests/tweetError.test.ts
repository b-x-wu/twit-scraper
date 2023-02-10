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
})
