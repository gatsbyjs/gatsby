#!/bin/bash
WP_CONTENT_DIR=/usr/src/wordpress/wp-content
PLUGIN_DIR=${WP_CONTENT_DIR}/plugins

mkdir -p ${PLUGIN_DIR} && \
# WP GraphQL from GitHub release
git clone --depth 1 -b ${WPGRAPHQL_VERSION} https://github.com/wp-graphql/wp-graphql.git ${PLUGIN_DIR}/wp-graphql && \

# Install wp-gatsby using git, and apply a diff
git clone --depth 1 -b ${WPGATSBY_VERSION} https://github.com/gatsbyjs/wp-gatsby.git ${PLUGIN_DIR}/wp-gatsby && \

# WP GraphQL ACF from GitHub release
install-plugin wp-graphql-acf wp-graphql/wp-graphql-acf ${WPGRAPHQL_ACF_VERSION} && \

# WP GraphQL CPTUI from GitHub release
install-plugin wp-graphql-custom-post-type-ui wp-graphql/wp-graphql-custom-post-type-ui ${WPGRAPHQL_CPT_UI_VERSION} && \

git clone --depth 1 -b ${ACF_VERSION} https://github.com/wp-premium/advanced-custom-fields-pro.git ${PLUGIN_DIR}/advanced-custom-fields-pro && \

git clone --depth 1 https://github.com/WP-API/Basic-Auth.git ${PLUGIN_DIR}/basic-auth
