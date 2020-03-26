<?php
namespace WP_Gatsby\Admin;

use GraphQLRelay\Relay;

class Preview {
  function __construct() {
    add_action( 'save_post', [$this, 'post_to_preview_instance'], 10, 2 );
    add_filter('template_include', [$this, 'setup_preview_template'], 1, 1);
  }

  public function setup_preview_template( $template ) {
    if ( is_preview() ) {
      return plugin_dir_path(__FILE__) . 'includes/preview-template.php';
    }

    return $template;
  }

  static function get_gatsby_preview_instance_url() {
    $wpgatsby_settings = get_option('wpgatsby_settings');
    $preview_url = $wpgatsby_settings['preview_api_webhook'];

    if (substr($preview_url, -1) !== '/') {
      $preview_url = "$preview_url/";
    }

    return $preview_url;
  }

  public function post_to_preview_instance( $post_ID, $post ) {
      if ($post->post_status === 'auto-draft') {
        return false;
      }

      if ($post->post_type !== 'revision') {
        return false;
      }


      if ($post->post_type === 'action_monitor') {
        return false;
      }

      $preview_url = $this::get_gatsby_preview_instance_url();

      $preview_url = "${preview_url}__refresh";

      $result = graphql([
        'query' => '{
          viewer {
            jwtAuthToken
          }
        }'
      ]);

      $token = $result['data']['viewer']['jwtAuthToken'] ?? null;

      if (!$token) {
        return;
      }

      $original_post = get_post($post->post_parent);

      $post_type_object = \get_post_type_object($original_post->post_type);

      $global_relay_id = Relay::toGlobalId(
          $post_type_object->name,
          absint($original_post->ID)
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

      // @todo some special error handling here?
      // are there built in WP toast messages we can send?
      // or just throw an error here if there's no response mbe
      // $preview_response =
      wp_remote_post(
        $preview_url,
        [
          'body' => json_encode($post_body),
          'headers' => array('Content-Type' => 'application/json; charset=utf-8'),
          'method' => 'POST',
          'data_format' => 'body',
        ]
      );

    }
}

?>
