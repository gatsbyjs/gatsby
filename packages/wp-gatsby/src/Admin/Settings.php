<?php

namespace WPGatsby\Admin;

class Settings {

	private $settings_api;

	function __construct() {
		$this->settings_api = new \WPGraphQL_Settings_API;

		add_action( 'admin_init', [ $this, 'admin_init' ] );
		add_action( 'admin_menu', [ $this, 'register_settings_page' ] );
	}

	function admin_init() {
		//set the settings
		$this->settings_api->set_sections( $this->get_settings_sections() );
		$this->settings_api->set_fields( $this->get_settings_fields() );

		//initialize settings
		$this->settings_api->admin_init();
	}

	function admin_menu() {
		add_options_page( 'Settings API', 'Settings API', 'delete_posts', 'settings_api_test', [
			$this,
			'plugin_page'
		] );
	}


	function get_settings_sections() {
		$sections = [
			[
				'id'    => 'wpgatsby_settings',
				'title' => __( 'Settings', 'wpgatsby_settings' )
			]
		];

		return $sections;
	}

	public function register_settings_page() {
		add_options_page( 'Gatsby', 'GatsbyJS', 'manage_options', 'gatsbyjs', [
			$this,
			'plugin_page'
		] );
	}


	function plugin_page() {
		echo '<div class="wrap">';
		$this->settings_api->show_navigation();
		$this->settings_api->show_forms();
		echo '</div>';
	}

	static public function prefix_get_option( $option, $section, $default = '' ) {
		$options = get_option( $section );

		if ( isset( $options[ $option ] ) ) {
			return $options[ $option ];
		}

		return $default;
	}

	private static function generate_secret() {
		$factory   = new \RandomLib\Factory;
		$generator = $factory->getMediumStrengthGenerator();
		$secret    = $generator->generateString( 50 );

		return $secret;
	}

	private static function get_default_secret() {
		$default_secret = \WPGatsby\Admin\Preview::get_setting( 'preview_jwt_secret' );

		if ( ! $default_secret ) {
			$default_secret = self::generate_secret();
		}

		return $default_secret;
	}

	public static function sanitize_url_field( $input ) {
		return filter_var( $input, FILTER_VALIDATE_URL );
	}

	/**
	 * Returns all the settings fields
	 *
	 * @return array settings fields
	 */
	function get_settings_fields() {
		$settings_fields = [
			'wpgatsby_settings' => [
				[
					'name'              => 'builds_api_webhook',
					'label'             => __( 'Builds Webhook', 'wpgatsby_settings' ),
					'desc'              => __( 'Enter your Gatsby Builds Webhook URL. Must begin with http:// or https://.', 'wpgatsby_settings' ),
					'placeholder'       => __( 'https://', 'wpgatsby_settings' ),
					'type'              => 'text',
					'sanitize_callback' => function( $input ) {
						return $this->sanitize_url_field( $input );
					}
        ],
        [
          'name' => 'enable_gatsby_preview',
          'label' => __( 'Enable Gatsby Preview?', 'wpgatsby_settings' ),
          'desc' => __( 'Yes', 'wpgatsby_settings' ),
          'type' => 'checkbox'
        ],
				[
					'name'              => 'preview_instance_url',
					'label'             => __( 'Preview Instance', 'wpgatsby_settings' ),
					'desc'              => __( 'Enter your Gatsby Preview instance URL. Must begin with http:// or https://.', 'wpgatsby_settings' ),
					'placeholder'       => __( 'https://', 'wpgatsby_settings' ),
					'type'              => 'text',
					'sanitize_callback' => function( $input ) {
						return $this->sanitize_url_field( $input );
					}
				],
				[
					'name'              => 'preview_api_webhook',
					'label'             => __( 'Preview Webhook', 'wpgatsby_settings' ),
					'desc'              => __( 'Enter your Gatsby Preview Webhook URL. Must begin with http:// or https://.', 'wpgatsby_settings' ),
					'placeholder'       => __( 'https://', 'wpgatsby_settings' ),
					'type'              => 'text',
					'sanitize_callback' => function( $input ) {
						return $this->sanitize_url_field( $input );
					}
				],
				[
					'name'              => 'preview_jwt_secret',
					'label'             => __( 'Preview JWT Secret', 'wpgatsby_settings' ),
					'desc'              => __( 'This secret is used in the encoding and decoding of the JWT token. If the Secret were ever changed on the server, ALL tokens that were generated with the previous Secret would become invalid. So, if you wanted to invalidate all user tokens, you can change the Secret on the server and all previously issued tokens would become invalid and require users to re-authenticate.', 'wpgatsby_settings' ),
					'type'              => 'password',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => self::get_default_secret(),
				],
			]
		];

		return $settings_fields;
	}
}
