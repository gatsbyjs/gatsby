// This is a simple event emitter based on mitt.js
// It mainly changes the data model to use a Map and Set, rather than a
// regular object and an array.

type MettHandler<EventName, Payload> = (
  e: Payload,
  eventName: EventName
) => void

export interface IMett {
  on(eventName: EventName, callback: MettHandler<EventName, Payload>): void
  off(eventName: EventName, callback: MettHandler<EventName, Payload>): void
  emit(eventName: EventName, e?: Payload): void
}

type EventName = string
type Payload = any

export function mett(): IMett {
  const mettEvents: Map<
    EventName,
    Set<MettHandler<EventName, Payload>>
  > = new Map()

  return {
    on(eventName: EventName, callback: MettHandler<EventName, Payload>): void {
      const set = mettEvents.get(eventName)
      if (set) {
        set.add(callback)
      } else {
        mettEvents.set(eventName, new Set([callback]))
      }
    },
    off(eventName: EventName, callback: MettHandler<EventName, Payload>): void {
      const set = mettEvents.get(eventName)
      if (set) {
        set.delete(callback)
      }
    },
    emit(eventName: EventName, e: Payload): void {
      const setName = mettEvents.get(eventName)
      if (setName) {
        setName.forEach(function mettEmitEachC(callback) {
          callback(e, eventName)
        })
      }
      const setStar = mettEvents.get(`*`)
      if (setStar) {
        setStar.forEach(function mettEmitEachStar(callback) {
          callback(e, eventName)
        })
      }
    },
  }
}
