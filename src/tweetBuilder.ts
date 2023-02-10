import { type Hashtag, ReferencedTweetTypes, type Tweet, type Url, type Mention, type PublicMetrics, ReplySettings, ErrorReason, TweetField } from './types'
import puppeteer, { type Page } from 'puppeteer'
import { TweetError } from './tweetError'

export class TweetBuilder {
  tweetData: any
  tweetPage: Page | undefined
  id: string
  tweet: Tweet | undefined
  verbose: boolean = false
  jobs: Array<() => Promise<void>> = []

  constructor (id: string, verbose?: boolean) {
    this.id = id
    this.verbose = verbose ?? false
  }

  private async init (page: Page): Promise<void> {
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

    await this.getBaseTweet()
  }

  private async getBaseTweet (): Promise<void> {
    if (this.id == null || this.tweetData == null) {
      throw new TweetError(
        ErrorReason.CANNOT_FIND_TWEET,
        'Tweet data was not initialized. Cannot get base tweet. Tweet may not exist.',
        { id: this.id }
      )
    }

    // TODO: figure out what to do with age restricted tweets
    if (this.tweetData.content?.itemContent?.tweet_results?.result?.__typename === 'TweetTombstone') {
      const tombstoneText: string | undefined = this.tweetData.content?.itemContent?.tweet_results?.result?.tombstone?.text?.text

      if (tombstoneText == null) {
        throw new TweetError(
          ErrorReason.TWEET_UNAVAILABLE,
          'Tweet is made unavailable due to unknown reasons. Could not find tombstone text.',
          { id: this.id }
        )
      }

      if (tombstoneText.includes('this account owner limits who can view their Tweets')) {
        throw new TweetError(
          ErrorReason.PRIVATE_ACCOUNT,
          'This tweet is from a private account. Unauthorized to serve this tweet.',
          { id: this.id, tombstoneText }
        )
      }

      if (tombstoneText.includes('This content might not be appropriate for people under 18 years old.')) {
        throw new TweetError(
          ErrorReason.AGE_RESTRICTED,
          'Tweet is age restricted. Unauthorized to serve this tweet.',
          { id: this.id, tombstoneText }
        )
      }

      throw new TweetError(
        ErrorReason.TWEET_UNAVAILABLE,
        'Tweet is made unavailable due to unknown reasons. Tombstone encountered.',
        { id: this.id, tombstoneText }
      )
    }

    // TODO: catch the case of the private account

    const id = this.tweetData.content?.itemContent?.tweet_results?.result?.rest_id
    const text = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.full_text
    const editHistoryTweetIds = this.tweetData.content?.itemContent?.tweet_results?.result?.edit_control?.edit_tweet_ids

    if (id == null || text == null || editHistoryTweetIds == null) {
      throw new TweetError(
        ErrorReason.SERVER_ERROR,
        'Error retrieving data from tweet object.',
        { id, text, editHistoryTweetIds }
      )
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
          console.log('This tweet has no referenced tweets. No "referenced_tweets" field added.')
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
          console.log('This tweet has no attachments. No "attachments" field added.')
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
          console.log('This tweet has no entities. No "entities" field added.')
        }
        return
      }

