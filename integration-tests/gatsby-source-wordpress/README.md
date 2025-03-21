# `gatsby-source-wordpress` integration test

## Tips

### Regenerate backup.sql

If you need to regenerate the `backup.sql` file, you can do so by running the following command:

```bash
mysqldump --port=3306 --host=127.0.0.1 --user=wordpress --password=gtsb-wp-dckr-user --no-tablespaces --skip-extended-insert wordpress > ./docker/seed/backup.sql
```
