#!/bin/bash

set -e

echo "xdebug.max_nesting_level=-1" >> /usr/local/etc/php/php.ini-development
echo "xdebug.max_nesting_level=-1" >> /usr/local/etc/php/php.ini-production
echo "xdebug.max_nesting_level=-1" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini


sed -i "s/Listen 80$/Listen 8001/g" /etc/apache2/ports.conf
sed -i "s/80>$/8001>/g" /etc/apache2/sites-available/000-default.conf
docker-entrypoint.sh apache2-foreground
