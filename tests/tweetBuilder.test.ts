import { TweetBuilder } from '../src/tweetBuilder'
import { beforeEach, describe, expect, test } from '@jest/globals'

describe('TweetGetter', () => {
  let tweetBuilder: TweetBuilder
  beforeEach(async () => {
    tweetBuilder = new TweetBuilder('1460323737035677698')
  })

  test('gets correct base tweet', async () => {
    const actualTweet = await tweetBuilder.build()

    const expectedOutputId = '1460323737035677698'
    const expectedOutputText = 'Introducing a new era for the Twitter Developer Platform! \n' +
      '\n' +
      '📣The Twitter API v2 is now the primary API and full of new features\n' +
      '⏱Immediate access for most use cases, or apply to get more access for free\n' +
      '📖Removed certain restrictions in the Policy\n' +
      'https://t.co/Hrm15bkBWJ https://t.co/YFfCDErHsg'
    const expectedEditHistoryTweetIds = ['1460323737035677698']

    expect(actualTweet).toStrictEqual({ id: expectedOutputId, text: expectedOutputText, edit_history_tweet_ids: expectedEditHistoryTweetIds })
    expect(tweetBuilder.id).toBe(expectedOutputId)
  }, 10000)

  test('gets correct created_at', async () => {
    const actualTweet = await tweetBuilder.getCreatedAt().build()

    const expectedCreatedAt = '2021-11-15T19:08:05.000Z'

    expect(actualTweet.created_at).toBe(expectedCreatedAt)
  }, 10000)

  test('gets correct author id', async () => {
    const actualTweet = await tweetBuilder.getAuthorId().build()

    const expectedAuthorId = '2244994945'

    expect(actualTweet.author_id).toBe(expectedAuthorId)
  }, 10000)

  test('gets correct edit controls', async () => {
    const actualTweet = await tweetBuilder.getEditControls().build()

    const expectedEditableUntil = '2021-11-15T19:38:05.069Z'
    const expectedIsEditEligible = true
    const expectedEditsRemaining = 5
    const expectedEditControls = {
      editable_until: expectedEditableUntil,
      is_edit_eligible: expectedIsEditEligible,
      edits_remaining: expectedEditsRemaining
    }

    expect(actualTweet.edit_controls).toStrictEqual(expectedEditControls)
  }, 10000)
})
