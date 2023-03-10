import * as React from "react";
import { Nav } from "../components/nav";

export default function Second() {
  const [t, setT] = React.useState(false);
  return (
    <div>
      Hello second edsasait!zwatzz {t ? "true" : "false"}{" "}
      <button onClick={() => setT((a) => !a)}>toggle</button>
      <Nav />
    </div>
  );
}

export function Head() {
  return (
    <>
      <title>Rspack demo - Second</title>
    </>
  );
}
