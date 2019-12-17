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

        \register_graphql_field(
            'RootQuery', 'schemaMd5', [
            'type' => 'String',
            'description' => __('Returns an MD5 hash of the schema, useful in determining if the schema has changed.', 'wp-gatsby'),
            'resolve' => function () {
                $graphql = \graphql(
                    [
                    'query' => ' {
                      __schema {
                        types {
                          kind
                          name
                          possibleTypes {
                            kind
                            name
                          }
                          interfaces {
                            kind
                            name
                          }
                          ofType {
                            kind
                            name
                          }
                          fields {
                            name
                            args {
                              type {
                                kind
                              }
                            }
                            type {
                              name
                              kind
                              ofType {
                                kind
                                name
                              }
                            }
                          }
                        }
                      }
                    } '
                     ]
                );
                $json_string = \wp_json_encode($graphql);
                $md5 = md5($json_string);
                return $md5;
            },
            ]
        );
    }
}
?>