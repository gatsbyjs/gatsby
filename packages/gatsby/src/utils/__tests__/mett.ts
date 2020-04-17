import { mett } from "../mett"

describe(`mett`, () => {
  describe("regular events", () => {
    it(`can be called multiple times`, () => {
      expect(() => mett()).not.toThrow()
      expect(() => mett()).not.toThrow()
      expect(() => mett()).not.toThrow()
    })

    it(`returns unique objects`, () => {
      expect(mett() !== mett()).toBe(true)
    })

    it(`can register an event`, () => {
      const met = mett()

      expect(() => met.on("foo", () => {})).not.toThrow()
    })

    it(`can remove an added event`, () => {
      const met = mett()
      const f = () => {}

      expect(() => met.on("foo", f)).not.toThrow()
      expect(() => met.off("foo", f)).not.toThrow()
    })

    it(`calls a registered event handler on emit`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.emit("foo", "pass")

      expect(spy).toHaveBeenCalledWith("pass", "foo")
    })

    it(`does not call a removed event`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.off("foo", spy)
      met.emit("foo", "pass")

      expect(spy).not.toHaveBeenCalledWith("pass", "foo")
    })

    it(`can remove a handler from an event that did not have it`, () => {
      const met = mett()
      const f = () => {}

      expect(() => met.off("foo", f)).not.toThrow()
    })

    it(`calls an added handler when removed from different event`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.off("barr", spy) // NOT the original event
      met.emit("foo", "pass")

      expect(spy).toHaveBeenCalledWith("pass", "foo")
    })

    it(`calls handlers in fifo order without removal`, () => {
      const met = mett()
      const list = [
        () => (out += "a"),
        () => (out += "b"),
        () => (out += "c"),
        () => (out += "d"),
        () => (out += "e"),
        () => (out += "f"),
        () => (out += "g"),
        () => (out += "h"),
        () => (out += "i"),
        () => (out += "j"),
        () => (out += "k"),
        () => (out += "l"),
        () => (out += "m"),
        () => (out += "n"),
        () => (out += "o"),
        () => (out += "p"),
      ]

      list.forEach(f => met.on("foo", f))

      let out = ""
      met.emit("foo", "pass")

      expect(out).toBe("abcdefghijklmnop")
    })

    it(`calls handlers in fifo order after removal`, () => {
      const met = mett()
      const list = [
        () => (out += "a"),
        () => (out += "b"),
        () => (out += "c"),
        () => (out += "d"),
        () => (out += "e"),
        () => (out += "f"),
        () => (out += "g"),
        () => (out += "h"),
        () => (out += "i"),
        () => (out += "j"),
        () => (out += "k"),
        () => (out += "l"),
        () => (out += "m"),
        () => (out += "n"),
        () => (out += "o"),
        () => (out += "p"),
      ]

      list.forEach(f => met.on("foo", f))

      met.off("foo", list[3]) // d
      met.off("foo", list[8]) // h

      let out = ""
      met.emit("foo", "pass")

      expect(out).toBe("abcefghjklmnop")
    })

    it(`calls handlers in fifo order after pingpong`, () => {
      const met = mett()
      const list = [
        () => (out += "a"),
        () => (out += "b"),
        () => (out += "c"),
        () => (out += "d"),
        () => (out += "e"),
        () => (out += "f"),
        () => (out += "g"),
        () => (out += "h"),
        () => (out += "i"),
        () => (out += "j"),
        () => (out += "k"),
        () => (out += "l"),
        () => (out += "m"),
        () => (out += "n"),
        () => (out += "o"),
        () => (out += "p"),
      ]

      list.forEach(f => met.on("foo", f))

      met.off("foo", list[3]) // d
      met.off("foo", list[8]) // i
      met.on("foo", list[8]) // i
      met.on("foo", list[3]) // d

      let out = ""
      met.emit("foo", "pass")

      // Note: i before d now
      expect(out).toBe("abcefghjklmnopid")
    })

    it(`calls each unique handler only once`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.emit("foo", "pass")

      expect(spy).toHaveBeenCalledWith("pass", "foo")
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should remove a handler even if it was added multiple times`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.off("foo", spy)
      met.emit("foo", "pass")

      expect(spy).toHaveBeenCalledTimes(0)
    })

    it(`should add-remove-add multiple times and still call handler once`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.off("foo", spy)
      met.off("foo", spy)
      met.off("foo", spy)
      met.off("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.off("foo", spy)
      met.off("foo", spy)
      met.on("foo", spy)
      met.on("foo", spy)
      met.emit("foo", "pass")

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should allow same handler in different events`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.on("bar", spy)
      met.emit("foo", "pass1")
      met.emit("bar", "pass2")

      expect(spy).toHaveBeenNthCalledWith(1, "pass1", "foo")
      expect(spy).toHaveBeenNthCalledWith(2, "pass2", "bar")
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe("star events", () => {
    it(`should always call star handlers`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("*", spy)
      met.emit("foo", "pass1")
      met.emit("bar", "pass2")

      expect(spy).toHaveBeenNthCalledWith(1, "pass1", "foo")
      expect(spy).toHaveBeenNthCalledWith(2, "pass2", "bar")
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it(`should call same handler twice if registered in star and event`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("bar", spy)
      met.on("*", spy)
      met.emit("foo", "pass1")
      met.emit("bar", "pass2")

      expect(spy).toHaveBeenNthCalledWith(1, "pass1", "foo")
      expect(spy).toHaveBeenNthCalledWith(2, "pass2", "bar")
      expect(spy).toHaveBeenNthCalledWith(3, "pass2", "bar")
      expect(spy).toHaveBeenCalledTimes(3)
    })

    it(`should not remove handler from star if removed from event`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("foo", spy)
      met.on("*", spy)
      met.off("foo", spy)
      met.emit("foo", "pass")

      expect(spy).toHaveBeenNthCalledWith(1, "pass", "foo")
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should not remove handler from event if removed from star`, () => {
      const met = mett()
      const spy = jest.fn()

      met.on("*", spy)
      met.on("foo", spy)
      met.off("*", spy)
      met.emit("foo", "pass")

      expect(spy).toHaveBeenNthCalledWith(1, "pass", "foo")
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it(`should call star handlers after regular handlers`, () => {
      const met = mett()

      let out = ''

      // Order is relevant here
      met.on("foo", () => out += 'a')
      met.on("*", () => out += 'b')
      // Reverse order
      met.on("*", () => out += 'c')
      met.on("foo", () => out += 'd')

      met.emit("foo", "pass")

      // the stars should last, in fifo order otherwise
      expect(out).toBe('adbc')
    })
  })
})
