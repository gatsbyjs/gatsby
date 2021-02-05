if ! $(wp core is-installed); then
echo "heyyyy"
  wp core install \
    --path="/var/www/html" \
    --url="http://localhost:8001" \
    --title="Gatsby & WordPress" \
    --admin_user=admin \
    --admin_password=secret \
    --admin_email=foo@bar.com
else
  echo "WordPress is already installed."
fi

eval $1