      if (this.tweet != null) {
        this.tweet.entities = entities
      }
    })

    return this
  }

  getPublicMetrics (): TweetBuilder {
    this.jobs.push(async () => {
      const likeCount: number = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.favorite_count
      const retweetCount: number = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.retweet_count
      const replyCount: number = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.reply_count
      const quoteCount: number = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.quote_count

      if (likeCount == null || retweetCount == null || replyCount == null || quoteCount == null) {
        throw new TweetError(
          ErrorReason.SERVER_ERROR,
          'Error retrieving public metrics.',
          { id: this.id, likeCount, retweetCount, replyCount, quoteCount }
        )
      }
      const publicMetrics: PublicMetrics = {
        like_count: likeCount,
        retweet_count: retweetCount,
        reply_count: replyCount,
        quote_count: quoteCount
      }

      const viewCount: string = this.tweetData.content?.itemContent?.tweet_results?.result?.views?.count
      if (viewCount == null) {
        if (this.verbose) {
          console.log('No view count available. This tweet may have been tweeted before view count implementation.')
        }
      } else {
        publicMetrics.impression_count = parseInt(viewCount)
      }

      if (this.tweet != null) {
        this.tweet.public_metrics = publicMetrics
      }
    })

    return this
  }

  getIsPossiblySensitive (): TweetBuilder {
    this.jobs.push(async () => {
      const isPossiblySensitive = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.possibly_sensitive

      if (isPossiblySensitive == null) {
        throw new TweetError(
          ErrorReason.SERVER_ERROR,
          'Error retrieving possibly_sensitive field.',
          { id: this.id, isPossiblySensitive }
        )
      }

      if (this.tweet != null) {
        this.tweet.possibly_sensitive = isPossiblySensitive
      }
    })

    return this
  }

  getLanguage (): TweetBuilder {
    this.jobs.push(async () => {
      const language = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.lang

      if (language == null) {
        throw new TweetError(
          ErrorReason.SERVER_ERROR,
          'Error retrieving lang field.',
          { id: this.id, language }
        )
      }

      if (this.tweet != null) {
        this.tweet.lang = language
      }
    })

    return this
  }

  getReplySettings (): TweetBuilder {
    this.jobs.push(async () => {
      if (this.tweet == null) {
        return
      }

      const conversationControl = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.conversation_control
      if (conversationControl == null) {
        this.tweet.reply_settings = ReplySettings.EVERYONE
        return
      }

      if (conversationControl.policy === 'Community') {
        this.tweet.reply_settings = ReplySettings.FOLLOWERS
        return
      }

      if (conversationControl.policy === 'ByInvitation') {
        this.tweet.reply_settings = ReplySettings.MENTIONED_USERS
        return
      }

      if (this.verbose) {
        console.log('No reply setting added. Unrecognized conversation control policy encountered:', conversationControl.policy)
      }
    })

    return this
  }

  getSource (): TweetBuilder {
    this.jobs.push(async () => {
      const sourceElementString: string = this.tweetData.content?.itemContent?.tweet_results?.result?.source
      if (sourceElementString == null) {
        throw new TweetError(
          ErrorReason.SERVER_ERROR,
          'Could not find the source field.',
          { id: this.id, sourceElementString }
        )
      }

      const sourceMatch = sourceElementString.match(/^<a.*?>(.*)<\/a>$/)
      if (sourceMatch == null) {
        throw new TweetError(
          ErrorReason.SERVER_ERROR,
          'Unrecognized source string format.',
          { id: this.id, sourceElementString }
        )
      }

      if (this.tweet != null) {
        this.tweet.source = sourceMatch[1]
      }
    })

    return this
  }

  async build (): Promise<Tweet> {
    const browser = await puppeteer.launch()
    this.tweetPage = await browser.newPage()

    await this.init(this.tweetPage)

    if (this.id == null || this.tweetData == null || this.tweet == null) {
      throw new TweetError(
        ErrorReason.SERVER_ERROR,
        'Tweet data was not initialized. Cannot get tweet fields.',
        { id: this.id, tweetData: this.tweetData, tweet: this.tweet }
      )
    }

    await Promise.allSettled(this.jobs.map(async (job) => { await job.call(this) }))

    await browser.close()
    this.tweetPage = undefined
    return this.tweet
  }

  async buildTweetFromFields (tweetFields: TweetField[] | undefined): Promise<Tweet> {
    // check if there are no fields to add
    if (tweetFields == null || tweetFields.length === 0) {
      return await this.build()
    }

    const tweetFieldToMethodMap: Map<TweetField, () => TweetBuilder> =
      new Map<TweetField, () => TweetBuilder>([
        [TweetField.ATTACHMENTS, this.getAttachments],
        [TweetField.AUTHOR_ID, this.getAuthorId],
        [TweetField.CONVERSATION_ID, this.getConversationId],
        [TweetField.CREATED_AT, this.getCreatedAt],
        [TweetField.EDIT_CONTROLS, this.getEditControls],
        [TweetField.ENTITIES, this.getEntities],
        [TweetField.IN_REPLY_TO_USER_ID, this.getInReplyToUserId],
        [TweetField.LANG, this.getLanguage],
        [TweetField.PUBLIC_METRICS, this.getPublicMetrics],
        [TweetField.POSSIBLY_SENSITIVE, this.getIsPossiblySensitive],
        [TweetField.REFERENCED_TWEETS, this.getReferencedTweets],
        [TweetField.REPLY_SETTINGS, this.getReplySettings],
        [TweetField.SOURCE, this.getSource]
      ])

    tweetFields.map((tweetField) => tweetFieldToMethodMap.get(tweetField))
      .filter((buildingMethod) => buildingMethod != null)
      .forEach((buildingMethod) => buildingMethod?.call(this))

    return await this.build()
  }
}
