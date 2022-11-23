FROM wordpress:cli-php7.4

USER root
RUN apk add unzip git

RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -o /usr/local/bin/wait-for-it \
  && chmod +x /usr/local/bin/wait-for-it

COPY install-plugin.sh /usr/local/bin/install-plugin
RUN chmod +x  /usr/local/bin/install-plugin

COPY install-wp-graphql-plugins.sh /usr/local/bin/install-wp-graphql-plugins
RUN  chmod +x /usr/local/bin/install-wp-graphql-plugins

COPY start.sh /usr/local/bin/wp-start
RUN chmod +x /usr/local/bin/wp-start

USER xfs

CMD ["wait-for-it", "-t", "600", "wordpress:8001",  "--", "wp-start"]
