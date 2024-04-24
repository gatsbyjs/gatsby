import { parse } from "url";

export default function urlToPath(link: string): string {
  return parse(link).pathname;
}
