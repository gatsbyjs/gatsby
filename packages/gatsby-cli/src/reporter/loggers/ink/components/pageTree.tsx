/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { ReactElement, useContext } from "react"
import { Box, Text, BoxProps, Spacer } from "ink"
import path from "path"
import { getPathToLayoutComponent } from "gatsby-core-utils/parse-component-path"
import StoreStateContext from "../context"
import {
  generatePageTree,
  IPageTreeLine,
  IComponentWithPageModes,
} from "../../../../util/generate-page-tree"

interface IPageTreeProps {
  components: Map<string, IComponentWithPageModes>
  root: string
  slices: Set<string>
}

const Description: React.FC<BoxProps> = function Description(props) {
  return (
    <Box>
      <Box
        {...props}
        flexDirection="column"
        borderStyle="round"
        padding={1}
        marginLeft={2}
        marginRight={2}
      >
        <Box paddingLeft={2}>
          <Text>(SSG) Generated at build time</Text>
        </Box>
        <Text>
          D (DSG) Deferred static generation - page generated at runtime
        </Text>
        <Text>∞ (SSR) Server-side renders at runtime (uses getServerData)</Text>
        <Text>λ (Function) Gatsby function</Text>
      </Box>
      <Spacer />
    </Box>
  )
}

const ComponentTree: React.FC<{
  file: string
  isFirst: boolean
  isLast: boolean
  pages: IComponentWithPageModes
}> = function ComponentTree({ file, isFirst, isLast, pages }) {
  let topLevelIcon = `├`
  if (isFirst) {
    topLevelIcon = `┌`
  }
  if (isLast) {
    topLevelIcon = `└`
  }

  const sortedPages: Array<IPageTreeLine> = generatePageTree(pages)

  return (
    <Box flexDirection="column">
      <Box>
        <Box paddingRight={1}>
          <Text>{topLevelIcon}</Text>
        </Box>
        <Text wrap="truncate-middle">{file}</Text>
      </Box>
      {sortedPages.map((page, index) => (
        <Box key={page.text}>
          <Text>{isLast ? ` ` : `│`}</Text>
          <Box paddingLeft={1} paddingRight={1}>
            <Text>{index === sortedPages.length - 1 ? `└` : `├`}</Text>
          </Box>
          <Box>
            <Text>
              {page.symbol} {page.text}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const PageTree: React.FC<IPageTreeProps> = function PageTree({
  components,
  root,
  slices,
}) {
  const componentList: Array<ReactElement> = []
  let i = 0
  for (const [componentPath, pages] of components) {
    componentList.push(
      <ComponentTree
        isFirst={i === 0}
        isLast={i === components.size - 1}
        key={componentPath}
        file={path.posix.relative(root, componentPath)}
        pages={pages}
      />
    )

    i++
  }

  return (
    <Box flexDirection="column" marginTop={2}>
      <Box paddingBottom={1}>
        <Text underline>Pages</Text>
      </Box>
      {componentList}
      {slices.size > 0 && (
        <>
          <Box paddingTop={1} paddingBottom={1}>
            <Text underline>Slices</Text>
          </Box>
          {Array.from(slices).map(slice => (
            <Box key={slice}>
              <Text>
                <Text bold>·</Text> {path.posix.relative(root, slice)}
              </Text>
            </Box>
          ))}
        </>
      )}
      <Description marginTop={1} marginBottom={1} />
    </Box>
  )
}

const ConnectedPageTree: React.FC = function ConnectedPageTree() {
  const state = useContext(StoreStateContext)

  const componentWithPages = new Map<string, IComponentWithPageModes>()
  const slices = new Set<string>()

  for (const {
    componentPath,
    pages,
    isSlice,
  } of state.pageTree!.components.values()) {
    const layoutComponent = getPathToLayoutComponent(componentPath)
    const pagesByMode = componentWithPages.get(layoutComponent) || {
      SSG: new Set<string>(),
      DSG: new Set<string>(),
      SSR: new Set<string>(),
      FN: new Set<string>(),
    }

    if (isSlice) {
      slices.add(componentPath)
    } else {
      pages.forEach(pagePath => {
        const gatsbyPage = state.pageTree!.pages.get(pagePath)

        pagesByMode[gatsbyPage!.mode].add(pagePath)
      })
      componentWithPages.set(layoutComponent, pagesByMode)
    }
  }

  for (const {
    originalAbsoluteFilePath,
    functionRoute,
  } of state.pageTree!.functions.values()) {
    componentWithPages.set(originalAbsoluteFilePath, {
      SSG: new Set<string>(),
      DSG: new Set<string>(),
      SSR: new Set<string>(),
      FN: new Set<string>([`/api/${functionRoute}`]),
    })
  }

  return (
    <PageTree
      components={componentWithPages}
      slices={slices}
      root={state.pageTree!.root}
    />
  )
}

export default ConnectedPageTree
