import { describe, expect, test } from '@jest/globals'
import { queryToCommaSeparatedString } from '../src/utils'

describe('queryToCommaSeparatedString', () => {
  test('returns correct query string from one query', async () => {
    const query = 'conversation_id,author_id,created_at'
    const actualQuery = queryToCommaSeparatedString(query)

    const expectedQuery = 'conversation_id,author_id,created_at'

    expect(actualQuery).toBe(expectedQuery)
  })

  test('returns correct query string from an array of queries', async () => {
    const query = ['conversation_id,author_id', 'created_at']
    const acualQuery = queryToCommaSeparatedString(query)

    const expectedQuery = 'conversation_id,author_id,created_at'

    expect(acualQuery).toBe(expectedQuery)
  })

  test('returns correct query from no queries', async () => {
    const query = undefined
    const actualQuery = queryToCommaSeparatedString(query)

    const expectedQuery = undefined

    expect(actualQuery).toBe(expectedQuery)
  })

  test('returns correct query from an object of queries', async () => {
    const query = { a: { b: ['conversation_id,author_id', 'created_at'] } }
    const actualQuery = queryToCommaSeparatedString(query as any)

    const expectedQuery = undefined

    expect(actualQuery).toBe(expectedQuery)
  })
})
