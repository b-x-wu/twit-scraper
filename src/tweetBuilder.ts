import { type Hashtag, ReferencedTweetTypes, type Tweet, type Url, type Mention } from './types'
import puppeteer from 'puppeteer'

export class TweetBuilder {
  tweetData: any
  id: string
  tweet: Tweet | undefined
  verbose: boolean = false
  jobs: Array<() => Promise<void>> = []

  constructor (id: string, verbose?: boolean) {
    this.id = id
    this.verbose = verbose ?? false
  }

  private async init (): Promise<void> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.on('requestfinished', (request) => {
      void (async () => {
        const requestUrl = request.url()
        if (requestUrl.includes('TweetDetail')) {
          try {
            const requestResponse = request.response()
            const responseBuffer = await requestResponse?.buffer()
            const instructions: any[] = JSON.parse(responseBuffer?.toString() ?? '{}').data?.threaded_conversation_with_injections_v2?.instructions
            this.tweetData = this.tweetData != null
              ? this.tweetData
              : instructions?.find((instruction) => instruction.type === 'TimelineAddEntries')?.entries?.find((entry: any) => {
                const entryId: string = entry?.entryId ?? ''
                const match = entryId.match(/^\w.*?-(\d.*)$/)
                return match != null && match[1] === this.id
              })
          } catch (e: any) {
            if (this.verbose) {
              console.log('Error getting data from response. Likely a preflight request. Skipping...')
            }
          }
        }
      })()
    })

    await page.goto(`https://twitter.com/x/status/${this.id}`)
    await page.waitForNetworkIdle()
    await browser.close()

