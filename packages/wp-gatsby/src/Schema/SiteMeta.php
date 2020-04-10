<?php

namespace WPGatsby\Schema;
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
                $this->register();
            }
        );
    }

    /**
     * Registers site meta fields...
     */
    function register() {

	    register_graphql_object_type( 'WPGatsbyCompatiblity', [
		    'description' => __( 'Check compatibility with a given version of gatsby-source-wordpress and the WordPress source site.' ),
		    'fields' => [
			    'isCompatible' => [
				    'type' => 'Boolean',
				    'description' => __( 'Whether the provided version of the gatsby-source-wordpress plugin is compatible with the WordPress server', 'wp-gatsby' ),
			    ],
			    'messages' => [
				    'type' => [ 'list_of' => 'String' ],
				    'description' => __( 'If the provided version of gatsby-source-wordpress is incompatible, theses messages will provide further information.', 'wp-gatsby'),
			    ],
		    ]
	    ] );

	    register_graphql_field( 'RootQuery', 'wpGatsbyCompatibility', [
		    'description' => __( 'Information about the compatibility of the WordPress server with a provided version of gatsby-source-wordpress.', 'wp-gatsby' ),
		    'type' => 'WPGatsbyCompatiblity',
		    'args' => [
			    'version' => [
				    'type' => [ 'non_null' => 'String' ],
				    'description' => __( 'The version of the gatsby-source-wordPress plugin to check compatibility with', 'wp-gatsby' ),
			    ],
		    ],
		    'resolve' => function( $root, $args, $context, $info ) {

			    $is_compatible = true;
			    $messages = [];
			    $version = isset( $args['version'] ) ? $args['version'] : null;

			    if ( empty( $version ) ) {
					$is_compatible = false;
					$messages[] = __( 'No version was provided for the compatibility check. Please provide a valid version of the gatsby-source-wordpress plugin.', 'wp-gatsby' );
			    }

			    // @todo: Update path when this moves away from Tyler's fork
			    $remote_compatibility = wp_remote_get( 'https://raw.githubusercontent.com/TylerBarnes/gatsby/feat/source-wordpress-v4/packages/wp-gatsby/compatibility.json' );

			    /**
			     * If the remote file cannot be fetched and returned properly, fallback to the local file in the installed version of WPGatsby
			     */
			    if ( is_wp_error( $remote_compatibility ) || 200 !== $remote_compatibility['response']['code'] || empty( $remote_compatibility['body'] ) )  {
				    $compatibility_file = file_get_contents( WPGATSBY_PLUGIN_DIR . 'compatibility.json' );
				    $compatibility = ! empty( $compatibility_file ) ? json_decode( $compatibility_file, true ) : null;
			    } else {
				    $compatibility = json_decode( $remote_compatibility['body'], true );
			    }

			    /**
			     * If compatibility info cannot be determined
			     */
			    if ( empty( $compatibility ) || ! isset( $compatibility[ $version ] ) ) {

					$is_compatible = false;
					$messages[] = sprintf( __( 'The compatibility for version %s could not be determined', 'wp-gatsby' ), $version );

			    } else {

				    /**
				     * Get the versions of WPGraphQL and WPGatsby
				     */
				    $installed_wpgraphql_version = defined( 'WPGRAPHQL_VERSION' ) ? WPGRAPHQL_VERSION : null;
				    $installed__wpgatsby_version = defined( 'WPGATSBY_VERSION' ) ? WPGATSBY_VERSION : null;
			    	$version_compat = $compatibility[ $version ];

			    	// If wp-graphql isn't specified for a specific version
			    	if ( ! isset( $version_compat['wp-graphql'] ) ) {
					    $is_compatible = false;
						$messages[] = sprintf(__( 'The version of WPGraphQL compatible with gatsby-source-wordpress v%s could not be determined', 'wp-gatsby' ), $version );
				    }

				    // If wp-gatsby isn't specified for as specific version
				    if ( ! isset( $version_compat['wp-gatsby'] ) ) {
					    $is_compatible = false;
					    $messages[] = sprintf(__( 'The version of WPGatsby compatible with gatsby-source-wordpress v%s could not be determined', 'wp-gatsby' ), $version );
				    }

				    // If active WPGraphQL is lower than compatible min
				    if ( ! isset( $version_compat['wp-graphql']['min'] ) ) {
					    $is_compatible = false;
					    $messages[] = sprintf(__( 'The minimum required version of WPGraphQL compatible with gatsby-source-wordpress v%s could not be determined', 'wp-gatsby' ), $version );
				    } else {
					    if ( ! version_compare( $installed_wpgraphql_version, $version_compat['wp-graphql']['min'], '>=' ) ) {
						    $is_compatible = false;
						    $messages[] = sprintf(__( 'The installed version of WPGraphQL (v%1$s) is lower than the required minimum version (v%2$s)', 'wp-gatsby' ), $installed_wpgraphql_version, $version_compat['wp-graphql']['min'] );
					    }
				    }

				    // If active WPGraphQL is higher than compatible max
				    if ( ! isset( $version_compat['wp-gatsby']['max'] ) ) {
					    $is_compatible = false;
					    $messages[] = sprintf(__( 'The max required version of WPGraphQL compatible with gatsby-source-wordpress v%s could not be determined', 'wp-gatsby' ), $version );
				    } else {
					    if ( ! version_compare( $installed_wpgraphql_version, $version_compat['wp-graphql']['max'], '<=' ) ) {
						    $is_compatible = false;
						    $messages[] = sprintf(__( 'The installed version of WPGraphQL (v%1$s) is higher than the max version (v%2$s) compatible with gatsby-source-wordpress %3$s', 'wp-gatsby' ), $installed_wpgraphql_version, $version_compat['wp-graphql']['max'], $version );
					    }
				    }

				    // If active WPGatsby is lower than compatible min
				    if ( ! isset( $version_compat['wp-gatsby']['min'] ) ) {
					    $is_compatible = false;
					    $messages[] = sprintf(__( 'The minimum required version of WPGatsby compatible with gatsby-source-wordpress v%s could not be determined', 'wp-gatsby' ), $version );
				    } else {
					    if ( ! version_compare( $installed__wpgatsby_version, $version_compat['wp-gatsby']['min'], '>=' ) ) {
						    $is_compatible = false;
						    $messages[] = sprintf(__( 'The installed version of WPGatsby (v%1$s) is lower than the required minimum version (v%2$s)', 'wp-gatsby' ), $installed__wpgatsby_version, $version_compat['wp-graphql']['min'] );
					    }
				    }

				    // If active WPGatsby is higher than compatible max
				    if ( ! isset( $version_compat['wp-gatsby']['max'] ) ) {
					    $is_compatible = false;
					    $messages[] = sprintf(__( 'The max required version of WPGatsby compatible with gatsby-source-wordpress v%s could not be determined', 'wp-gatsby' ), $version );
				    } else {
					    if ( ! version_compare( $installed__wpgatsby_version, $version_compat['wp-gatsby']['max'], '<=' ) ) {
						    $is_compatible = false;
						    $messages[] = sprintf(__( 'The installed version of WPGatsby (v%1$s) is higher than the max version (v%2$s) compatible with gatsby-source-wordpress %3$s', 'wp-gatsby' ), $installed__wpgatsby_version, $version_compat['wp-graphql']['max'], $version );
					    }
				    }

			    }

			    /**
			     * Return the payload
			     */
			    return [
			    	'isCompatible' => $is_compatible,
				    'messages' => false === $is_compatible ? $messages : null,
			    ];

		    }
	    ] );

        register_graphql_field(
            'RootQuery', 'isWpGatsby', [
            'type' => 'Boolean',
            'description' => __('Confirms this is a WP Gatsby site', 'wp-gatsby'),
            'resolve' => function () {
                return true;
            },
            ]
        );

        register_graphql_field(
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
