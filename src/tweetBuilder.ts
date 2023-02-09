import { type Tweet } from './types'
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
              console.log(e)
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
      if (this.id == null || this.tweetData == null || this.tweet == null) {
        throw new Error('Tweet data not initialized.')
      }

      const createdAt: string = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.created_at

      const createdAtDate = new Date(createdAt)
      this.tweet.created_at = createdAtDate.toISOString()
    })

    return this
  }

  getAuthorId (): TweetBuilder {
    this.jobs.push(async () => {
      if (this.id == null || this.tweetData == null || this.tweet == null) {
        throw new Error('Tweet data not initialized.')
      }

      const authorId: string = this.tweetData.content?.itemContent?.tweet_results?.result?.core?.user_results?.result?.rest_id

      this.tweet.author_id = authorId
    })

    return this
  }

  getEditControls (): TweetBuilder {
    this.jobs.push(async () => {
      if (this.id == null || this.tweetData == null || this.tweet == null) {
        throw new Error('Tweet data not initialized.')
      }

      const editControls: any = this.tweetData.content?.itemContent?.tweet_results?.result?.edit_control
      const editableUntilMsecs: string = editControls?.editable_until_msecs
      const isEditEligible: boolean = editControls?.is_edit_eligible
      const editsRemaining: string = editControls?.edits_remaining

      this.tweet.edit_controls = {
        editable_until: (new Date(parseInt(editableUntilMsecs))).toISOString(),
        is_edit_eligible: isEditEligible,
        edits_remaining: parseInt(editsRemaining)
      }
    })

    return this
  }

  getConversationId (): TweetBuilder {
    this.jobs.push(async () => {
      if (this.id == null || this.tweetData == null || this.tweet == null) {
        throw new Error('Tweet data not initialized.')
      }

      const conversationId = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.conversation_id_str

      this.tweet.conversation_id = conversationId
    })

    return this
  }

  getInReplyToUserId (): TweetBuilder {
    this.jobs.push(async () => {
      if (this.id == null || this.tweetData == null || this.tweet == null) {
        throw new Error('Tweet data not initialized.')
      }

      const inReplyToUserId = this.tweetData.content?.itemContent?.tweet_results?.reslut?.legacy?.in_reply_to_user_id_str

      this.tweet.in_reply_to_user_id = inReplyToUserId
    })

    return this
  }

  async build (): Promise<Tweet> {
    await this.init()
    await Promise.all(this.jobs.map(async (job) => { await job.call(this) }))

    if (this.tweet == null) {
      throw new Error('Error building tweet')
    }

    return this.tweet
  }
}