    await this.getBaseTweet()
  }

  private async getBaseTweet (): Promise<void> {
    if (this.id == null || this.tweetData == null) {
      throw new Error('Tweet data not initialized.')
    }

    // TODO: figure out what to do with age restricted tweets
    if (this.tweetData.content?.itemContent?.tweet_results?.result?.__typename === 'TweetTombstone') {
      throw new Error('Encountered tombstone instead of tweet. Tweet may be age restricted')
    }

    const id = this.tweetData.content?.itemContent?.tweet_results?.result?.rest_id
    const text = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.full_text
    const editHistoryTweetIds = this.tweetData.content?.itemContent?.tweet_results?.result?.edit_control?.edit_tweet_ids

    if (id == null || text == null || editHistoryTweetIds == null) {
      throw new Error('Error retrieving data from tweet object.')
    }

    if (this.tweet == null) {
      this.tweet = { id, text, edit_history_tweet_ids: editHistoryTweetIds }
      return
    }

    this.tweet.id = id
    this.tweet.text = text
    this.tweet.edit_history_tweet_ids = editHistoryTweetIds
  }

  getCreatedAt (): TweetBuilder {
    this.jobs.push(async () => {
      const createdAt: string = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.created_at

      const createdAtDate = new Date(createdAt)
      if (this.tweet != null) {
        this.tweet.created_at = createdAtDate.toISOString()
      }
    })

    return this
  }

  getAuthorId (): TweetBuilder {
    this.jobs.push(async () => {
      const authorId: string = this.tweetData.content?.itemContent?.tweet_results?.result?.core?.user_results?.result?.rest_id

      if (this.tweet != null) {
        this.tweet.author_id = authorId
      }
    })

    return this
  }

  getEditControls (): TweetBuilder {
    this.jobs.push(async () => {
      const editControls: any = this.tweetData.content?.itemContent?.tweet_results?.result?.edit_control
      const editableUntilMsecs: string = editControls?.editable_until_msecs
      const isEditEligible: boolean = editControls?.is_edit_eligible
      const editsRemaining: string = editControls?.edits_remaining

      if (this.tweet != null) {
        this.tweet.edit_controls = {
          editable_until: (new Date(parseInt(editableUntilMsecs))).toISOString(),
          is_edit_eligible: isEditEligible,
          edits_remaining: parseInt(editsRemaining)
        }
      }
    })

    return this
  }

  getConversationId (): TweetBuilder {
    this.jobs.push(async () => {
      const conversationId = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.conversation_id_str

      if (this.tweet != null) {
        this.tweet.conversation_id = conversationId
      }
    })

    return this
  }

  getInReplyToUserId (): TweetBuilder {
    this.jobs.push(async () => {
      const inReplyToUserId = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.in_reply_to_user_id_str
      if (inReplyToUserId == null) {
        if (this.verbose) {
          console.log('This tweet is not in response to a user. No "in_reply_to_user_id" field added.')
        }
        return
      }

      if (this.tweet != null) {
        this.tweet.in_reply_to_user_id = inReplyToUserId
      }
    })

    return this
  }

  getReferencedTweets (): TweetBuilder {
    this.jobs.push(async () => {
      const referencedTweets: Array<{ type: ReferencedTweetTypes, id: string }> = []

      // check for quoted
      const quotedStatusId = this.tweetData.content?.itemContent?.tweet_results?.result?.quoted_status_result?.result?.rest_id
      if (quotedStatusId != null) {
        referencedTweets.push({
          type: ReferencedTweetTypes.QUOTED,
          id: quotedStatusId
        })
      }

      // check for replied
      const repliedToId = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.in_reply_to_status_id_str
      if (repliedToId != null) {
        referencedTweets.push({
          type: ReferencedTweetTypes.REPLIED_TO,
          id: repliedToId
        })
      }

      // check for retweet
      const retweetedId = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.retweeted_status_result?.result?.rest_id
      if (retweetedId != null) {
        referencedTweets.push({
          type: ReferencedTweetTypes.RETWEETED,
          id: retweetedId
        })
      }

      if (referencedTweets.length === 0) {
        if (this.verbose) {
          console.log('This tweet has no referenced tweets.')
        }
        return
      }

      if (this.tweet != null) {
        this.tweet.referenced_tweets = referencedTweets
      }
    })

    return this
  }

  getAttachments (): TweetBuilder {
    this.jobs.push(async () => {
      const attachments: { media_keys?: string[], poll_ids?: string[] } = {}

      // get media keys
      const medias = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.extended_entities?.media
      if (medias != null) {
        const mediaKeys = medias.map((media: any) => media?.media_key).filter((mediaKey: any) => mediaKey != null)
        if (mediaKeys.length !== 0) {
          attachments.media_keys = mediaKeys
        }
      }

      // get poll ids
      const card = this.tweetData.content?.itemContent?.tweet_results?.result?.card
      if (card != null) {
        const cardName: string | null = card.legacy?.name
        if (cardName?.match(/^poll/) != null) {
          const pollIdMatch = (card.rest_id as string).match(/^card:\/\/(\d*)$/)
          if (pollIdMatch != null) {
            attachments.poll_ids = [pollIdMatch[1]]
          }
        }
      }

      if (Object.getOwnPropertyNames(attachments).length === 0) {
        if (this.verbose) {
          console.log('Tweet has no attachments.')
        }
        return
      }

      if (this.tweet != null) {
        this.tweet.attachments = attachments
      }
    })

    return this
  }

  getEntities (): TweetBuilder {
    this.jobs.push(async () => {
      const entitiesData = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.entities
      const entities: { hashtags?: Hashtag[], mentions?: Mention[], urls?: Url[] } = {}

      // get hashtags
      if (entitiesData.hashtags != null && (entitiesData.hashtags as any[]).length > 0) {
        entities.hashtags = (entitiesData.hashtags as any[]).map(
          hashtag => ({ start: hashtag.indices[0], end: hashtag.indices[1], tag: hashtag.text })
        )
      }

      // get mentions
      if (entitiesData.user_mentions != null && (entitiesData.user_mentions as any[]).length > 0) {
        entities.mentions = (entitiesData.user_mentions as any[]).map(
          mention => ({ start: mention.indices[0], end: mention.indices[0], username: mention.screen_name })
        )
      }

      // get urls
      if (entitiesData.urls != null && (entitiesData.urls as any[]).length > 0) {
        entities.urls = (entitiesData.urls as any[]).map(
          url => ({ display_url: url.display_url, expanded_url: url.expanded_url, url: url.url, start: url.indices[0], end: url.indices[1] })
        )
      }

      if (Object.getOwnPropertyNames(entities).length === 0) {
        if (this.verbose) {
          console.log('Tweet has no entities.')
        }
        return
      }

      if (this.tweet != null) {
        this.tweet.entities = entities
      }
    })

    return this
  }

  async build (): Promise<Tweet> {
    await this.init()

    if (this.id == null || this.tweetData == null || this.tweet == null) {
      throw new Error('Tweet data not initialized.')
    }

    await Promise.all(this.jobs.map(async (job) => { await job.call(this) }))

    if (this.tweet == null) {
      throw new Error('Error building tweet')
    }

    return this.tweet
  }
}
