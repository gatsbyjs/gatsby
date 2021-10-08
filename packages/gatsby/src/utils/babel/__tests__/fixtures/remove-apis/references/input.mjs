const usedReference = 'my cool ref';
const unsuedReference = 'I hope to be removed';

export default function () {
  return usedReference
}

export function getServerData() {
  return {
    props: {
      unusedReference
    }

  }
}

export async function config() {
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
