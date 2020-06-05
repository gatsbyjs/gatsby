import React from "react"

export default (props) => <pre>{JSON.stringify(props.data, null, 2)}</pre>
