import { codeFrameColumns } from "@babel/code-frame";

export function getCodeFrame(
  query: string,
  line?: number | undefined,
  column?: number | undefined,
): string {
  if (!line) {
    return query;
  }

  return codeFrameColumns(
    query,
    {
      start: {
        line,
        column,
      },
    },
    {
      linesAbove: 10,
      linesBelow: 10,
    },
  );
}
