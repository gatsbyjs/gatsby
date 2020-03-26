<?php

namespace WPGatsby\GraphQL;

use \Firebase\JWT\JWT;
use \WPGatsby\Admin\Preview;

class ParseAuthToken {
  function __construct() {
    add_filter( 'determine_current_user', [$this, 'determine_current_user'], 99 );
  }

  public function determine_current_user( $user_id ) {
    $jwt = $_SERVER['HTTP_WPGATSBYPREVIEW'] ?? null;

    if ( $jwt ) {
      $secret = Preview::get_setting( 'preview_jwt_secret' );
      $decoded = JWT::decode($jwt, $secret, array('HS256'));
      $user_id = $decoded->data->user_id ?? $user_id;
    }

    return $user_id;
  }

}

?>
