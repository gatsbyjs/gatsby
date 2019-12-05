<?php 

namespace WP_Gatsby\Schema;

/**
 * Adds info about the current site
 */
class SiteMeta
{
    /**
     * 
     */
    function __construct()
    {
        add_action(
            'graphql_register_types', function () {
                $this->registerFields();
            } 
        );
    }

    /**
     * Registers site meta fields...
     */
    function registerFields() {
        \register_graphql_field(
            'RootQuery', 'isWpGatsby', [
            'type' => 'Boolean',
            'description' => __('Confirms this is a WP Gatsby site', 'wp-gatsby'),
            'resolve' => function () {
                return true;
            },
            ]
        );
    }
}
?>