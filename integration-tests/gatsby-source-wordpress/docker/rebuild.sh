#!/bin/bash

function log () {
  echo -e "\n\n[gatsby-source-wordpress] ${1}\n\n"
}

log 'Rebuilding test docker-compose'

docker-compose rm -fsv && \
docker volume rm gatsby-source-wordpress_db_data gatsby-source-wordpress_wp_data && \
docker builder prune -f && \
docker-compose up --force-recreate --build --remove-orphans -d && \

log 'Successfully rebuilt test docker-compose. \n\nContainers are now running in detached mode & next the script will follow logs for wordpress & wp-cli.\nIf you press ctrl/cmd+C to exit the log follow process, the containers will remain running.\nYou can use docker-compose stop to stop them.'
