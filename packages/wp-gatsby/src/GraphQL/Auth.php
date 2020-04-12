<?php

namespace WPGatsby\GraphQL;

use \Firebase\JWT\JWT;
use \WPGatsby\Admin\Preview;

class Auth {
	static function get_token() {
		$site_url    = get_bloginfo( 'url' );
		$preview_url = Preview::get_gatsby_preview_instance_url();
		$secret      = Preview::get_setting( 'preview_jwt_secret' );
		$now         = time();
		$expiry      = $now + 30;
		$user_id     = get_current_user_id();

		$payload = [
			"iss"  => $site_url,
			"aud"  => $preview_url,
			"iat"  => $now,
			"nbf"  => $now,
			"exp"  => $expiry,
			"data" => [
				"user_id" => $user_id,
			],
		];

		$jwt = JWT::encode( $payload, $secret );

		return $jwt;
	}
}
