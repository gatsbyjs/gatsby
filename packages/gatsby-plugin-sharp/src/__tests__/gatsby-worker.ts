jest.mock("../process-file");

import path from "node:path";
import { IMAGE_PROCESSING } from "../gatsby-worker";
import { processFile } from "../process-file";

describe("worker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call processFile with the right arguments", async () => {
    // @ts-ignore
    processFile.mockImplementation((file, transforms) =>
      transforms.map((transform) => Promise.resolve(transform)),
    );
    const job = {
      inputPaths: [
        {
          path: "inputpath/file.jpg",
          contentDigest: "1234",
        },
      ],
      outputDir: "/public/static/",
      args: {
        operations: [
          {
            outputPath: "myoutputpath/1234/file.jpg",
            args: {
              width: 100,
              height: 100,
            },
          },
        ],
        pluginOptions: {},
      },
    };

    await IMAGE_PROCESSING(job);

    expect(processFile).toHaveBeenCalledTimes(1);
    expect(processFile).toHaveBeenCalledWith(
      job.inputPaths[0].path,
      [
        {
          ...job.args.operations[0],
          outputPath: path.join(
            job.outputDir,
            job.args.operations[0].outputPath,
          ),
        },
      ],
      job.args.pluginOptions,
    );
  });

  it("should fail a promise when image processing fails", async () => {
    // @ts-ignore
    processFile.mockImplementation(() =>
      Promise.reject(new Error("transform failed")),
    );

    const job = {
      inputPaths: [
        {
          path: "inputpath/file.jpg",
          contentDigest: "1234",
        },
      ],
      outputDir: "/public/static/",
      args: {
        operations: [
          {
            outputPath: "myoutputpath/1234/file.jpg",
            args: {
              width: 100,
              height: 100,
            },
          },
        ],
        pluginOptions: {},
      },
    };

    expect.assertions(1);
    try {
      await IMAGE_PROCESSING(job);
    } catch (err) {
      expect(err.message).toEqual("transform failed");
    }
  });
});
