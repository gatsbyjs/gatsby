import fs from "fs"
import { reporter } from "../../utils/reporter"
import {
  makeChoices,
  validateProjectName,
  generateQuestions,
} from "../../utils/question-helpers"

jest.mock(`fs`)
jest.mock(`../../utils/reporter`)

describe(`question-helpers`, () => {
  describe(`makeChoices`, () => {
    it(`should return a select none option by default`, () => {
      const options = {
        init: {
          message: `hello world`,
        },
      }
      const choices = makeChoices(options)
      const [none] = choices
      expect(none).toMatchObject({
        message: `No (or I'll add it later)`,
      })
    })

    it(`should return no select none option if must select indicated`, () => {
      const name = `init`
      const message = `hello world`
      const options = {
        [name]: {
          message,
        },
      }
      const choices = makeChoices(options, true)
      const [option] = choices
      expect(option).toMatchObject({
        message,
        name,
      })
    })
  })

  describe(`validateProjectName`, () => {
    it(`should warn if no dir name`, () => {
      const valid = validateProjectName(``)
      expect(valid).toBeFalsy()
      expect(reporter.warn).toBeCalledWith(
        expect.stringContaining(
          `You have not provided a directory name for your site. Please do so when running with the 'y' flag.`
        )
      )
    })

    it(`should warn if dir name has special character`, () => {
      const name = `<hello:"world`
      const valid = validateProjectName(name)
      expect(valid).toBeFalsy()
      expect(reporter.warn).toBeCalledWith(
        expect.stringContaining(
          `The destination "${name}" is not a valid filename. Please try again, avoiding special characters.`
        )
      )
    })

    it(`should warn if dir already exists`, () => {
      jest.spyOn(fs, `existsSync`).mockReturnValueOnce(true)
      const name = `hello-world`
      const valid = validateProjectName(name)
      expect(valid).toBeFalsy()
      expect(reporter.warn).toBeCalledWith(
        expect.stringContaining(
          `The destination "${name}" already exists. Please choose a different name`
        )
      )
    })

    it(`should return true if the dir name meets all conditions`, () => {
      const valid = validateProjectName(`hello-world`)
      expect(valid).toBeTruthy()
    })

    describe(`windows`, () => {
      const originalPlatform = process.platform

      beforeEach(() => {
        Object.defineProperty(process, `platform`, { value: `win32` })
      })

      afterEach(() => {
        Object.defineProperty(process, `platform`, { value: originalPlatform })
      })

      it(`should warn if dir name has invalid patterns`, () => {
        const name = `aux`
        const valid = validateProjectName(name)
        expect(valid).toBeFalsy()
        expect(reporter.warn).toBeCalledWith(
          expect.stringContaining(
            `The destination "${name}" is not a valid Windows filename. Please try another name`
          )
        )
      })
    })
  })

  describe(`generateQuestions`, () => {
    it(`should return one question if the skip flag is passed`, () => {
      const question = generateQuestions(`hello-world`, {
        yes: true,
        ts: false,
      })
      expect(question.name).toEqual(`project`)
    })

    it(`should return all questions if no skip flag is passed`, () => {
      const questions = generateQuestions(`hello-world`, {
        yes: false,
        ts: false,
      })
      const [first, second, third, fourth, fifth] = questions
      expect(questions).toHaveLength(5)
      expect(first.name).toEqual(`project`)
      expect(second.name).toEqual(`language`)
      expect(third.name).toEqual(`cms`)
      expect(fourth.name).toEqual(`styling`)
      expect(fifth.name).toEqual(`features`)
    })

    it(`should return all questions except for language if ts flag is passed`, () => {
      const questions = generateQuestions(`hello-world`, {
        yes: false,
        ts: true,
      })
      const [first, second, third, fourth] = questions
      expect(questions).toHaveLength(4)
      expect(first.name).toEqual(`project`)
      expect(second.name).toEqual(`cms`)
      expect(third.name).toEqual(`styling`)
      expect(fourth.name).toEqual(`features`)
    })
  })
})
