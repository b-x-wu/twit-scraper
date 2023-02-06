import { TwitterDriver } from '../src/twitterDriver'
import { describe, expect, test } from '@jest/globals'

describe('get tweet', () => {
  test('gets correct tweet content', async () => {
    const twitterDriver = new TwitterDriver({})
    twitterDriver.getTweetContent('1587946525245816832')

    const actualOutput = (await twitterDriver.exec())[0].text
    const expectedOutput = 'We’re currently hard at work to make Twitter better for everyone, including developers! We’ve decided to cancel the #Chirp developer conference while we build some things that we’re excited to share with you soon.'

    expect(actualOutput).toBe(expectedOutput)
  }, 10000)

  test('gets correct tweet history ids for tweet with no history', async () => {
    const twitterDriver = new TwitterDriver({})
    twitterDriver.getTweetHistoryIds('1587946525245816832')

    const actualOutput = (await twitterDriver.exec())[0]
    const expectedOutput = '1587946525245816832'

    expect(actualOutput.length).toBe(1)
    expect(actualOutput[0]).toBe(expectedOutput)
  }, 10000)

  test('gets correct tweet history ids for tweet with history', async () => {
    const twitterDriver = new TwitterDriver({})
    twitterDriver.getTweetHistoryIds('1622579998346608641')

    const actualOutput = (await twitterDriver.exec())[0]
    const expectedOutput = ['1622579998346608641', '1622579699498254338']

    expect(actualOutput.length).toBe(2)
    expect(actualOutput[0]).toBe(expectedOutput[0])
    expect(actualOutput[1]).toBe(expectedOutput[1])
  }, 10000)
})
