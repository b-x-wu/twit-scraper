export interface Entity {
  start: number
  end: number
  tag: string
}

export enum ReferencedTweetTypes {
  RETWEETED = 'retweeted',
  REPLIED_TO = 'replied_to',
  QUOTED = 'quoted'
}

export interface Tweet {
  id: string
  text: string
  edit_history_tweet_ids: string[]
  attachments?: {
    poll_ids?: string[]
    media_keys?: string[]
  }
  author_id?: string
  conversation_id?: string
  created_at?: string // in the iso-8601 format
  edit_controls?: {
    edits_remaining: number
    is_edit_eligible: boolean
    editable_until: string // in the iso-8601 format
  }
  entities?: {
    cashtags?: Entity[]
    hashtags?: Entity[]
    mentions?: Entity[]
    urls?: Array<{
      start: number
      end: number
      url: string
    }>
  }
  in_reply_to_user_id?: string
  lang?: string // BCP47 language tag
  organic_metrics?: {
    impression_count: number
    like_count: number
    reply_count: number
    retweet_count: number
  }
  possibly_sensitive?: boolean
  referenced_tweets?: Array<{
    type: ReferencedTweetTypes
    id: string
  }>
  reply_settings?: 'everyone' | 'mentionedUsers' | 'following'
}

export interface User {
  id: string
  name: string
  username: string
  created_at?: string // in the iso-8601 format
  description?: string
  entities?: { // same as entities in the Tweets object, but with the user's profile description
    cashtags?: Entity[]
    hashtags?: Entity[]
    mentions?: Entity[]
    urls?: Array<{
      start: number
      end: number
      url: string
    }>
  }
  // TODO: should we be skipping location?
  pinned_tweet_id?: string
  profile_image_url?: string
  protected?: boolean
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
  url?: string // url in the user profile
  verified: boolean
}

export interface Media {
  media_key: string
  type: 'string' | 'gif' | 'video'
  url?: string
  duration?: string
  height?: number
  width?: number
  preview_image_url: string
  public_metrics?: {
    view_count?: number
  }
  alt_text?: string
}
