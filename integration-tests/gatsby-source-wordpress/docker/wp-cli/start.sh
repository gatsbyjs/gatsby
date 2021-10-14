#!/bin/bash
set -e

# Delete unwanted plugins
wp plugin delete akismet hello

wp plugin install wordpress-seo

# activate plugins
wp plugin activate --all

# this seems to be needed now
wp core update-db
wp cache flush

# set path rewrite structure
wp rewrite structure '/%year%/%monthnum%/%day%/%postname%/'
wp rewrite flush
