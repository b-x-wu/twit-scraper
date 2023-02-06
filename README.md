# Twit-Scraper

A free version of Twitter's API.

## Scope

I'm going to try to hit the readonly tweets and users endpoints and only concern myself with the tweet, user, and media objects (and only some of the fields therein). I will consider everything else to be out of scope. More specifics on which fields and which endpoints are hit can be found in the Documentation section.

## Documentation

### Object Models

```typescript
interface Entity {
    start: number
    end: number
    tag: string
}

interface Tweet {
    id: string
    text: string
    edit_history_tweet_ids: string[]
    attachments?: {
        poll_ids?: string[]
        media_keys?: string[]
    }
    author_id?: string
    // skipping context_annotations
    conversation_id?: string
    created_at: string // in the iso-8601 format
    edit_controls?: {
        edits_remaining: number
        is_edit_eligible: boolean
        editable_until: string // in the iso-8601 format
    }
    entities?: {
        cashtags?: Entity[]
        hashtags?: Entity[]
        mentions?: Entity[]
        urls?: {
            start: number
            end: number
            url: string
            // skipping the rest of them
        }[]
    }
    in_reply_to_user_id?: string
    lang: string // BCP47 language tag
    organic_metrics?: {
        impression_count: number // replace with view count?
        like_count: number
        reply_count: number
        retweet_count: number
        // skipping url_link_clicks
        // skipping user_profile_clicks
    }
    possibly_sensitive?: true
    referenced_tweets?: {
        type: "replied_to" | "quoted"
        id: string
    }[]
    // skipping the rest
}

interface User {
    id: string
    name: string
    username: string // ie the handle
    created_at?: string // in the iso-8601 format
    description?: string
    entities?: { // same as entities in the Tweets object, but with the user's profile description
        cashtags?: Entity[]
        hashtags?: Entity[]
        mentions?: Entity[]
        urls?: {
            start: number
            end: number
            url: string
            // skipping the rest of them
        }[]
    }
    // skipping location
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
    // skipping withheld
}

interface Media {
    media_key: string
    type: "string" | "gif" | "video"
    url?: string
    duration?: string
    height?: number
    width?: number
    // skipping non_public_metrics
    // skipping organic_metrics
    preview_image_url: string
    // skipping promoted_metrics
    public_metrics?: {
        view_count?: number
    }
    alt_text?: string
    // skipping variants
}
```

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
