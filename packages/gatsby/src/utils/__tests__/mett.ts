import { mett } from "../mett"

describe(`mett`, (): void => {
  describe(`regular events`, (): void => {
    it(`can be called multiple times`, (): void => {
      expect((): unknown => mett()).not.toThrow()
      expect((): unknown => mett()).not.toThrow()
      expect((): unknown => mett()).not.toThrow()
    })

    it(`returns unique objects`, (): void => {
      expect(mett() !== mett()).toBe(true)
    })

    it(`can register an event`, (): void => {
      const met = mett()

      expect((): void => met.on(`foo`, (): void => {})).not.toThrow()
    })

    it(`can remove an added event`, (): void => {
      const met = mett()
      const f = (): void => {}

      expect((): void => met.on(`foo`, f)).not.toThrow()
      expect((): void => met.off(`foo`, f)).not.toThrow()
    })

    it(`calls a registered event handler on emit`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenCalledWith(`pass`, `foo`)
    })

    it(`does not call a removed event`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.off(`foo`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).not.toHaveBeenCalledWith(`pass`, `foo`)
    })

    it(`can remove a handler from an event that did not have it`, (): void => {
      const met = mett()
      const f = (): void => {}

      expect((): void => met.off(`foo`, f)).not.toThrow()
    })

    it(`calls an added handler when removed from different event`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.off(`barr`, spy) // NOT the original event
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenCalledWith(`pass`, `foo`)
    })

    it(`calls handlers in fifo order without removal`, (): void => {
      const met = mett()
      let out = ``
      const list = [
        (): string => (out += `a`),
        (): string => (out += `b`),
        (): string => (out += `c`),
        (): string => (out += `d`),
        (): string => (out += `e`),
        (): string => (out += `f`),
        (): string => (out += `g`),
        (): string => (out += `h`),
        (): string => (out += `i`),
        (): string => (out += `j`),
        (): string => (out += `k`),
        (): string => (out += `l`),
        (): string => (out += `m`),
        (): string => (out += `n`),
        (): string => (out += `o`),
        (): string => (out += `p`),
      ]

      list.forEach(f => met.on(`foo`, f))

      met.emit(`foo`, `pass`)

      expect(out).toBe(`abcdefghijklmnop`)
    })

    it(`calls handlers in fifo order after removal`, (): void => {
      const met = mett()
      let out = ``
      const list = [
        (): string => (out += `a`),
        (): string => (out += `b`),
        (): string => (out += `c`),
        (): string => (out += `d`),
        (): string => (out += `e`),
        (): string => (out += `f`),
        (): string => (out += `g`),
        (): string => (out += `h`),
        (): string => (out += `i`),
        (): string => (out += `j`),
        (): string => (out += `k`),
        (): string => (out += `l`),
        (): string => (out += `m`),
        (): string => (out += `n`),
        (): string => (out += `o`),
        (): string => (out += `p`),
      ]

      list.forEach(f => met.on(`foo`, f))

      met.off(`foo`, list[3]) // d
      met.off(`foo`, list[8]) // h

      met.emit(`foo`, `pass`)

      expect(out).toBe(`abcefghjklmnop`)
    })

    it(`calls handlers in fifo order after pingpong`, (): void => {
      const met = mett()
      let out = ``
      const list = [
        (): string => (out += `a`),
        (): string => (out += `b`),
        (): string => (out += `c`),
        (): string => (out += `d`),
        (): string => (out += `e`),
        (): string => (out += `f`),
        (): string => (out += `g`),
        (): string => (out += `h`),
        (): string => (out += `i`),
        (): string => (out += `j`),
        (): string => (out += `k`),
        (): string => (out += `l`),
        (): string => (out += `m`),
        (): string => (out += `n`),
        (): string => (out += `o`),
        (): string => (out += `p`),
      ]

      list.forEach(f => met.on(`foo`, f))

      met.off(`foo`, list[3]) // d
      met.off(`foo`, list[8]) // i
      met.on(`foo`, list[8]) // i
      met.on(`foo`, list[3]) // d

      met.emit(`foo`, `pass`)

      // Note: i before d now
      expect(out).toBe(`abcefghjklmnopid`)
    })

    it(`calls each unique handler only once`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenCalledWith(`pass`, `foo`)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should remove a handler even if it was added multiple times`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.off(`foo`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenCalledTimes(0)
    })

    it(`should add-remove-add multiple times and still call handler once`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.off(`foo`, spy)
      met.off(`foo`, spy)
      met.off(`foo`, spy)
      met.off(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.off(`foo`, spy)
      met.off(`foo`, spy)
      met.on(`foo`, spy)
      met.on(`foo`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should allow same handler in different events`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.on(`bar`, spy)
      met.emit(`foo`, `pass1`)
      met.emit(`bar`, `pass2`)

      expect(spy).toHaveBeenNthCalledWith(1, `pass1`, `foo`)
      expect(spy).toHaveBeenNthCalledWith(2, `pass2`, `bar`)
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe(`star events`, (): void => {
    it(`should always call star handlers`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`*`, spy)
      met.emit(`foo`, `pass1`)
      met.emit(`bar`, `pass2`)

      expect(spy).toHaveBeenNthCalledWith(1, `pass1`, `foo`)
      expect(spy).toHaveBeenNthCalledWith(2, `pass2`, `bar`)
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it(`should call same handler twice if registered in star and event`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`bar`, spy)
      met.on(`*`, spy)
      met.emit(`foo`, `pass1`)
      met.emit(`bar`, `pass2`)

      expect(spy).toHaveBeenNthCalledWith(1, `pass1`, `foo`)
      expect(spy).toHaveBeenNthCalledWith(2, `pass2`, `bar`)
      expect(spy).toHaveBeenNthCalledWith(3, `pass2`, `bar`)
      expect(spy).toHaveBeenCalledTimes(3)
    })

    it(`should not remove handler from star if removed from event`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`foo`, spy)
      met.on(`*`, spy)
      met.off(`foo`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenNthCalledWith(1, `pass`, `foo`)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should not remove handler from event if removed from star`, (): void => {
      const met = mett()
      const spy = jest.fn()

      met.on(`*`, spy)
      met.on(`foo`, spy)
      met.off(`*`, spy)
      met.emit(`foo`, `pass`)

      expect(spy).toHaveBeenNthCalledWith(1, `pass`, `foo`)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should call star handlers after regular handlers`, (): void => {
      const met = mett()

      let out = ``

      // Order is relevant here
      met.on(`foo`, (): string => (out += `a`))
      met.on(`*`, (): string => (out += `b`))
      // Reverse order
      met.on(`*`, (): string => (out += `c`))
      met.on(`foo`, (): string => (out += `d`))

      met.emit(`foo`, `pass`)

      // the stars should last, in fifo order otherwise
      expect(out).toBe(`adbc`)
    })
  })
})
