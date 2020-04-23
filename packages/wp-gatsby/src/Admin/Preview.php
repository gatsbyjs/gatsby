<?php

namespace WPGatsby\Admin;

use GraphQLRelay\Relay;

class Preview {
	function __construct() {
    $enable_gatsby_preview = self::get_setting('enable_gatsby_preview');

    if ($enable_gatsby_preview === 'on') {
      add_action( 'save_post', [ $this, 'post_to_preview_instance' ], 10, 2 );
		  add_filter( 'template_include', [ $this, 'setup_preview_template' ], 1, 99 );
    }
	}

	public function setup_preview_template( $template ) {
		$is_preview  = is_preview();
		$preview_url = \WPGatsby\Admin\Preview::get_gatsby_preview_instance_url();

		if ( $is_preview && $preview_url ) {
			return plugin_dir_path( __FILE__ ) . 'includes/preview-template.php';
		} elseif ( $is_preview && ! $preview_url ) {
			return plugin_dir_path( __FILE__ ) . 'includes/no-preview-url-set.php';
		}

		return $template;
	}

	static function get_setting( $key ) {
		$wpgatsby_settings = get_option( 'wpgatsby_settings' );

		return $wpgatsby_settings[ $key ] ?? null;
	}

	static function get_gatsby_preview_instance_url() {
		$preview_url = self::get_setting( 'preview_instance_url' );

		if ( ! $preview_url || ! filter_var( $preview_url, FILTER_VALIDATE_URL ) ) {
			return false;
		}

		if ( substr( $preview_url, - 1 ) !== '/' ) {
			$preview_url = "$preview_url/";
		}

		return $preview_url;
	}

	static function get_gatsby_preview_webhook() {
		$preview_webhook = self::get_setting( 'preview_api_webhook' );

		if (
			! $preview_webhook ||
			! filter_var( $preview_webhook, FILTER_VALIDATE_URL )
		) {
			return false;
		}

		if ( substr( $preview_webhook, - 1 ) !== '/' ) {
			$preview_webhook = "$preview_webhook/";
		}

		return $preview_webhook;
	}

	public function post_to_preview_instance( $post_ID, $post ) {
		if ( $post->post_type === 'action_monitor' ) {
			return;
		}

		if ( $post->post_status === 'draft' ) {
			return;
		}

		$is_new_post_draft =
			$post->post_status === 'auto-draft' &&
			$post->post_date_gmt === '0000-00-00 00:00:00';

		$is_revision = $post->post_type === 'revision';

		if ( ! $is_new_post_draft && ! $is_revision ) {
			return;
		}

		$token = \WPGatsby\GraphQL\Auth::get_token();

		if ( ! $token ) {
			// @todo error message?
			return;
		}

		$preview_webhook = $this::get_gatsby_preview_webhook();

		$original_post = get_post( $post->post_parent );

		$post_type_object = $original_post
			? \get_post_type_object( $original_post->post_type )
			: \get_post_type_object( $post->post_type );

		$global_relay_id = Relay::toGlobalId(
			$post_type_object->name,
			absint( $original_post->ID ?? $post_ID )
		);

		$referenced_node_single_name
			= $post_type_object->graphql_single_name ?? null;

		$graphql_endpoint = apply_filters( 'graphql_endpoint', 'graphql' );

		$graphql_url = get_home_url() . '/' . ltrim( $graphql_endpoint, '/' );

		$post_body = [
			'preview'        => true,
			'token'          => $token,
			'previewId'      => $post_ID,
			'id'             => $global_relay_id,
			'singleName'     => $referenced_node_single_name,
			'isNewPostDraft' => $is_new_post_draft,
			'isRevision'     => $is_revision,
			'remoteUrl'      => $graphql_url
		];

		// @todo error message if this doesn't work?
		wp_remote_post(
			$preview_webhook,
			[
				'body'        => wp_json_encode( $post_body ),
				'headers'     => [ 'Content-Type' => 'application/json; charset=utf-8' ],
				'method'      => 'POST',
				'data_format' => 'body',
			]
		);
	}
}
