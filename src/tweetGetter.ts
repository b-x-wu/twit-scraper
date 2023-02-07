import { type Tweet } from './types'
import puppeteer from 'puppeteer'

export class TweetGetter {
  tweetData: any
  id: string | undefined
  tweet: Tweet | undefined

  async init (id: string): Promise<void> {
    this.id = id
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.on('requestfinished', (request) => {
      void (async () => {
        const requestUrl = request.url()
        if (requestUrl.includes('TweetDetail')) {
          try {
            const instructions: any[] = (await request.response()?.json()).data.threaded_conversation_with_injections_v2.instructions
            this.tweetData = instructions?.find((instruction) => instruction.type === 'TimelineAddEntries')?.entries?.find((entry: any) => {
              return entry.entryId.match(/^tweet-\d+$/) != null
            })
          } catch (e: any) {
            console.log('Error getting data from response. Likely a preflight request. Skipping...')
          }
        }
      })()
    })

    await page.goto(`https://twitter.com/x/status/${id}`)
    await page.waitForNetworkIdle()
    await browser.close()

    this.getBaseTweet()
  }

  getBaseTweet (): void {
    if (this.id == null || this.tweetData == null) {
      throw new Error('Tweet data not initialized. Call this.init().')
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
}
