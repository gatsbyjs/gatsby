TODO: This should also contain custom validation rules for Gatsby conventions

Rules to implement:

1. Gatsby internal fields must be properly aliased
2. Custom variables not allowed (except for paginated fields)
3. Fields with pagination must be placed in separate fragments
4. Nested field pagination is not allowed, i.e.
   {
   field1(limit:$limit offset: $offset) {
   subfield(limit: $limit offset: $offset)
   }
   }

...more to come

5. Fragment names must be globally unique
