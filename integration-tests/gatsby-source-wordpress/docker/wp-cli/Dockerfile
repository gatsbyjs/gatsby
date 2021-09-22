FROM wordpress:cli-php7.4

USER root
RUN apk add unzip git

RUN mkdir -p /etc/X11/fs/.wp-cli/cache

RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -o /usr/local/bin/wait-for-it \
  && chmod +x /usr/local/bin/wait-for-it

COPY start.sh /usr/local/bin/wp-start
RUN chmod +x /usr/local/bin/wp-start

USER xfs

CMD ["wait-for-it", "-t", "60", "wordpress:8001",  "--", "wp-start"]
