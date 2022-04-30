
export default function () {
  return "test"
}

export const getServerData = () => {
  return {
    props: {}

  }
}

export const config = async () => {
  return {
    pageContext: {
      env: 'test'
    },
  }
}


export const anotherFunction = () => {
  return "test"
}
