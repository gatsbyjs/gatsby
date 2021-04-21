#!/bin/bash
set -e


wp user update admin --user_pass="secret"
wp plugin install custom-post-type-ui --version=$CPT_UI_VERSION

# activate plugins
wp plugin activate wp-graphql custom-post-type-ui wp-graphql-custom-post-type-ui advanced-custom-fields-pro basic-auth

wp plugin activate wp-graphql-acf

wp plugin activate wp-gatsby

# this seems to be needed now
wp core update-db
wp cache flush

# set path rewrite structure
wp rewrite structure '/%year%/%monthnum%/%day%/%postname%/'
wp rewrite flush
