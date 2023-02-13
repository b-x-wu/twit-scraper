import { type TweetError } from './tweetError'

export interface Hashtag {
  start: number
  end: number
  tag: string
}

export interface Mention {
  start: number
  end: number
  username: string
}

export interface Url {
  start: number
  end: number
  url: string
  expanded_url: string
  display_url: string
  // TODO: should there be an unwound url field here?
}

export enum ReferencedTweetTypes {
  RETWEETED = 'retweeted',
  REPLIED_TO = 'replied_to',
  QUOTED = 'quoted'
}

export interface PublicMetrics {
  retweet_count: number
  reply_count: number
  like_count: number
  quote_count: number
  impression_count?: number
}

export enum ReplySettings {
  EVERYONE = 'everyone',
  MENTIONED_USERS = 'mentioned_users',
  FOLLOWERS = 'followers'
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
  // TODO: find some way to get geo information
  // TODO: find some way to get context annotations
  entities?: {
    // TODO: find some way to get annotations
    // TODO: I cant find an endpoint where cashtags exist
    hashtags?: Hashtag[]
    mentions?: Mention[]
    urls?: Url[]
  }
  // TODO: figure out what to do with withheld content information
  //       right now, finding tweets to test on makes me very uncomfy
  in_reply_to_user_id?: string
  lang?: string // BCP47 language tag
  public_metrics?: PublicMetrics
  // TODO: find some way to do oauth for non public metrics
  // TODO: find some way to do oauth for organic metrics
  // TODO: find some way to do oauth for promoted metrics
  possibly_sensitive?: boolean
  referenced_tweets?: Array<{
    type: ReferencedTweetTypes
    id: string
  }>
  reply_settings?: ReplySettings
  source?: string
}

export interface User {
  id: string
  name: string
  username: string
  created_at?: string // in the iso-8601 format
  description?: string
  entities?: { // same as entities in the Tweets object, but with the user's profile description
    cashtags?: Hashtag[]
    hashtags?: Hashtag[]
    mentions?: Hashtag[]
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

export enum ErrorReason {
  RESOURCE_NOT_FOUND = 'resource-not-found',
  SERVER_ERROR = 'server-error',
  RESOURCE_UNAUTHORIZED = 'not-authorized-for-resource',
  INVALID_REQUEST = 'invalid-request'
}
export const reasonToStatusMap: Map<ErrorReason, number> = new Map<ErrorReason, number>([
  [ErrorReason.RESOURCE_NOT_FOUND, 404],
  [ErrorReason.INVALID_REQUEST, 400],
  [ErrorReason.SERVER_ERROR, 500],
  [ErrorReason.RESOURCE_UNAUTHORIZED, 403]
])

export enum TweetField {
  ATTACHMENTS = 'attachments',
  AUTHOR_ID = 'author_id',
  CONVERSATION_ID = 'conversation_id',
  CREATED_AT = 'created_at',
  EDIT_CONTROLS = 'edit_controls',
  ENTITIES = 'entities',
  IN_REPLY_TO_USER_ID = 'in_reply_to_user_id',
  LANG = 'lang',
  PUBLIC_METRICS = 'public_metrics',
  POSSIBLY_SENSITIVE = 'possibly_sensitive',
  REFERENCED_TWEETS = 'referenced_tweets',
  REPLY_SETTINGS = 'reply_settings',
  SOURCE = 'source'
  // skipping id and text because they're included by default
}

export interface ApiSuccessResult {
  data: any
  includes?: any
  errors?: TweetError[]
}
