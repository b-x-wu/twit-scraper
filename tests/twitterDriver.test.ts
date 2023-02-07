import { TweetGetter } from '../src/tweetGetter'
import { describe, expect, test } from '@jest/globals'

describe('TweetGetter', () => {
  test('gets correct base tweet', async () => {
    const tweetGetter = new TweetGetter()
    await tweetGetter.init('1460323737035677698')

    const expectedOutputId = '1460323737035677698'
    const expectedOutputText = 'Introducing a new era for the Twitter Developer Platform! \n' +
      '\n' +
      '📣The Twitter API v2 is now the primary API and full of new features\n' +
      '⏱Immediate access for most use cases, or apply to get more access for free\n' +
      '📖Removed certain restrictions in the Policy\n' +
      'https://t.co/Hrm15bkBWJ https://t.co/YFfCDErHsg'
    const expectedEditHistoryTweetIds = ['1460323737035677698']

    expect(tweetGetter.tweet).toStrictEqual({ id: expectedOutputId, text: expectedOutputText, edit_history_tweet_ids: expectedEditHistoryTweetIds })
    expect(tweetGetter.id).toBe(expectedOutputId)
  })
})
