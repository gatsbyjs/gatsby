import { flush, isFlushEnqueued } from "./page-data"

let isPendingStatus = false

export function isWebpackStatusPending(): boolean {
  return isPendingStatus
}

export function markWebpackStatusAsPending(): void {
  isPendingStatus = true
}

export function markWebpackStatusAsDone(): void {
  isPendingStatus = false
  if (isFlushEnqueued()) {
    flush()
  }
}
