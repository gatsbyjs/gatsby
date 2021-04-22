#!/bin/bash
set -e

# Delete unwanted plugins
wp plugin delete akismet hello

# activate plugins
wp plugin activate wp-graphql custom-post-type-ui wp-graphql-custom-post-type-ui advanced-custom-fields-pro basic-auth wp-graphql-acf wp-gatsby

# this seems to be needed now
wp core update-db
wp cache flush

# set path rewrite structure
wp rewrite structure '/%year%/%monthnum%/%day%/%postname%/'
wp rewrite flush
