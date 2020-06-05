let isPendingStatus = false

export function isPending(): boolean {
  return isPendingStatus
}

export function markAsPending(): void {
  isPendingStatus = true
}

export function markAsDone(): void {
  isPendingStatus = false
}
