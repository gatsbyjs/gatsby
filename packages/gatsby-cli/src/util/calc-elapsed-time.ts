import convertHrtime from "convert-hrtime"

export function calcElapsedTime(startTime: [number, number]): string {
  const elapsed = process.hrtime(startTime)

  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}
