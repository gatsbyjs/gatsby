type SYMBOLS = " " | "D" | "∞" | "λ"

export interface IComponentWithPageModes {
  SSG: Set<string>
  DSG: Set<string>
  SSR: Set<string>
  FN: Set<string>
}

export interface ITreeLine {
  text: string
  symbol: SYMBOLS
}

export function generatePageTree(
  collections: IComponentWithPageModes,
  LIMIT: number = 8
): Array<ITreeLine> {
  const SSGIterator = collections.SSG.values()
  const DSGIterator = collections.DSG.values()
  const SSRIterator = collections.SSR.values()
  const FNIterator = collections.FN.values()

  const SSGPages: Array<ITreeLine> = generateLineUntilLimit(
    SSGIterator,
    ` `,
    LIMIT / 4,
    collections.SSG.size
  )
  const DSGPages: Array<ITreeLine> = generateLineUntilLimit(
    DSGIterator,
    `D`,
    LIMIT / 4,
    collections.DSG.size
  )
  const SSRPages: Array<ITreeLine> = generateLineUntilLimit(
    SSRIterator,
    `∞`,
    LIMIT / 4,
    collections.SSR.size
  )
  const FNPages: Array<ITreeLine> = generateLineUntilLimit(
    FNIterator,
    `λ`,
    LIMIT / 4,
    collections.FN.size
  )

  return SSGPages.concat(DSGPages).concat(SSRPages).concat(FNPages)
}

export function generateSliceTree(
  slices: Set<string>,
  LIMIT: number = 8
): Array<ITreeLine> {
  const slicesIterator = slices.values()

  return generateLineUntilLimit(slicesIterator, ` `, LIMIT / 4, slices.size)
}

function generateLineUntilLimit(
  iterator: IterableIterator<string>,
  symbol: SYMBOLS,
  limit: number,
  max: number
): Array<ITreeLine> {
  const output: Array<ITreeLine> = []

  for (
    let item = iterator.next();
    !item.done && output.length < limit;
    item = iterator.next()
  ) {
    output.push({
      text: item.value,
      symbol,
    })
  }

  if (output.length < max) {
    output[output.length - 1].text = `...${
      max - output.length + 1
    } more pages available`
  }

  return output
}
