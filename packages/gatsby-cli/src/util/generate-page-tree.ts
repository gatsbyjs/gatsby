type SYMBOLS = " " | "D" | "∞" | "λ"

export interface IComponentWithPageModes {
  SSG: Set<string>
  DSG: Set<string>
  SSR: Set<string>
  FN: Set<string>
}

export interface IPageTreeLine {
  text: string
  symbol: SYMBOLS
}

export function generatePageTree(
  collections: IComponentWithPageModes,
  LIMIT: number = 8
): Array<IPageTreeLine> {
  const SSGIterator = collections.SSG.values()
  const DSGIterator = collections.DSG.values()
  const SSRIterator = collections.SSR.values()
  const FNIterator = collections.FN.values()

  const SSGPages: Array<IPageTreeLine> = generateLineUntilLimit(
    SSGIterator,
    ` `,
    LIMIT / 4,
    collections.SSG.size
  )
  const DSGPages: Array<IPageTreeLine> = generateLineUntilLimit(
    DSGIterator,
    `D`,
    LIMIT / 4,
    collections.DSG.size
  )
  const SSRPages: Array<IPageTreeLine> = generateLineUntilLimit(
    SSRIterator,
    `∞`,
    LIMIT / 4,
    collections.SSR.size
  )
  const FNPages: Array<IPageTreeLine> = generateLineUntilLimit(
    FNIterator,
    `λ`,
    LIMIT / 4,
    collections.FN.size
  )

  // TODO if not all the 8 lines are taken we should fill it up with the rest of the pages (each component should have LIMIT lines)

  return SSGPages.concat(DSGPages).concat(SSRPages).concat(FNPages)
}

function generateLineUntilLimit(
  iterator: IterableIterator<string>,
  symbol: SYMBOLS,
  limit: number,
  max: number
): Array<IPageTreeLine> {
  const pages: Array<IPageTreeLine> = []

  for (
    let item = iterator.next();
    !item.done && pages.length < limit;
    item = iterator.next()
  ) {
    pages.push({
      text: item.value,
      symbol,
    })
  }

  if (pages.length < max) {
    pages[pages.length - 1].text = `...${
      max - pages.length + 1
    } more pages available`
  }

  return pages
}
