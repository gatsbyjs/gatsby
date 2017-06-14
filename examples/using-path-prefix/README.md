# using-path-prefix

To test this example site locally run the following commands from this directory

```bash
gatsby build --prefix-paths
cd public
mkdir prefix
mv * prefix # This will cause an error but you can ignore it
cd ..
gatsby serve
# Open the served site at localhost:9000/prefix/
```
