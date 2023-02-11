// adapted from https://stackoverflow.com/a/59498882/21190150

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { app } from '../src/app'
import request, { type SuperAgentRequest } from 'superagent'
import { type Server } from 'node:http'

const PORT = 8080
const get = async (url: string): Promise<SuperAgentRequest> => request.get(`http://localhost:${PORT}${url}`)

describe('/tweets/:id endpoint', () => {
  let server: Server
  beforeAll((done) => {
    server = app.listen(PORT, done)
  })

  afterAll((done) => {
    server.close(done)
  })

  test('GET base tweet', async () => {
    const { status: actualStatus, body: actualBody } = await get('/tweets/1624154305564401671')

    const expectedStatus = 200
    const expectedBody = {
      data: {
        id: '1624154305564401671',
        text: "i didn't go to music school for this https://t.co/5m8lawEtRA",
        edit_history_tweet_ids: [
          '1624154305564401671'
        ]
      }
    }

    expect(actualStatus).toBe(expectedStatus)
    expect(actualBody).toStrictEqual(expectedBody)
  }, 10000)

  test('GET tweet with fields', async () => {
    const { status: actualStatus, body: actualBody } = await get('/tweets/1624154305564401671?tweet.fields=author_id,conversation_id,created_at')

    const expectedStatus = 200
    const expectedBody = {
      data: {
        id: '1624154305564401671',
        text: "i didn't go to music school for this https://t.co/5m8lawEtRA",
        edit_history_tweet_ids: [
          '1624154305564401671'
        ],
        author_id: '1464763938688667648',
        conversation_id: '1624154305564401671',
        created_at: '2023-02-10T21:12:16.000Z'
      }
    }

    expect(actualStatus).toBe(expectedStatus)
    expect(actualBody).toStrictEqual(expectedBody)
  }, 10000)

  test('GET tweet with fields that do not exist', async () => {
    const { status: actualStatus, body: actualBody } = await get('/tweets/1624154305564401671?tweet.fields=entities,referenced_tweets,in_reply_to_user_id')

    const expectedStatus = 200
    const expectedBody = {
      data: {
        id: '1624154305564401671',
        text: "i didn't go to music school for this https://t.co/5m8lawEtRA",
        edit_history_tweet_ids: [
          '1624154305564401671'
        ]
      }
    }

    expect(actualStatus).toBe(expectedStatus)
    expect(actualBody).toStrictEqual(expectedBody)
  }, 10000)

  test('GET tweet with age restriction fails', async () => {
    const expectedBody = {
      errors: {
        reason: 'not-authorized-for-resource',
        detail: 'Tweet is age restricted. Unauthorized to serve this tweet.',
        data: {
          id: '1623732372108890112',
          tombstoneText: 'Age-restricted adult content. This content might not be appropriate for people under 18 years old. To view this media, you’ll need to log in to Twitter. Learn more'
        },
        status: 403
      }
    }

    await expect(get('/tweets/1623732372108890112')).rejects.toMatchObject({ response: { body: expectedBody } })
  }, 10000)

  // Not testing private accounts for privacy reasons

  test('GET tweet that does not exist fails', async () => {
    const expectedBody = {
      errors: {
        reason: 'resource-not-found',
        detail: 'Tweet data was not initialized. Cannot get base tweet. Tweet may not exist.',
        data: {
          id: '12353432'
        },
        status: 404
      }
    }

    await expect(get('/tweets/12353432')).rejects.toMatchObject({ response: { body: expectedBody } })
  }, 10000)
})
