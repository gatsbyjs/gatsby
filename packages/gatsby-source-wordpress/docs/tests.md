# Tests

This package contains unit tests only. For the integration tests for this package, look in the root of the Gatsby monorepo at `[gatsby-monorepo]/integration-tests/gatsby-source-wordpress`.

## Running Tests

To run these tests check the `package.json` in the root of the Gatsby monorepo. There are npm scripts for running unit tests and integration tests.

## Updating the WP db seed data

If you start up docker by running `npm run docker-clean-start` at `[gatsby-monorepo]/integration-tests/gatsby-source-wordpress`, WordPress will be available at `http://localhost:8001`. You can login with the credentials provided in the `.env.test` file and modify the WP instance. The db is exposed on `http://localhost:3306` and you can login there to export/import the db. Once you've modified the db to your needs, use the [TablePlus app](https://tableplus.com/) to export the db. Replace `[gatsby-monorepo]/integration-tests/gatsby-source-wordpress/docker/seed/backup.sql` with your exported db (keep the name as backup.sql).

Alternatively, you can install the MySQL client cli for your particular OS/distribution and use the following command to create a dump in a file named `backup.sql` in your current working directory:

```bash
mysqldump --user=wordpress --password=gtsb-wp-dckr-user --port=3306 --host=127.0.0.1 --no-tablespaces --databases wordpress > backup.sql
```
