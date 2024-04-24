import type { VFile, VFileData } from "vfile";
import type { Node } from "gatsby";

export type IMdxNode = {
  rawBody?: string | undefined;
  body?: string | undefined;
} & Node;

export type IFileNode = {
  sourceInstanceName?: string | undefined;
  absolutePath?: string | undefined;
} & Node;

type IMdxVFileDataMeta = {
  [key: string]: unknown;
};

type IMdxVFileData = {
  meta?: IMdxVFileDataMeta | undefined;
} & VFileData;

export type IMdxVFile = {
  data: IMdxVFileData;
} & VFile;

export type IMdxMetadata = {
  [key: string]: unknown;
};
