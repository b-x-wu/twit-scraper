import { describe, expect, test } from '@jest/globals'
import { ErrorReason } from '../src/types'
import { TweetError } from '../src/tweetError'

describe('TweetError', () => {
  test('has correct status for reason ' + ErrorReason.RESOURCE_UNAUTHORIZED, async () => {
    const tweetError = new TweetError(ErrorReason.RESOURCE_UNAUTHORIZED, 'This resource is not authorized.')

    const expectedStatus = 403

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason ' + ErrorReason.SERVER_ERROR, async () => {
    const tweetError = new TweetError(ErrorReason.SERVER_ERROR, 'Server error encountered.')

    const expectedStatus = 500

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason ' + ErrorReason.RESOURCE_NOT_FOUND, async () => {
    const tweetError = new TweetError(ErrorReason.RESOURCE_NOT_FOUND, 'Resource not found.')

    const expectedStatus = 404

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason ' + ErrorReason.INVALID_REQUEST, async () => {
    const tweetError = new TweetError(ErrorReason.INVALID_REQUEST, 'Invalid request.')

    const expectedStatus = 404

    expect(tweetError.status).toBe(expectedStatus)
  })

  test('has correct status for reason undefined error reason', async () => {
    const tweetError = new TweetError('invalid error reason' as ErrorReason, 'Invalid.')

    const expectedStatus = 500

    expect(tweetError.status).toBe(expectedStatus)
  })
})
