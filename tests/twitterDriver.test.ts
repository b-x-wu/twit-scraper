import { TweetGetter } from '../src/tweetGetter'
import { beforeAll, describe, expect, test } from '@jest/globals'

describe('TweetGetter', () => {
  let tweetGetter: TweetGetter
  beforeAll(async () => {
    tweetGetter = new TweetGetter()
    await tweetGetter.init('1460323737035677698')
  }, 10000)

  test('gets correct base tweet', async () => {
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

  test('gets correct created_at', async () => {
    await tweetGetter.getCreatedAt()

    const expectedCreatedAt = '2021-11-15T19:08:05.000Z'

    expect(tweetGetter.tweet?.created_at).toBe(expectedCreatedAt)
  })

  test('gets correct author id', async () => {
    await tweetGetter.getAuthorId()

    const expectedAuthorId = '2244994945'

    expect(tweetGetter.tweet?.author_id).toBe(expectedAuthorId)
  })

  test('gets correct edit controls', async () => {
    await tweetGetter.getEditControls()

    const expectedEditableUntil = '2021-11-15T19:38:05.069Z'
    const expectedIsEditEligible = true
    const expectedEditsRemaining = 5
    const expectedEditControls = {
      editable_until: expectedEditableUntil,
      is_edit_eligible: expectedIsEditEligible,
      edits_remaining: expectedEditsRemaining
    }

    expect(tweetGetter.tweet?.edit_controls).toStrictEqual(expectedEditControls)
  })
})
