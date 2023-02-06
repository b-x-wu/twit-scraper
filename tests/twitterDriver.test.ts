import { TwitterDriver } from '../src/twitterDriver'
import { describe, expect, test } from '@jest/globals'

describe('get tweet', () => {
  test('gets correct tweet content', async () => {
    const twitterDriver = new TwitterDriver({})
    twitterDriver.getTweetContent('1587946525245816832')

    const actualOutput = (await twitterDriver.exec())[0].text
    const expectedOutput = 'We’re currently hard at work to make Twitter better for everyone, including developers! We’ve decided to cancel the #Chirp developer conference while we build some things that we’re excited to share with you soon.'

    expect(actualOutput).toBe(expectedOutput)
  })
})
