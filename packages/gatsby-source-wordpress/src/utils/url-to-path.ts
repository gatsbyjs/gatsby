import { parse } from "url"

export default (link: string): string => parse(link).pathname
