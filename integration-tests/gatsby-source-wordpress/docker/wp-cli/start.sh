#!/bin/bash
set -e

echo "define( 'GRAPHQL_DEBUG', true );" >> /var/www/html/wp-config.php

cd /var/www/html && \

wp plugin deactivate --all && \

install-wp-graphql-plugins && \

# Delete unwanted plugins
wp plugin delete akismet hello && \

# install yoast
wp plugin install wordpress-seo --version=${YOAST_SEO_VERSION} && \

# activate plugins
wp plugin activate --all && \

# this seems to be needed now
wp core update-db && \
wp cache flush && \

# set path rewrite structure
wp rewrite structure '/%year%/%monthnum%/%day%/%postname%/' && \
wp rewrite flush
