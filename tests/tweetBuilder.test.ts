import { TweetBuilder } from '../src/tweetBuilder'
import { describe, expect, test } from '@jest/globals'

describe('TweetGetter', () => {
  test('gets correct base tweet', async () => {
    const actualTweet = await (new TweetBuilder('1460323737035677698')).build()

    const expectedOutputId = '1460323737035677698'
    const expectedOutputText = 'Introducing a new era for the Twitter Developer Platform! \n' +
      '\n' +
      '📣The Twitter API v2 is now the primary API and full of new features\n' +
      '⏱Immediate access for most use cases, or apply to get more access for free\n' +
      '📖Removed certain restrictions in the Policy\n' +
      'https://t.co/Hrm15bkBWJ https://t.co/YFfCDErHsg'
    const expectedEditHistoryTweetIds = ['1460323737035677698']

    expect(actualTweet).toStrictEqual({ id: expectedOutputId, text: expectedOutputText, edit_history_tweet_ids: expectedEditHistoryTweetIds })
  }, 10000)

  test('gets correct created_at', async () => {
    const actualTweet = await (new TweetBuilder('1460323737035677698')).getCreatedAt().build()

    const expectedCreatedAt = '2021-11-15T19:08:05.000Z'

    expect(actualTweet.created_at).toBe(expectedCreatedAt)
  }, 10000)

  test('gets correct author id', async () => {
    const actualTweet = await (new TweetBuilder('1460323737035677698')).getAuthorId().build()

    const expectedAuthorId = '2244994945'

    expect(actualTweet.author_id).toBe(expectedAuthorId)
  }, 10000)

  test('gets correct edit controls', async () => {
    const actualTweet = await (new TweetBuilder('1460323737035677698')).getEditControls().build()

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

  test('gets correct conversation id', async () => {
    const actualTweet = await (new TweetBuilder('1460323737035677698')).getConversationId().build()

    const expectedConversationId = '1460323737035677698'

    expect(actualTweet.conversation_id).toBe(expectedConversationId)
  }, 10000)

  test('gets correct conversation id for response', async () => {
    const actualResponseTweet = await (new TweetBuilder('1623463792700014595'))
      .getConversationId()
      .build()

    const expectedConversationId = '1623446320198344708'

    expect(actualResponseTweet.conversation_id).toBe(expectedConversationId)
  }, 10000)

  test('gets correct in response to user id', async () => {
    const actualResponseTweet = await (new TweetBuilder('1623460456898744320'))
      .getInReplyToUserId()
      .build()

    const expectedInResponseToUserId = '5162861'

    expect(actualResponseTweet.in_reply_to_user_id).toBe(expectedInResponseToUserId)
  }, 10000)

  test('gets correct quoted and replied to referenced tweets', async () => {
    const actualResponseTweet = await (new TweetBuilder('1263155690476011523'))
      .getReferencedTweets()
      .build()

    const expectedReferencedTweets = [
      { type: 'quoted', id: '1263154811236749313' },
      { type: 'replied_to', id: '1263145271946551300' }
    ]

    expect(actualResponseTweet.referenced_tweets).toStrictEqual(expectedReferencedTweets)
  }, 10000)

  test('gets correct retweeted referenced tweets', async () => {
    const actualResponseTweet = await (new TweetBuilder('1623202372360208386'))
      .getReferencedTweets()
      .build()

    const expectedReferencedTweets = [{ type: 'retweeted', id: '1622981513959669762' }]

    expect(actualResponseTweet.referenced_tweets).toStrictEqual(expectedReferencedTweets)
  }, 10000)

  test('gets correct attachments poll ids', async () => {
    const actualTweet = await (new TweetBuilder('1623364562601885696'))
      .getAttachments()
      .build()

    const expectedAttachments = { poll_ids: ['1623364561951678468'] }

    expect(actualTweet.attachments).toStrictEqual(expectedAttachments)
  }, 10000)

  test('gets correct attachments media keys', async () => {
    const actualTweet = await (new TweetBuilder('1619500153337171968'))
      .getAttachments()
      .build()

    const expectedAttachments = { media_keys: ['3_1619500025255714817', '3_1619500012597313536'] }

    expect(actualTweet.attachments).toStrictEqual(expectedAttachments)
  }, 10000)

  test('gets correct entities', async () => {
    const actualTweet = await (new TweetBuilder('1620933138598993924'))
      .getEntities()
      .build()

    const expectedEntities = {
      hashtags: [
        {
          start: 229,
          end: 243,
          tag: 'ClimateAction'
        }
      ],
      mentions: [
        {
          start: 3,
          end: 3,
          username: 'Google'
        }
      ],
      urls: [
        {
          display_url: 'youtube.com/watch?v=IeyV56…',
          expanded_url: 'https://www.youtube.com/watch?v=IeyV56WBOzE',
          url: 'https://t.co/qKmDoah3p6',
          start: 205,
          end: 228
        }
      ]
    }

    expect(actualTweet.entities).toStrictEqual(expectedEntities)
  }, 10000)

  test('gets correct public metrics', async () => {
    const actualTweet = await (new TweetBuilder('1623563614979325952'))
      .getPublicMetrics()
      .build()

    const expectedLikeCount = 1508
    const expectedRetweetCount = 99
    const expectedReplyCount = 8
    const expectedQuoteCount = 6
    const expectedImpressionCount = 93816

    expect(actualTweet.public_metrics?.like_count).toBeGreaterThanOrEqual(expectedLikeCount)
    expect(actualTweet.public_metrics?.retweet_count).toBeGreaterThanOrEqual(expectedRetweetCount)
    expect(actualTweet.public_metrics?.reply_count).toBeGreaterThanOrEqual(expectedReplyCount)
    expect(actualTweet.public_metrics?.quote_count).toBeGreaterThanOrEqual(expectedQuoteCount)
    expect(actualTweet.public_metrics?.impression_count).toBeGreaterThanOrEqual(expectedImpressionCount)
  }, 10000)
})
