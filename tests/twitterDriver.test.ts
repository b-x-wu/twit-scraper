import { TwitterDriver } from '../src/twitterDriver'
import { describe, expect, test } from '@jest/globals'

describe('get tweet', () => {
  test('gets correct tweet content', async () => {
    const twitterDriver = new TwitterDriver({})
    twitterDriver.getTweetContent('1460323737035677698')

    const actualOutput = (await twitterDriver.exec())[0].text
    const expectedOutput = 'Introducing a new era for the Twitter Developer Platform! 📣The Twitter API v2 is now the primary API and full of new features ⏱Immediate access for most use cases, or apply to get more access for free 📖Removed certain restrictions in the Policy https://t.co/Hrm15bkBWJ https://t.co/YFfCDErHsg'

    expect(actualOutput).toBe(expectedOutput)
  }, 10000)

  test('gets correct tweet history ids for tweet with no history', async () => {
    const twitterDriver = new TwitterDriver({})
    twitterDriver.getTweetHistoryIds('1460323737035677698')

    const actualOutput = (await twitterDriver.exec())[0]
    const expectedOutput = '1460323737035677698'

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
