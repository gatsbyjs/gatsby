import { Response } from 'node-fetch';
const usedReference = 'my cool ref';
export default function () {
  const x = new Response({});
  return usedReference;
}
export function anotherFunction() {
  return "test";
}
