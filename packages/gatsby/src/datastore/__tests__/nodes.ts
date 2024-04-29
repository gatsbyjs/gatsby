import { actions } from "../../redux/actions";
import { store } from "../../redux";
import { getDataStore, getNode, getNodes } from "..";
import { IGatsbyNode } from "../../redux/types";

jest.mock("gatsby-cli/lib/reporter");

describe("nodes db tests", () => {
  beforeEach(() => {
    store.dispatch({ type: "DELETE_CACHE" });
  });

  it("deletes previously transformed children nodes when the parent node is updated", async () => {
    store.dispatch(
      actions.createNode(
        {
          id: "hi",
          children: [],
          parent: null,
          internal: {
            contentDigest: "hasdfljds",
            type: "Test",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi-1",
          children: [],
          parent: "hi",
          internal: {
            contentDigest: "hasdfljds-1",
            type: "Test-1",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode("hi"),
          child: getNode("hi-1"),
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi-1-1",
          children: [],
          parent: "hi-1",
          internal: {
            contentDigest: "hasdfljds-1-1",
            type: "Test-1-1",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode("hi-1"),
          child: getNode("hi-1-1"),
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi",
          children: [],
          parent: "test",
          internal: {
            contentDigest: "hasdfljds2",
            type: "Test",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    await getDataStore().ready();
    expect(getNodes()).toHaveLength(1);
  });

  it("deletes previously transformed children nodes when the parent node is deleted", async () => {
    store.dispatch(
      actions.createNode(
        {
          id: "hi",
          children: [],
          parent: "test",
          internal: {
            contentDigest: "hasdfljds",
            type: "Test",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi2",
          children: [],
          parent: "test",
          internal: {
            contentDigest: "hasdfljds",
            type: "Test",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi-1",
          children: [],
          parent: "hi",
          internal: {
            contentDigest: "hasdfljds-1",
            type: "Test-1",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode("hi"),
          child: getNode("hi-1"),
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi-1-1",
          children: [],
          parent: "hi-1",
          internal: {
            contentDigest: "hasdfljds-1-1",
            type: "Test-1-1",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode("hi-1"),
          child: getNode("hi-1-1"),
        },
        {
          name: "tests",
        },
      ),
    );
    const action = actions.deleteNode(getNode("hi"), {
      id: "hi",
      version: "1",
      name: "tests",
    });

    if (Array.isArray(action)) {
      action.forEach((a) => store.dispatch(a));
    } else {
      store.dispatch(action);
    }

    await getDataStore().ready();
    expect(getNodes()).toHaveLength(1);
  });

  it("deletes previously transformed children nodes when parent nodes are deleted", () => {
    store.dispatch(
      actions.createNode(
        {
          id: "hi",
          children: [],
          parent: "test",
          internal: {
            contentDigest: "hasdfljds",
            type: "Test",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi-1",
          children: [],
          parent: "hi",
          internal: {
            contentDigest: "hasdfljds-1",
            type: "Test-1",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode("hi"),
          child: getNode("hi-1"),
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createNode(
        {
          id: "hi-1-1",
          children: [],
          parent: "hi-1",
          internal: {
            contentDigest: "hasdfljds-1-1",
            type: "Test-1-1",
          },
        },
        {
          name: "tests",
        },
      ),
    );
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode("hi-1"),
          child: getNode("hi-1-1"),
        },
        {
          name: "tests",
        },
      ),
    );
    const action = actions.deleteNode(getNode("hi"), {
      id: "hi",
      version: "1",
      name: "tests",
    });

    if (Array.isArray(action)) {
      action.forEach((a) => store.dispatch(a));
    } else {
      store.dispatch(action);
    }

    expect(getNodes()).toHaveLength(0);
  });

  it("allows deleting nodes", () => {
    store.dispatch(
      actions.createNode(
        {
          id: "hi",
          children: [],
          parent: "test",
          internal: {
            contentDigest: "hasdfljds",
            type: "Test",
          },
          pickle: true,
          deep: {
            array: [
              0,
              1,
              {
                boom: true,
              },
            ],
          },
        },
        {
          name: "tests",
        },
      ),
    );
    const action = actions.deleteNode(getNode("hi"));

    if (Array.isArray(action)) {
      action.forEach((a) => store.dispatch(a));
    } else {
      store.dispatch(action);
    }
    expect(getNode("hi")).toBeUndefined();
  });

  it("throws an error when trying to delete a node of a type owned from another plugin", () => {
    expect(() => {
      store.dispatch(
        actions.createNode(
          {
            id: "hi",
            children: [],
            parent: "test",
            internal: {
              contentDigest: "hasdfljds",
              type: "Other",
            },
          },
          {
            name: "other",
          },
        ),
      );
      const action = actions.deleteNode(getNode("hi"), {
        id: "hi",
        version: "1",
        name: "tests",
      });

      if (Array.isArray(action)) {
        action.forEach((a) => store.dispatch(a));
      } else {
        store.dispatch(action);
      }
    }).toThrow(/deleted/);
  });

  it("does not crash when delete node is called on undefined", () => {
    actions.deleteNode(undefined, {
      id: "hi",
      version: "1",
      name: "tests",
    });
    expect(getNodes()).toHaveLength(0);
  });

  it("records the node type owner when a node is created", async () => {
    // creating a node
    store.dispatch(
      actions.createNode(
        {
          id: "1",
          parent: null,
          children: [],
          internal: {
            type: "OwnerOneTestTypeOne",
            contentDigest: "ok",
          },
        },
        {
          name: "test-owner-1",
        },
      ),
    );
    // and creating a second node in the same type
    store.dispatch(
      actions.createNode(
        {
          id: "2",
          parent: null,
          children: [],
          internal: {
            type: "OwnerOneTestTypeOne",
            contentDigest: "ok",
          },
        },
        {
          name: "test-owner-1",
        },
      ),
    );

    // and a third node of a different type but same plugin
    store.dispatch(
      actions.createNode(
        {
          id: "3",
          parent: null,
          children: [],
          internal: {
            type: "OwnerOneTestTypeTwo",
            contentDigest: "ok",
          },
        },
        {
          name: "test-owner-1",
        },
      ),
    );

    // fourth node by a different plugin
    store.dispatch(
      actions.createNode(
        {
          id: "4",
          parent: null,
          children: [],
          internal: {
            type: "OwnerTwoTestTypeThree",
            contentDigest: "ok",
          },
        },
        {
          name: "test-owner-2",
        },
      ),
    );

    // fifth node by second plugin but the node is deleted. Deleted nodes still have type owners
    const nodeFive: IGatsbyNode = {
      id: "5",
      parent: null,
      children: [],
      internal: {
        type: "OwnerTwoTestTypeFour",
        contentDigest: "ok",
      },
    };
    store.dispatch(
      actions.createNode(nodeFive, {
        name: "test-owner-2",
      }),
    );
    const action = actions.deleteNode(nodeFive, {
      id: "5",
      version: "1",
      name: "test-owner-2",
    });

    if (Array.isArray(action)) {
      action.forEach((a) => store.dispatch(a));
    } else {
      store.dispatch(action);
    }

    expect(getNode("5")).toBeUndefined();

    const state = store.getState();

    const ownerOne = state.typeOwners.pluginsToTypes.get("test-owner-1");
    expect(ownerOne).toBeTruthy();
    expect(ownerOne?.has("OwnerOneTestTypeOne")).toBeTrue();
    expect(ownerOne?.has("OwnerOneTestTypeTwo")).toBeTrue();
    expect(ownerOne?.has("OwnerTwoTestTypeThree")).toBeFalse();

    const ownerTwo = state.typeOwners.pluginsToTypes.get("test-owner-2");
    expect(ownerTwo).toBeTruthy();
    expect(ownerTwo?.has("OwnerOneTestTypeTwo")).toBeFalse();
    expect(ownerTwo?.has("OwnerTwoTestTypeThree")).toBeTrue();
    expect(ownerTwo?.has("OwnerTwoTestTypeFour")).toBeTrue();
  });
});
