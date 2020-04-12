<?php

namespace WPGatsby\ActionMonitor;

use WPGatsby\Admin\Settings;

class Dispatcher {
	/**
	 * Whether a build hook should be dispatched. Default false.
	 *
	 * @var bool
	 */
	protected $should_dispatch = false;

	public function __construct() {
		add_action( 'save_post_action_monitor', [ $this, 'queue_dispatch' ], 10, 3 );
		add_action( 'shutdown', [ $this, 'trigger_dispatch' ] );
	}

	/**
	 * @param $post_id int The ID of the Post being saved
	 * @param $post    \WP_Post The Post Object being saved
	 * @param $update  bool Whether this is an existing post being updated or not.
	 */
	public function queue_dispatch( $post_id, $post, $update ) {
		$this->should_dispatch = true;
	}

	public function trigger_dispatch() {
		$webhook_url = Settings::prefix_get_option( 'builds_api_webhook', 'wpgatsby_settings', false );

		if ( $webhook_url && $this->should_dispatch ) {
			wp_safe_remote_post( $webhook_url );
		}
	}
}
