import { fetch, Response } from 'node-fetch';
import something from 'my-import'
import * as fs from "fs"

const usedReference = 'my cool ref';
const unusedReference = 'I hope to be removed';

export default function () {
  const x = new Response({})

  return usedReference
}

export async function getServerData() {
  const data = await fetch('https://example.com');
  const file = fs.readFileSync('./unknown.tmp.json', 'utf8')

  return {
    props: {
      file,
      data: await data.json(),
      unusedReference,
      test: something(),
    }

  }
}

export function config() {
  return {
    pageContext: {
      env: 'test',
      unusedReference,
    },
  }
}

export function anotherFunction() {
  return "test"
}
