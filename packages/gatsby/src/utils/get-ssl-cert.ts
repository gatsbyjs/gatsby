import report from "gatsby-cli/lib/reporter";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ICert } from "../commands/types";
import prompts from "prompts";

function absoluteOrDirectory(directory: string, filePath: string): string {
  // Support absolute paths
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.join(directory, filePath);
}

async function getWindowsEncryptionPassword(): Promise<string> {
  report.info(
    [
      "A password is required to access the secure certificate authority key",
      "used for signing certificates.",
      "",
      "If this is the first time this has run, then this is to set the password",
      "for future use.  If any new certificates are signed later, you will need",
      "to use this same password.",
      "",
    ].join("\n"),
  );
  const results = await prompts({
    type: "password",
    name: "value",
    message: "Please enter the CA password",
    validate: (input) => input.length > 0 || "You must enter a password.",
  });
  return results.value;
}

export type IGetSslCertArgs = {
  name: string;
  directory: string;
  caFile?: string | undefined;
  keyFile?: string | undefined;
  certFile?: string | undefined;
};

// eslint-disable-next-line consistent-return
export async function getSslCert({
  name,
  certFile,
  keyFile,
  caFile,
  directory,
}: IGetSslCertArgs): Promise<ICert | undefined> {
  // check that cert file and key file are both true or both false, if they are both
  // false, it defaults to the automatic ssl
  if (certFile ? !keyFile : keyFile) {
    report.panic({
      id: "11521",
      context: {},
    });

    throw new Error("Missing keyFile");
  }

  if (certFile && keyFile) {
    const keyPath = absoluteOrDirectory(directory, keyFile);
    const certPath = absoluteOrDirectory(directory, certFile);

    process.env.NODE_EXTRA_CA_CERTS = caFile
      ? absoluteOrDirectory(directory, caFile)
      : certPath;
    return {
      key: fs.readFileSync(keyPath, "utf-8"),
      cert: fs.readFileSync(certPath, "utf-8"),
    };
  }

  report.info(
    "setting up automatic SSL certificate (may require elevated permissions/sudo)\n",
  );

  try {
    if (["linux", "darwin"].includes(os.platform()) && !process.env.HOME) {
      // this is a total hack to ensure process.env.HOME is set on linux and mac
      // devcert creates config path at import time (hence we import devcert after setting dummy value):
      // - https://github.com/davewasmer/devcert/blob/2b1b8d40eda251616bf74fd69f00ae8222ca1171/src/constants.ts#L15
      // - https://github.com/LinusU/node-application-config-path/blob/ae49ff6748b68b29ec76c00ce4a28ba8e9161d9b/index.js#L13
      // if HOME is not set, we will get:
      // "The "path" argument must be of type s tring. Received type undefined"
      // fatal error. This still likely will result in fatal error, but at least it's not on import time
      const mkdtemp = fs.mkdtempSync(path.join(os.tmpdir(), "home-"));
      process.env.HOME = mkdtemp;
    }
    const getDevCert = require("devcert").certificateFor;
    const { caPath, key, cert } = await getDevCert(name, {
      getCaPath: true,
      skipCertutilInstall: false,
      ui: {
        getWindowsEncryptionPassword,
      },
    });
    if (caPath) {
      process.env.NODE_EXTRA_CA_CERTS = caPath;
    }
    return {
      key: key.toString(),
      cert: cert.toString(),
    };
  } catch (err) {
    report.panic({
      id: "11522",
      error: err,
      context: {
        message: err.message,
      },
    });
  }

  return undefined;
}
