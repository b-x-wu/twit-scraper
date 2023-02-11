# Twit-Scraper

A free version of Twitter's API.

## Scope

I'm going to try to hit the readonly tweets and users endpoints and only concern myself with the tweet, user, and media objects (and only some of the fields therein). I will consider everything else to be out of scope. More specifics on which fields and which endpoints are hit can be found in the Documentation section.

## Documentation

### Object Models

<details>
<summary>Typescript Interface</summary>
<br>
<pre><code class="language-typescript">export interface Tweet {
  id: string
  text: string
  edit_history_tweet_ids: string[]
  attachments?: {
    poll_ids?: string[]
    media_keys?: string[]
  }
  author_id?: string
  conversation_id?: string
  created_at?: string // date string in the iso-8601 format
  edit_controls?: {
    edits_remaining: number
    is_edit_eligible: boolean
    editable_until: string // date string in the iso-8601 format
  }
  entities?: {
    hashtags?: Array&lt;{
      start: number
      end: number
      tag: string
    }&gt;
    mentions?: Array&lt;{
      start: number
      end: number
      username: string
    }&gt;
    urls?: Array&lt;{
      start: number
      end: number
      url: string
      expanded_url: string
      display_url: string
    }&gt;
  }
  in_reply_to_user_id?: string
  lang?: string // BCP47 language tag
  public_metrics?: {
    retweet_count: number
    reply_count: number
    like_count: number
    quote_count: number
    impression_count?: number
  }
  possibly_sensitive?: boolean
  referenced_tweets?: Array&lt;{
    type: 'retweeted' | 'replied_to' | 'quoted'
    id: string
  }&gt;
  reply_settings?: 'everyone' | 'mentioned_users' | 'followers'
  source?: string
}</code></pre>
</details>

### Endpoints

`/tweets`

- Provide a list of tweet ids as a query parameter

`/tweets/:id`

`/users/:id/timelines/reverse_chronological`

- Allows you to retrieve a collection of the most recent Tweets and Retweets posted by you and users you follow. This endpoint can return every Tweet created on a timeline over the last 7 days as well as the most recent 800 regardless of creation date.

`/users/:id/tweets`

`/users/:id/mentions`

`/tweets/search/recent`

`/tweets/search/all`

`/tweets/counts/recent`

`/tweets/counts/all`

`/tweets/:id/retweeted_by`

`/tweets/:id/quote_tweets`

`/tweets/:id/liking_users`

`/users/:id/liked_tweets`

`/users`

`/users/:id`

`/users/by`

- specified by their usernames in the query params

`/users/by/username/:username`

`/users/:id/following`

`/users/:id/followers`
