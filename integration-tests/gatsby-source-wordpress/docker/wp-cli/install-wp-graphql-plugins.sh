#!/bin/bash
WP_CONTENT_DIR=/var/www/html/wp-content
PLUGIN_DIR=${WP_CONTENT_DIR}/plugins

mkdir -p ${PLUGIN_DIR} && \

# WP GraphQL from GitHub release
# example release url: https://github.com/wp-graphql/wp-graphql/releases/download/v1.3.7/wp-graphql.zip
mkdir -p ${PLUGIN_DIR}/wp-graphql \
    && curl -LO https://github.com/wp-graphql/wp-graphql/releases/download/${WPGRAPHQL_VERSION}/wp-graphql.zip \
    && unzip ./wp-graphql.zip -d ${PLUGIN_DIR}/wp-graphql && \

# Install wp-gatsby using git, and apply a diff
git clone --depth 1 -b ${WPGATSBY_VERSION} https://github.com/gatsbyjs/wp-gatsby.git ${PLUGIN_DIR}/wp-gatsby && \

# WP GraphQL ACF from GitHub release
install-plugin wp-graphql-acf wp-graphql/wp-graphql-acf ${WPGRAPHQL_ACF_VERSION} && \

# wp-graphql-gutenberg from Github release
install-plugin wp-graphql-gutenberg pristas-peter/wp-graphql-gutenberg ${WPGRAPHQL_GUTENBERG_VERSION} && \

# CPTUI from Github release
install-plugin custom-post-type-ui WebDevStudios/custom-post-type-ui ${CPT_UI_VERSION} && \

# WP GraphQL Yoast from GitHub release
install-plugin wp-graphql-yoast-seo ashhitch/wp-graphql-yoast-seo ${WPGRAPHQL_YOAST_VERSION} && \

git clone --depth 1 -b ${ACF_VERSION} https://github.com/wp-premium/advanced-custom-fields-pro.git ${PLUGIN_DIR}/advanced-custom-fields-pro && \

git clone --depth 1 https://github.com/WP-API/Basic-Auth.git ${PLUGIN_DIR}/basic-auth
