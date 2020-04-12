<?php

namespace WPGatsby\GraphQL;

use \Firebase\JWT\JWT;
use \WPGatsby\Admin\Preview;

class ParseAuthToken {
	function __construct() {
		add_action( 'init_graphql_request', [ $this, 'set_current_user' ] );
	}

	function set_current_user() {
		$jwt = $_SERVER['HTTP_WPGATSBYPREVIEW'] ?? null;

		if ( $jwt ) {
			$secret  = Preview::get_setting( 'preview_jwt_secret' );
			$decoded = JWT::decode( $jwt, $secret, array( 'HS256' ) );
			$user_id = $decoded->data->user_id ?? null;

			if ( $user_id ) {
				wp_set_current_user( $user_id );
			}
		}
	}

}
