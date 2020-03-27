<?php
namespace WPGatsby\Admin;

use GraphQLRelay\Relay;

class Preview {
  function __construct() {
    add_action( 'save_post', [ $this, 'post_to_preview_instance' ], 10, 2 );
    add_filter( 'template_include', [ $this, 'setup_preview_template' ], 1, 99 );
  }

  public function setup_preview_template( $template ) {
    $is_preview = is_preview();
    $preview_url = \WPGatsby\Admin\Preview::get_gatsby_preview_instance_url();

    if ( $is_preview && $preview_url ) {
      return plugin_dir_path( __FILE__ ) . 'includes/preview-template.php';
    } elseif ( $is_preview && !$preview_url ) {
      return plugin_dir_path( __FILE__ ) . 'includes/no-preview-url-set.php';
    }

    return $template;
  }

  static function get_setting( $key ) {
    $wpgatsby_settings = get_option( 'wpgatsby_settings' );

    return $wpgatsby_settings[ $key ] ?? null;
  }

  static function get_gatsby_preview_instance_url() {
    $preview_url = self::get_setting( 'preview_api_webhook' );

    if ( !$preview_url || !filter_var( $preview_url, FILTER_VALIDATE_URL ) ) {
      return false;
    }

    if ( substr($preview_url, -1) !== '/' ) {
      $preview_url = "$preview_url/";
    }

    return $preview_url;
  }

  public function post_to_preview_instance( $post_ID, $post ) {
      if ( $post->post_status === 'auto-draft' ) {
        return false;
      }

      if ( $post->post_type !== 'revision' ) {
        return false;
      }

      $preview_url = $this::get_gatsby_preview_instance_url();

      $preview_url = "${preview_url}__refresh";

      $token = \WPGatsby\GraphQL\Auth::get_token();

      if ( !$token ) {
        return;
      }

      $original_post = get_post( $post->post_parent );

      $post_type_object = \get_post_type_object( $original_post->post_type );

      $global_relay_id = Relay::toGlobalId(
          $post_type_object->name,
          absint( $original_post->ID )
      );

      $referenced_node_single_name
        = $post_type_object->graphql_single_name ?? null;

      $post_body = [
        'preview' => true,
        'token' => $token,
        'previewId' => $post_ID,
        'id' => $global_relay_id,
        'singleName' => $referenced_node_single_name
      ];

      wp_remote_post(
        $preview_url,
        [
          'body' => wp_json_encode( $post_body ),
          'headers' => ['Content-Type' => 'application/json; charset=utf-8'],
          'method' => 'POST',
          'data_format' => 'body',
        ]
      );
    }
}

?>
