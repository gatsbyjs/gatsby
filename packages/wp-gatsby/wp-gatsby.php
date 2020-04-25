<?php
/**
 * Plugin Name: WP Gatsby
 * Description: Optimize your WordPress site to be a source for Gatsby site(s).
 * Version: 0.2.3
 * Author: GatsbyJS, Jason Bahl, Tyler Barnes
 * Author URI: https://gatsbyjs.org
 * Text Domain: wp-gatsby
 * Domain Path: /languages/
 * Requires at least: 4.7.0
 * Requires PHP: 7.0
 * License: GPL-3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require __DIR__ . "/lib/wp-settings-api.php";

/**
 * The one true WPGatsby class
 */
final class WPGatsby {

	/**
	 * Instance of the main WPGatsby class
	 *
	 * @var WPGatsby $instance
	 */
	private static $instance;

	/**
	 * Returns instance of the main WPGatsby class
	 *
	 * @return WPGatsby
	 * @throws Exception
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) && ! ( self::$instance instanceof WPGatsby ) ) {
			self::$instance = new WPGatsby();
			self::$instance->setup_constants();
			if ( WPGATSBY_AUTOLOAD ) {
				self::$instance->includes();
				self::$instance->init();
			}
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone.
	 * The whole idea of the singleton design pattern is that there is a single object
	 * therefore, we don't want the object to be cloned.
	 *
	 * @since  0.0.1
	 * @access public
	 * @return void
	 */
	public function __clone() {

		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'The WPGATSBY class should not be cloned.', 'wp-gatsby' ), '0.0.1' );

	}

	/**
	 * Disable unserializing of the class.
	 *
	 * @since  0.0.1
	 * @access protected
	 * @return void
	 */
	public function __wakeup() {

		// De-serializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'De-serializing instances of the WPGATSBY class is not allowed', 'wp-gatsby' ), '0.0.1' );

	}

	/**
	 * Setup plugin constants.
	 *
	 * @access private
	 * @since  0.0.1
	 * @return void
	 */
	private function setup_constants() {
		// Plugin version.
		if ( ! defined( 'WPGATSBY_VERSION' ) ) {
			define( 'WPGATSBY_VERSION', '0.2.3' );
		}

		// Plugin Folder Path.
		if ( ! defined( 'WPGATSBY_PLUGIN_DIR' ) ) {
			define( 'WPGATSBY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		}

		// Plugin Folder URL.
		if ( ! defined( 'WPGATSBY_PLUGIN_URL' ) ) {
			define( 'WPGATSBY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
		}

		// Plugin Root File.
		if ( ! defined( 'WPGATSBY_PLUGIN_FILE' ) ) {
			define( 'WPGATSBY_PLUGIN_FILE', __FILE__ );
		}

		// Whether to autoload the files or not.
		if ( ! defined( 'WPGATSBY_AUTOLOAD' ) ) {
			define(
				'WPGATSBY_AUTOLOAD',
				// only autoload if WPGQL is active
				defined( 'WPGRAPHQL_AUTOLOAD' ) ? true : false
			);
		}

		// Whether to run the plugin in debug mode. Default is false.
		if ( ! defined( 'WPGATSBY_DEBUG' ) ) {
			define( 'WPGATSBY_DEBUG', false );
		}

	}

	/**
	 * Include required files.
	 * Uses composer's autoload
	 *
	 * @access private
	 * @since  0.0.1
	 * @return void
	 */
	private function includes() {

		/**
		 * WPGATSBY_AUTOLOAD can be set to "false" to prevent the autoloader from running.
		 * In most cases, this is not something that should be disabled, but some environments
		 * may bootstrap their dependencies in a global autoloader that will autoload files
		 * before we get to this point, and requiring the autoloader again can trigger fatal errors.
		 *
		 * The codeception tests are an example of an environment where adding the autoloader again causes issues
		 * so this is set to false for tests.
		 */
		if ( defined( 'WPGATSBY_AUTOLOAD' ) && true === WPGATSBY_AUTOLOAD ) {
			// Autoload Required Classes.
			include_once WPGATSBY_PLUGIN_DIR . 'vendor/autoload.php';
		}

		// Required non-autoloaded classes.
		include_once WPGATSBY_PLUGIN_DIR . 'access-functions.php';

	}

	/**
	 * Initialize plugin functionality
	 */
	public static function init() {
		/**
		 * Initialize Admin Settings
		 */
		new \WPGatsby\Admin\Settings();

		/**
		 * Initialize Admin Previews
		 */
		new \WPGatsby\Admin\Preview();

		/**
		 * Initialize Schema changes
		 */
		new \WPGatsby\Schema\Schema();

		/**
		 * Initialize Action Monitor
		 */
		new \WPGatsby\ActionMonitor\ActionMonitor();

		/**
		 * Initialize Auth token parser
		 */
		new \WPGatsby\GraphQL\ParseAuthToken();

		/**
		 * Dispatch builds
		 */
		new \WPGatsby\ActionMonitor\Dispatcher();
	}

}

if ( ! function_exists( 'gatsby_init' ) ) {
	function gatsby_init() {
		return WPGatsby::instance();
	}
}

add_action( 'plugins_loaded', function() {
	gatsby_init();
} );
