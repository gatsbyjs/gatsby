<?php
namespace WP_Gatsby\Admin;

class Settings
{

    private $settings_api;

    function __construct()
    {
        $this->settings_api = new \WPGraphQL_Settings_API;

        add_action('admin_init', [$this, 'admin_init']);
        add_action('admin_menu', [$this, 'register_settings_page']);
    }

    function admin_init()
    {
        //set the settings
        $this->settings_api->set_sections($this->get_settings_sections());
        $this->settings_api->set_fields($this->get_settings_fields());

        //initialize settings
        $this->settings_api->admin_init();
    }

    function admin_menu()
    {
        add_options_page('Settings API', 'Settings API', 'delete_posts', 'settings_api_test', [$this, 'plugin_page']);
    }


    function get_settings_sections()
    {
        $sections = [
        [
        'id'    => 'wpgatsby_settings',
        'title' => __('Settings', 'wpgatsby_settings')
        ]
        ];
        return $sections;
    }

    public function register_settings_page()
    {
        // @todo: abstract this to a settings class we can easily register settings to...
        add_options_page('Gatsby', 'GatsbyJS', 'manage_options', 'gatsbyjs', [ $this, 'plugin_page' ]);
    }


    function plugin_page()
    {
        echo '<div class="wrap">';
        $this->settings_api->show_navigation();
        $this->settings_api->show_forms();
        echo '</div>';
    }

    static public function prefix_get_option( $option, $section, $default = '' ) {
      $options = get_option( $section );

      if ( isset( $options[$option] ) ) {
          return $options[$option];
      }

      return $default;
    }

    /**
     * Returns all the settings fields
     *
     * @return array settings fields
     */
    function get_settings_fields()
    {
        $settings_fields = [
          'wpgatsby_settings' => [
            [
            'name'              => 'preview_api_webhook',
            'label'             => __('Preview Webhook', 'wpgatsby_settings'),
            'desc'              => __('Enter your Gatsby Preview Webhook URL', 'wpgatsby_settings'),
            'placeholder'       => __('https://', 'wpgatsby_settings'),
            'type'              => 'text',
            'sanitize_callback' => 'sanitize_text_field'
            ],
            [
              'name'              => 'builds_api_webhook',
              'label'             => __('Builds Webhook', 'wpgatsby_settings'),
              'desc'              => __('Enter your Gatsby Builds Webhook URL', 'wpgatsby_settings'),
              'placeholder'       => __('https://', 'wpgatsby_settings'),
              'type'              => 'text',
              'sanitize_callback' => 'sanitize_text_field'
            ],
          ]
        ];
        return $settings_fields;
    }
}
