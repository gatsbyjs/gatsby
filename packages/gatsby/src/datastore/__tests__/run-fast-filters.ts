import {
  runFastFiltersAndSort as doRunFastFiltersAndSort,
  applyFastFilters,
  IRunFilterArg,
} from "../in-memory/run-fast-filters";
import { store } from "../../redux";
import { getDataStore, getNode } from "../../datastore";
import { createDbQueriesFromObject } from "../common/query";
import { GatsbyIterable } from "../common/iterable";
import { actions } from "../../redux/actions";
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from "graphql";
import { IGatsbyNode } from "../../internal";
import { IQueryArgs } from "../types";
import { IGatsbyNodePartial } from "../in-memory/indexing";

const mockNodes = (): Array<IGatsbyNode> => [
  {
    id: "id_1",
    // @ts-ignore Property 'string' does not exist on type 'IGatsbyNode'.ts(2339)
    string: "foo",
    slog: "abc",
    deep: { flat: { search: { chain: 123 } } },
    elemList: [
      {
        foo: "bar",
      },
    ],
    internal: {
      type: "notTest",
      contentDigest: "0",
    },
  },
  {
    id: "id_2",
    // @ts-ignore Property 'string' does not exist on type 'IGatsbyNode'.ts(2339)
    string: "bar",
    slog: "def",
    elemList: [
      {
        foo: "baz",
      },
    ],
    deep: { flat: { search: { chain: 500 } } },
    internal: {
      type: "test",
      contentDigest: "0",
    },
  },
  {
    id: "id_3",
    // @ts-ignore Property 'slog' does not exist on type 'IGatsbyNode'.ts(2339)
    slog: "abc",
    string: "baz",
    elemList: [
      {
        foo: "bar",
      },
      {
        foo: "baz",
      },
    ],
    deep: { flat: { search: { chain: 300 } } },
    internal: {
      type: "test",
      contentDigest: "0",
    },
  },
  {
    id: "id_4",
    // @ts-ignore Property 'string' does not exist on type 'IGatsbyNode'.ts(2339)
    string: "qux",
    slog: "def",
    deep: { flat: { search: { chain: 300 } } },
    internal: {
      type: "test",
      contentDigest: "0",
    },
    first: {
      willBeResolved: "willBeResolved",
      second: [
        {
          willBeResolved: "willBeResolved",
          third: {
            foo: "foo",
          },
        },
      ],
    },
  },
];

const typeName = "test";
const gqlType = new GraphQLObjectType({
  name: typeName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (): any => {
    return {
      id: { type: new GraphQLNonNull(GraphQLID) },
      string: { type: GraphQLString },
      first: {
        type: new GraphQLObjectType({
          name: "First",
          fields: {
            willBeResolved: {
              type: GraphQLString,
              resolve: (): string => "resolvedValue",
            },
            second: {
              type: new GraphQLList(
                new GraphQLObjectType({
                  name: "Second",
                  fields: {
                    willBeResolved: {
                      type: GraphQLString,
                      resolve: () => "resolvedValue",
                    },
                    // @ts-ignore
                    third: new GraphQLObjectType({
                      name: "Third",
                      fields: {
                        // @ts-ignore
                        foo: GraphQLString,
                      },
                    }),
                  },
                }),
              ),
            },
          },
        }),
      },
    };
  },
});

function runFastFiltersAndSort(args: IRunFilterArg): {
  entries: Array<IGatsbyNode>;
  totalCount: () => Promise<number>;
} {
  const result = doRunFastFiltersAndSort(args);
  expect(result.entries).toBeInstanceOf(GatsbyIterable);
  expect(typeof result.totalCount).toBe("function");
  return {
    ...result,
    entries: Array.from(result.entries),
  };
}

