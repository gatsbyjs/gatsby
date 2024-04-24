import { store } from "../redux";
import { memoize } from "lodash";
import { type IDependency, getTreeFromNodeModules } from "./gatsby-dependents";

export const getGatsbyDependents = memoize(
  async (): Promise<Array<IDependency>> => {
    const { program } = store.getState();
    return getTreeFromNodeModules(program.directory);
  },
);
