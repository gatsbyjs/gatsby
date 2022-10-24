"use client"

export let a, b
export var c, d
export const e = 1, f = 2
export function functionName() {}
export class ClassName {}
export const { g, h: foo } = { g: "baz", h: 101 }
export const [i, j] = ["baz", 101]
export function withJSX() {
  return <div>hello world</div>
}
