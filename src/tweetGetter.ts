import { type Tweet } from './types'
import puppeteer from 'puppeteer'

export class TweetGetter {
  tweetData: any
  id: string | undefined
  tweet: Tweet | undefined
  verbose: boolean = false

  async init (id: string, verbose?: boolean): Promise<void> {
    this.id = id
    this.verbose = verbose ?? false
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
                return entry.entryId.match(/^tweet-\d+$/) != null
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

    await page.goto(`https://twitter.com/x/status/${id}`)
    await page.waitForNetworkIdle()
    await browser.close()

    await this.getBaseTweet()
  }

  // TODO: change this to a builder model
  async getBaseTweet (): Promise<void> {
    if (this.id == null || this.tweetData == null) {
      throw new Error('Tweet data not initialized. Call this.init().')
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

  async getCreatedAt (): Promise<void> {
    if (this.id == null || this.tweetData == null || this.tweet == null) {
      throw new Error('Tweet data not initialized. Call this.init().')
    }

    const createdAt: string = this.tweetData.content?.itemContent?.tweet_results?.result?.legacy?.created_at
    if (createdAt == null) {
      throw new Error('Error retrieving created_at data from tweet object.')
    }

    const createdAtDate = new Date(createdAt)
    this.tweet.created_at = createdAtDate.toISOString()
  }

  async getAuthorId (): Promise<void> {
    if (this.id == null || this.tweetData == null || this.tweet == null) {
      throw new Error('Tweet data not initialized. Call this.init().')
    }

    const authorId: string = this.tweetData.content?.itemContent?.tweet_results?.result?.core?.user_results?.result?.rest_id
    if (authorId == null) {
      throw new Error('Error retrieving author_id data from tweet object.')
    }

    this.tweet.author_id = authorId
  }

  async getEditControls (): Promise<void> {
    if (this.id == null || this.tweetData == null || this.tweet == null) {
      throw new Error('Tweet data not initialized. Call this.init().')
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
  }
}
