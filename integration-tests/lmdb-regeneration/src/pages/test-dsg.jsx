import * as React from "react";

const DSG = () => {
  return <h1>DSG</h1>;
};

export default DSG;

export const Head = () => <title>DSG</title>;

export async function config() {
  return () => {
    return {
      defer: true,
    };
  };
}
