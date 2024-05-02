import path from "node:path";
import fs from "fs-extra";
import chokidar from "chokidar";
import type { GatsbyNode, PluginCallback, PluginOptions } from "../../..";

export const createPagesStatefully: GatsbyNode["createPagesStatefully"] =
  async function createPagesStatefully(
    { store, actions },
    _options: PluginOptions,
    done: PluginCallback<void>,
  ): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      const { program } = store.getState();
      const { createPage } = actions;
      const source = path.join(__dirname, "./raw_dev-404-page.js");
      const destination = path.join(
        program.directory,
        ".cache",
        "dev-404-page.js",
      );
      const copy = (): Promise<void> => {
        return fs.copy(source, destination);
      };
      await copy();
      createPage({
        component: destination,
        path: "/dev-404-page/",
      });
      chokidar
        .watch(source)
        .on("change", (): Promise<void> => copy())
        .on("ready", () => done(null));
    } else {
      done(null);
    }
  };
