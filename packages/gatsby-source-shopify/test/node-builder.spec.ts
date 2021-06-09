import { SourceNodesArgs, NodeInput } from "gatsby";
import { createRemoteFileNode } from "gatsby-source-filesystem";

jest.mock("gatsby-source-filesystem", () => ({
  createRemoteFileNode: jest.fn().mockResolvedValue({
    id: `12345`,
  }),
}));

import { processorMap } from "../src/node-builder";

describe("When a variant has an image set", () => {
  const node = {
    image: {
      id: "foo1",
      originalSrc: "https://via.placeholder.com/100x100",
    },
    id: "foo2",
    internal: {
      type: "foo3",
      contentDigest: "foo4",
    },
  } as NodeInput;

  const createNode = jest.fn();
  const gatsbyApiMock = jest.fn().mockImplementation(() => {
    return {
      cache: {
        set: jest.fn(),
        get: jest.fn(),
      },
      actions: {
        createNode,
      },
      createContentDigest: jest.fn(),
      createNodeId: jest.fn(),
      store: jest.fn(),
      reporter: {
        info: jest.fn(),
        error: jest.fn(),
        panic: jest.fn(),
        activityTimer: () => ({
          start: jest.fn(),
          end: jest.fn(),
          setStatus: jest.fn(),
        }),
      },
    };
  });

  const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>;

  describe("and options are set, not to download images", () => {
    const options = {
      apiKey: ``,
      password: ``,
      storeUrl: "my-shop.shopify.com",
    };

    it("doesn't create localFile on the node.", async () => {
      await processorMap.ProductVariant(node, gatsbyApi(), options);
      const mock = createRemoteFileNode as jest.Mock;
      expect(mock).not.toHaveBeenCalled();
    });
  });

  describe("and options are set to download images", () => {
    const options = {
      apiKey: ``,
      password: ``,
      storeUrl: "my-shop.shopify.com",
      downloadImages: true,
    };

    it("creates localFile on the node.", async () => {
      await processorMap.ProductVariant(node, gatsbyApi(), options);
      const mock = createRemoteFileNode as jest.Mock;
      expect(mock).toHaveBeenCalled();
      expect(node.image).toHaveProperty("localFile");
    });
  });
});