describe("fast filter tests", () => {
  beforeEach(async () => {
    store.dispatch({ type: "DELETE_CACHE" });
    mockNodes().forEach((node) =>
      actions.createNode(node, { name: "test" })(store.dispatch),
    );
    await getDataStore().ready();
  });

  describe("filters by just id correctly", () => {
    it("eq operator", async () => {
      const queryArgs = {
        filter: {
          id: { eq: "id_2" },
        },
      };

      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs: { ...queryArgs, limit: 1 },
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      const { entries: resultMany, totalCount } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(resultSingular.map((o) => o.id)).toEqual([mockNodes()[1].id]);
      expect(resultMany.map((o) => o.id)).toEqual([mockNodes()[1].id]);
      expect(await totalCount()).toEqual(1);
    });

    it("eq operator honors type", async () => {
      const queryArgs = {
        filter: {
          id: { eq: "id_1" },
        },
      };

      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs: { ...queryArgs, limit: 1 },
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      const { entries: resultMany, totalCount } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      // `id-1` node is not of queried type, so results should be empty
      expect(resultSingular).toEqual([]);
      expect(resultMany).toEqual([]);
      expect(await totalCount()).toEqual(0);
    });

    it("non-eq operator", async () => {
      const queryArgs: IQueryArgs = {
        filter: {
          id: { ne: "id_2" },
        },
      };

      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs: { ...queryArgs, limit: 1 },
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      const { entries: resultMany, totalCount } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(resultSingular.map((o) => o.id)).toEqual([mockNodes()[2].id]);
      expect(resultMany.map((o) => o.id)).toEqual([
        mockNodes()[2].id,
        mockNodes()[3].id,
      ]);
      expect(await totalCount()).toEqual(2);
    });
    it("return empty array in case of empty nodes", async () => {
      const queryArgs: IQueryArgs = {
        filter: {},
        sort: {
          fields: [],
          order: [],
        },
        limit: 1,
      };
      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: ["NonExistentNodeType"],
        filtersCache: new Map(),
      });
      expect(resultSingular).toEqual([]);
    });
  });
  describe("filters by arbitrary property correctly", () => {
    it("eq operator flat single", async () => {
      const queryArgs = {
        filter: {
          slog: { eq: "def" },
        },
      };

      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs: { ...queryArgs, limit: 1 },
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(Array.isArray(resultSingular)).toBe(true);
      expect(resultSingular.length).toEqual(1);

      resultSingular.map((node) => {
        // @ts-ignore Property 'slog' does not exist on type 'IGatsbyNode'.ts(2339)
        expect(node.slog).toEqual("def");
      });
    });
    it("eq operator flat many", async () => {
      const queryArgs = {
        filter: {
          slog: { eq: "def" },
        },
      };

      const { entries: resultMany, totalCount } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(Array.isArray(resultMany)).toBe(true);
      expect(resultMany.length).toEqual(2);
      expect(await totalCount()).toEqual(2);

      resultMany.map((node) => {
        // @ts-ignore Property 'slog' does not exist on type 'IGatsbyNode'.ts(2339)
        expect(node.slog).toEqual("def");
      });
    });
    it("eq operator deep single", async () => {
      const queryArgs = {
        filter: {
          deep: { flat: { search: { chain: { eq: 300 } } } },
        },
      };

      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs: { ...queryArgs, limit: 1 },
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(Array.isArray(resultSingular)).toBe(true);
      expect(resultSingular.length).toEqual(1);

      resultSingular.map((node) => {
        // @ts-ignore Property 'deep' does not exist on type 'IGatsbyNode'.ts(2339)
        expect(node.deep.flat.search.chain).toEqual(300);
      });
    });
    it("eq operator deep many", async () => {
      const queryArgs = {
        filter: {
          deep: { flat: { search: { chain: { eq: 300 } } } },
        },
      };

      const { entries: resultMany, totalCount } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(Array.isArray(resultMany)).toBe(true);
      expect(resultMany.length).toEqual(2);
      expect(await totalCount()).toEqual(2);

      resultMany.map((node) => {
        // @ts-ignore Property 'deep' does not exist on type 'IGatsbyNode'.ts(2339)
        expect(node.deep.flat.search.chain).toEqual(300);
      });
    });
    it("eq operator deep miss single", async () => {
      const queryArgs = {
        filter: {
          deep: { flat: { search: { chain: { eq: 999 } } } },
        },
      };

      const { entries: resultSingular } = await runFastFiltersAndSort({
        gqlType,
        queryArgs: { ...queryArgs, limit: 1 },
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(Array.isArray(resultSingular)).toBe(true);
      expect(resultSingular.length).toEqual(0);
    });
    it("eq operator deep miss many", async () => {
      const queryArgs = {
        filter: {
          deep: { flat: { search: { chain: { eq: 999 } } } },
        },
      };

      const { entries: resultMany } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(resultMany).toEqual([]);
    });

    it("elemMatch on array of objects", async () => {
      const queryArgs = {
        filter: {
          elemList: {
            elemMatch: { foo: { eq: "baz" } },
          },
        },
      };

      const { entries: resultMany, totalCount } = await runFastFiltersAndSort({
        gqlType,
        queryArgs,
        nodeTypeNames: [gqlType.name],
        filtersCache: new Map(),
      });

      expect(Array.isArray(resultMany)).toBe(true);
      expect(resultMany.map(({ id }) => id)).toEqual(["id_2", "id_3"]);
      expect(await totalCount()).toEqual(2);
    });
  });
});

