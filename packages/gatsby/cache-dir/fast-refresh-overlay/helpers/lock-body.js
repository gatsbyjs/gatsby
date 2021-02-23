// Copied from https://github.com/vercel/next.js
// License: MIT
// Copyright (c) 2021 Vercel, Inc.
//
// Entrypoint: react-dev-overlay/src/internal/components/Overlay/body-locker.ts

let previousBodyPaddingRight
let previousBodyOverflowSetting

let activeLocks = 0

export function lock() {
  setTimeout(() => {
    if (activeLocks++ > 0) {
      return
    }

    const scrollBarGap =
      window.innerWidth - document.documentElement.clientWidth

    if (scrollBarGap > 0) {
      previousBodyPaddingRight = document.body.style.paddingRight
      document.body.style.paddingRight = `${scrollBarGap}px`
    }

    previousBodyOverflowSetting = document.body.style.overflow
    document.body.style.overflow = `hidden`
  })
}

export function unlock() {
  setTimeout(() => {
    if (activeLocks === 0 || --activeLocks !== 0) {
      return
    }

    if (previousBodyPaddingRight !== undefined) {
      document.body.style.paddingRight = previousBodyPaddingRight
      previousBodyPaddingRight = undefined
    }

    if (previousBodyOverflowSetting !== undefined) {
      document.body.style.overflow = previousBodyOverflowSetting
      previousBodyOverflowSetting = undefined
    }
  })
}
