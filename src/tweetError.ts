import { type ErrorReason, reasonToStatusMap } from './types'

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

    this.status = reasonToStatusMap.get(this.reason) ?? 500
  }
}
