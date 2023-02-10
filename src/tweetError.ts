import { ErrorReason } from './types'

export class TweetError extends Error {
  reason: ErrorReason
  detail: string
  data: any | undefined
  status: number

  constructor (reason: ErrorReason, detail: string, data?: any) {
    super(detail)
    this.reason = reason
    this.detail = detail
    this.data = data

    const reasonToStatusMap: Map<ErrorReason, number> = new Map<ErrorReason, number>([
      [ErrorReason.AGE_RESTRICTED, 403],
      [ErrorReason.CANNOT_FIND_TWEET, 404],
      [ErrorReason.SERVER_ERROR, 500]
    ])
    this.status = reasonToStatusMap.get(this.reason) ?? 500
  }
}
