// This is a simple event emitter based on mitt.js
// It mainly changes the data model to use a Map and Set, rather than a
// regular object and an array.

import type { ActionsUnion } from "../redux/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MettHandler<EventName, Payload = any> = (
  payload: Payload,
  eventName: EventName,
) => void;

export type IMett<
  EventName extends ActionsUnion["type"] | "*",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Payload = any,
> = {
  on(eventName: EventName, callback: MettHandler<EventName, Payload>): void;
  off(eventName: EventName, callback: MettHandler<EventName, Payload>): void;
  emit(eventName: EventName, payload?: Payload | undefined): void;
};

export function mett<
  EventName extends ActionsUnion["type"] | "*",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Payload = any,
>(): IMett<EventName, Payload> {
  const mettEvents: Map<
    EventName | "*",
    Set<MettHandler<EventName, Payload>>
  > = new Map();

  return {
    on(eventName: EventName, callback: MettHandler<EventName, Payload>): void {
      const set = mettEvents.get(eventName);
      if (set) {
        set.add(callback);
      } else {
        mettEvents.set(eventName, new Set([callback]));
      }
    },
    off(eventName: EventName, callback: MettHandler<EventName, Payload>): void {
      const set = mettEvents.get(eventName);
      if (set) {
        set.delete(callback);
      }
    },
    emit(eventName: EventName, payload: Payload): void {
      const setName = mettEvents.get(eventName);

      if (setName) {
        setName.forEach(function mettEmitEachC(callback) {
          callback(payload, eventName);
        });
      }
      const setStar = mettEvents.get("*");
      if (setStar) {
        setStar.forEach(function mettEmitEachStar(callback) {
          callback(payload, eventName);
        });
      }
    },
  };
}
