## Providers and resources

A provider is a service that contains resources.
Services might be Gatsby, Contentful, the file system, or
GitHub. A resource can be anything from a local file, to a
Gatsby plugin, to a content model on a CMS.

Resources have a collection of methods that they export which
Gatsby Recipes uses internally. They must implement CRUD.

- `create`: receives context and arguments which it uses to
  create a resource from scratch. When it successfully creates
  the resource, it returns the `read` with its new `id`.
- `read`: receives context and a unique identifier which it uses
  to fetch the resource.
- `update`: receives context, the `id`, and arguments. This function
  updates the resource, and when successful, returns `read` with the
  given `id`.
- `destroy`: receives context and an `id`. It first calls `read` for
  the resource in its existing state, and then removes it. It then
  returns the previously read object.

In addition to CRUD, resources must also implement `schema`, `validate`,
and `plan`.

- `schema`: Is a Joi object that specifies the shape of its properties.
- `validate`: Is a validation function that receives the potential properties
  before any CRUD function is called to ensure that they're valid.
- `plan`: Returns a diff of the resource from its current state and its
  desired state.

Each resource invocation adds its own diff to the plan. A plan is the
composition of all resources used in a recipe. A resource will also
have a `definition` which refers to the props or arguments that are
passed to the resource.

When a plan is invoked, it will create or update all resources that
were specified in the plan whether that's writing a file, updating
a config, or provisioning something in the cloud.
