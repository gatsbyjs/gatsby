#!/bin/bash
WP_CONTENT_DIR=/var/www/html/wp-content
PLUGIN_DIR=${WP_CONTENT_DIR}/plugins

mkdir -p ${PLUGIN_DIR} && \

# WP GraphQL from GitHub release
# example release url: https://github.com/wp-graphql/wp-graphql/releases/download/v1.3.7/wp-graphql.zip
mkdir -p ${PLUGIN_DIR}/wp-graphql \
    && curl -LO https://github.com/wp-graphql/wp-graphql/releases/download/${WPGRAPHQL_VERSION}/wp-graphql.zip \
    && unzip ./wp-graphql.zip -d ${PLUGIN_DIR} && \

# Install wp-gatsby using git, and apply a diff
git clone --depth 1 -b ${WPGATSBY_VERSION} https://github.com/gatsbyjs/wp-gatsby.git ${PLUGIN_DIR}/wp-gatsby && \

# WP GraphQL ACF from GitHub release
mkdir -p ${PLUGIN_DIR}/wpgraphql-acf \
    && curl -LO https://github.com/wp-graphql/wpgraphql-acf/releases/download/${WPGRAPHQL_ACF_VERSION}/wpgraphql-acf.zip \
    && unzip ./wpgraphql-acf.zip -d ${PLUGIN_DIR} && \

# wp-graphql-content-blocks from Github release
mkdir -p ${PLUGIN_DIR}/wp-graphql-content-blocks \
    && curl -LO https://github.com/wpengine/wp-graphql-content-blocks/releases/download/${WPGRAPHQL_CONTENT_BLOCKS_VERSION}/wp-graphql-content-blocks.zip \
    && unzip ./wp-graphql-content-blocks.zip -d ${PLUGIN_DIR}/wp-graphql-content-blocks && \

# CPTUI from Github release
install-plugin custom-post-type-ui WebDevStudios/custom-post-type-ui ${CPT_UI_VERSION} && \

# WP GraphQL Yoast from GitHub release
curl -LO https://github.com/ashhitch/wp-graphql-yoast-seo/releases/download/${WPGRAPHQL_YOAST_VERSION}/wp-graphql-yoast-seo.zip \
    && unzip ./wp-graphql-yoast-seo.zip -d ${PLUGIN_DIR} && \

git clone --depth 1 -b ${ACF_VERSION} https://github.com/wp-premium/advanced-custom-fields-pro.git ${PLUGIN_DIR}/advanced-custom-fields-pro && \

git clone --depth 1 https://github.com/WP-API/Basic-Auth.git ${PLUGIN_DIR}/basic-auth
