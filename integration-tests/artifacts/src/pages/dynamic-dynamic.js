import React, { Component } from "react"

export default function Dynamic() {
  const [module, setModule] = React.useState(null);
  React.useEffect(() => {
    let module;
    import(`../pages/dynamic`).then(module =>
      setModule(module.default)
    )
  }, []);

  return <div>{Component && <Component />}</div>;
}