describe("applyFastFilters", () => {
  beforeAll(async () => {
    store.dispatch({ type: "DELETE_CACHE" });
    mockNodes().forEach((node) =>
      actions.createNode(node, { name: "test" })(store.dispatch),
    );
    await getDataStore().ready();
  });

  it("gets stuff from cache for simple query", () => {
    const filter = {
      slog: { $eq: "def" },
    };

    const result = applyFastFilters(
      createDbQueriesFromObject(filter),
      [typeName],
      new Map(),
      [],
      [],
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result?.length).toEqual(2);

    result?.map((node) => {
      // @ts-ignore Property 'slog' does not exist on type 'IGatsbyNode'.ts(2339)
      expect(getNode(node.id)?.slog).toEqual("def");
    });
  });

  it("gets stuff from cache for deep query", () => {
    const filter = {
      deep: { flat: { search: { chain: { $eq: 300 } } } },
    };

    const result = applyFastFilters(
      createDbQueriesFromObject(filter),
      [typeName],
      new Map(),
      [],
      [],
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result?.length).toEqual(2);

    result?.map((node) => {
      // @ts-ignore Property 'deep' does not exist on type 'IGatsbyNode'.ts(2339)
      expect(getNode(node.id)?.deep.flat.search.chain).toEqual(300);
    });
  });

  it("supports multi-query", () => {
    const filter = {
      slog: { $eq: "def" },
      deep: { flat: { search: { chain: { $eq: 300 } } } },
    };

    const results = applyFastFilters(
      createDbQueriesFromObject(filter),
      [typeName],
      new Map(),
      [],
      [],
    );

    // Count is irrelevant as long as it is non-zero and they all match filter
    expect(Array.isArray(results)).toBe(true);
    expect(results?.length).toEqual(1);
    // @ts-ignore Property 'slog' does not exist on type 'IGatsbyNode'.ts(2339)
    expect(getNode(results?.[0].id ?? "")?.slog).toEqual("def");
    // @ts-ignore Property 'deep' does not exist on type 'IGatsbyNode'.ts(2339)
    expect(getNode(results?.[0].id ?? "")?.deep.flat.search.chain).toEqual(300);
  });

  it("supports elemMatch", () => {
    const filter = {
      elemList: {
        $elemMatch: { foo: { $eq: "baz" } },
      },
    };

    const result = applyFastFilters(
      createDbQueriesFromObject(filter),
      [typeName],
      new Map(),
      [],
      [],
    );

    expect(result).not.toBe(undefined);
    expect(result?.length).toBe(2);
  });
});

describe("edge cases (yay)", () => {
  beforeAll(async () => {
    store.dispatch({ type: "DELETE_CACHE" });
    mockNodes().forEach((node) =>
      actions.createNode(node, { name: "test" })(store.dispatch),
    );
    await getDataStore().ready();
  });

  it("throws when node counters are messed up", async () => {
    const filter = {
      slog: { $eq: "def" }, // matches id_2 and id_4
      deep: { flat: { search: { chain: { $eq: 500 } } } }, // matches id_2
    };

    const result = applyFastFilters(
      createDbQueriesFromObject(filter),
      [typeName],
      new Map(),
      [],
      [],
    );

    // Sanity-check
    expect(result?.length).toEqual(1);
    expect(result?.[0].id).toEqual("id_2");

    // After process restart node.internal.counter is reset and conflicts with counters from the previous run
    //  in some situations this leads to incorrect intersection of filtered results.
    //  Below we set node.internal.counter to same value that existing node id_4 has and leads
    //  to bad intersection of filtered results
    const badNode = {
      id: "bad-node",
      deep: { flat: { search: { chain: 500 } } },
      internal: {
        type: typeName,
        contentDigest: "bad-node",
        counter: getNode("id_4")?.internal.counter,
      },
    };
    store.dispatch({
      type: "CREATE_NODE",
      payload: badNode,
    });
    await getDataStore().ready();

    const run = (): Array<IGatsbyNodePartial> | null => {
      return applyFastFilters(
        createDbQueriesFromObject(filter),
        [typeName],
        new Map(),
        [],
        [],
      );
    };

    expect(run).toThrow(
      "Invariant violation: inconsistent node counters detected",
    );

    store.dispatch({
      type: "DELETE_NODE",
      payload: badNode,
    });
  });

  it("works with subsequent, different filters (issue #34910)", () => {
    // shared filter cache
    const filtersCache = new Map();

    {
      const filter1 = {
        slog: { $eq: "def" }, // matches id_2 and id_4
      };

      const result1 = applyFastFilters(
        createDbQueriesFromObject(filter1),
        [typeName],
        filtersCache,
        [],
        [],
      );

      expect(result1?.length).toEqual(2);
      expect(result1?.[0].id).toEqual("id_2");
      expect(result1?.[1].id).toEqual("id_4");
    }

    {
      const filter2 = {
        slog: { $eq: "def" }, // matches id_2 and id_4
        // important - new filter element
        deep: { flat: { search: { chain: { $eq: 500 } } } }, // matches id_2
      };

      const result2 = applyFastFilters(
        createDbQueriesFromObject(filter2),
        [typeName],
        filtersCache,
        ["string"], // important - new sort field
        [],
      );

      expect(result2?.length).toEqual(1);
      expect(result2?.[0].id).toEqual("id_2");
    }
  });
});
