FROM wordpress:5.9

ARG ROOT_DIR=/var/www/html
ARG WP_CONTENT_DIR=${ROOT_DIR}/wp-content
ARG PLUGIN_DIR=${WP_CONTENT_DIR}/plugins
ARG UPLOADS_DIR=${WP_CONTENT_DIR}/uploads

LABEL maintainer="tyler@gatsbyjs.com"

# Set timezone
RUN echo 'date.timezone = "UTC"' > /usr/local/etc/php/conf.d/timezone.ini
# install system deps
RUN apt-get update && apt-get install unzip git -y && rm -rf /var/lib/apt/lists/*
# install wp-cli
RUN curl -O 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar' \
  && chmod +x wp-cli.phar \
  && mv wp-cli.phar /usr/local/bin/wp

RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -o /usr/local/bin/wait-for-it \
  && chmod +x /usr/local/bin/wait-for-it

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

COPY wp-content /tmp/wp-content
RUN cp -R /tmp/wp-content/* ${WP_CONTENT_DIR} && cp -R /tmp/wp-content/* /usr/src/wordpress/wp-content && rm -Rf /tmp/wp-content

COPY plugins/* ${PLUGIN_DIR}/

RUN find ${ROOT_DIR} -type d -exec chmod 777 {} \;
RUN find ${WP_CONTENT_DIR} -type f -exec chmod 644 {} \;

EXPOSE 8001

CMD ["wait-for-it", "-t", "40", "db:3306", "--", "/usr/local/bin/start.sh"]
