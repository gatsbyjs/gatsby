export type TrailingSlash = "always" | "never" | "ignore";

function endsWithSuffixes(suffixes: Array<string>, input: string): boolean {
  for (const suffix of suffixes) {
    if (input.endsWith(suffix)) return true;
  }
  return false;
}

const suffixes = [".html", ".json", ".js", ".map", ".txt", ".xml", ".pdf"];

export function applyTrailingSlashOption(
  input: string,
  option: TrailingSlash | undefined = "always",
): string {
  if (input === "/") {
    return input;
  }

  const hasTrailingSlash = input.endsWith("/");

  if (endsWithSuffixes(suffixes, input)) {
    return input;
  }
  if (option === "always") {
    return hasTrailingSlash ? input : `${input}/`;
  }
  if (option === "never") {
    return hasTrailingSlash ? input.slice(0, -1) : input;
  }

  return input;
}
