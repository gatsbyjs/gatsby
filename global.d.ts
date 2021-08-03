import { string } from "yargs"

declare global {
  const _CFLAGS_ = {
    MAJOR: string,
  }
}
