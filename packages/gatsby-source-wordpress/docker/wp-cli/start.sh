#!/bin/bash
set -e

wp core install \
    --path="/var/www/html" \
    --url="http://localhost:8001" \
    --title="Gatsby & WordPress" \
    --admin_user=admin \
    --admin_password=secret \
    --admin_email=admin@admin.com


wp search-replace 'https://devgatsbyint.wpengine.com' 'http://localhost:8001'

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
