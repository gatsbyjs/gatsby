/**
 * JSON files can get pretty big and parsing can be expensive. JSON streaming can help here as it parses line by line or record by record.
 * @see https://en.wikipedia.org/wiki/JSON_streaming
 */
import readline from "readline"
import { createReadStream } from "fs-extra"

export async function* parseJSON<T>(
  file: string
): AsyncGenerator<T, void, void> {
  const rl = readline.createInterface({
    input: createReadStream(file),
    terminal: false,
  })
  for await (const line of rl) {
    yield JSON.parse(line)
  }
}
