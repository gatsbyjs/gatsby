import {
  memo,
  type JSX,
  useContext,
  type ComponentType,
  type ReactElement,
} from "react";
import path from "path";
import { Box, Text, type BoxProps, Spacer } from "ink";
import { getPathToLayoutComponent } from "gatsby-core-utils/parse-component-path";
import { StoreStateContext } from "../context";
import {
  generatePageTree,
  generateSliceTree,
  type ITreeLine,
  type IComponentWithPageModes,
} from "../../../../util/generate-trees";

type IPageAndSliceTreesProps = {
  components: Map<string, IComponentWithPageModes>;
  root: string;
  slices: Map<string, Set<string>>;
};

function _Description(props: BoxProps): JSX.Element {
  return (
    <Box>
      <Box
        {...props}
        flexDirection='column'
        borderStyle='round'
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
  );
}

const Description: ComponentType<BoxProps> = memo<BoxProps>(_Description);

type TreeGeneratorProps = {
  file: string;
  isFirst: boolean;
  isLast: boolean;
  pages?: IComponentWithPageModes | undefined;
  slices?: Set<string> | undefined;
};

function _TreeGenerator({
  file,
  isFirst,
  isLast,
  pages,
  slices,
}: TreeGeneratorProps): JSX.Element {
  let topLevelIcon = "├";
  if (isFirst) {
    topLevelIcon = "┌";
  }
  if (isLast) {
    topLevelIcon = "└";
  }

  let items: Array<ITreeLine> = [];

  if (pages) {
    items = generatePageTree(pages);
  } else if (slices) {
    items = generateSliceTree(slices);
  }

  return (
    <Box flexDirection='column'>
      <Box>
        <Box paddingRight={1}>
          <Text>{topLevelIcon}</Text>
        </Box>

        <Text wrap='truncate-middle'>{file}</Text>
      </Box>

      {items.map((item, index) => (
        <Box key={item.text}>
          <Text>{isLast ? " " : "│"}</Text>

          <Box paddingLeft={1} paddingRight={1}>
            <Text>{index === items.length - 1 ? "└" : "├"}</Text>
          </Box>

          <Box>
            <Text>
              {item.symbol} {item.text}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const TreeGenerator: ComponentType<TreeGeneratorProps> =
  memo<TreeGeneratorProps>(_TreeGenerator);

function _PageAndSliceTrees({
  components,
  root,
  slices,
}: IPageAndSliceTreesProps): JSX.Element {
  const componentList: Array<ReactElement> = [];

  const sliceList: Array<ReactElement> = [];

  let i = 0;

  let j = 0;

  for (const [componentPath, pages] of components) {
    componentList.push(
      <TreeGenerator
        isFirst={i === 0}
        isLast={i === components.size - 1}
        key={componentPath}
        file={path.posix.relative(root, componentPath)}
        pages={pages}
      />,
    );

    i++;
  }

  for (const [componentPath, sliceNames] of slices) {
    sliceList.push(
      <TreeGenerator
        isFirst={j === 0}
        isLast={j === slices.size - 1}
        key={componentPath}
        file={path.posix.relative(root, componentPath)}
        slices={sliceNames}
      />,
    );

    j++;
  }

  return (
    <Box flexDirection='column' marginTop={2}>
      <Box paddingBottom={1}>
        <Text underline>Pages</Text>
      </Box>

      {componentList}

      {slices.size > 0 && (
        <>
          <Box paddingTop={1} paddingBottom={1}>
            <Text underline>Slices</Text>
          </Box>

          {sliceList}
        </>
      )}
      <Description marginTop={1} marginBottom={1} />
    </Box>
  );
}

const PageAndSliceTrees: ComponentType<IPageAndSliceTreesProps> =
  memo<IPageAndSliceTreesProps>(_PageAndSliceTrees);

function _Trees(): JSX.Element {
  const state = useContext(StoreStateContext);

  const componentWithPages = new Map<string, IComponentWithPageModes>();
  const sliceWithComponents = new Map<string, Set<string>>();

  for (const {
    componentPath,
    pages,
    isSlice,
  } of state.pageTree!.components.values()) {
    const layoutComponent = getPathToLayoutComponent(componentPath);
    const pagesByMode = componentWithPages.get(layoutComponent) || {
      SSG: new Set<string>(),
      DSG: new Set<string>(),
      SSR: new Set<string>(),
      FN: new Set<string>(),
    };
    const sliceByComponent =
      sliceWithComponents.get(layoutComponent) || new Set<string>();

    if (isSlice) {
      pages.forEach((sliceName) => {
        sliceByComponent.add(sliceName);
      });
      sliceWithComponents.set(layoutComponent, sliceByComponent);
    } else {
      pages.forEach((pagePath) => {
        const gatsbyPage = state.pageTree!.pages.get(pagePath);

        pagesByMode[gatsbyPage!.mode].add(pagePath);
      });
      componentWithPages.set(layoutComponent, pagesByMode);
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
    });
  }

  return (
    <PageAndSliceTrees
      components={componentWithPages}
      slices={sliceWithComponents}
      root={state.pageTree!.root}
    />
  );
}

export const Trees: ComponentType = memo(_Trees);
