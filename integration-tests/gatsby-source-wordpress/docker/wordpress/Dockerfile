FROM wordpress:5.6

ARG WP_CONTENT_DIR=/usr/src/wordpress/wp-content
ARG PLUGIN_DIR=${WP_CONTENT_DIR}/plugins
ARG UPLOADS_DIR=${WP_CONTENT_DIR}/uploads

LABEL maintainer="tyler@gatsbyjs.com"

# Set timezone, install XDebug, PHP Composer, WP-CLI
RUN echo 'date.timezone = "UTC"' > /usr/local/etc/php/conf.d/timezone.ini \
  && apt-get update && apt-get install unzip git -y && rm -rf /var/lib/apt/lists/* \
  && curl -Ls 'https://raw.githubusercontent.com/composer/getcomposer.org/fc4099e0ac116a1c8f61fffaf6693594dda79d16/web/installer' | php -- --quiet \
  && chmod +x composer.phar \
  && mv composer.phar /usr/local/bin/composer \
  && curl -O 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar' \
  && chmod +x wp-cli.phar \
  && mv wp-cli.phar /usr/local/bin/wp


RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -o /usr/local/bin/wait-for-it \
  && chmod +x /usr/local/bin/wait-for-it

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

RUN curl -L https://storage.googleapis.com/gatsby-source-wordpress-files/gatsby-source-wordpress-test-uploads.zip > /tmp/archive.zip
RUN unzip -a -d ${WP_CONTENT_DIR} /tmp/archive.zip
RUN rm -rf ${WP_CONTENT_DIR}/__MACOSX && mv ${WP_CONTENT_DIR}/gatsby-source-wordpress-test-uploads/wp-content/uploads ${UPLOADS_DIR}
RUN rm /tmp/archive.zip

COPY install-plugin.sh /usr/local/bin/install-plugin
RUN chmod +x  /usr/local/bin/install-plugin

COPY install-wp-graphql-plugins.sh /usr/local/bin/install-wp-graphql-plugins
RUN  chmod +x /usr/local/bin/install-wp-graphql-plugins

COPY plugins/* ${PLUGIN_DIR}

EXPOSE 8001

CMD ["wait-for-it", "-t", "40", "db:3306", "--", "/usr/local/bin/start.sh"]
