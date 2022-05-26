export function register() {
  // no-op
  // we will transpile typescript files when bundling for engines
  // so we don't need any runtime handler for it anymore
  // TO-DO: currently we don't really set any options on TS transpilation
  // users might provide arguments to ts-node that would behave differently
  // than our defaults - can we support that somehow to ensure same
  // TS setting are used when bundling as in regular runtime?
}
