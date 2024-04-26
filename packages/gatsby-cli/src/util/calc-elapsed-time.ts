import convertHrtime from "convert-hrtime";

export function calcElapsedTime(startTime: [number, number]): string {
  const elapsed = process.hrtime(startTime);

  // @ts-ignore Argument of type '[number, number]' is not assignable to parameter of type 'bigint'.ts(2345)
  return convertHrtime(elapsed)["seconds"].toFixed(3);
}
