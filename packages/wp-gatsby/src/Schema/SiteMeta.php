<?php

namespace WPGatsby\Schema;

use Composer\Semver\Semver;

/**
 * Adds info about the current site
 */
class SiteMeta {
	/**
	 *
	 */
	function __construct() {
		add_action(
			'graphql_register_types', function() {
			$this->register();
		}
		);
	}

	private static function isVersionARange( $version ) {
		$version_without_periods             = str_replace( '.', '', $version );
		$version_without_numbers_and_periods = preg_replace(
			'/[0-9]+/',
			'',
			$version_without_periods
		);

		return $version_without_numbers_and_periods !== '';
	}

	/**
	 * Registers site meta fields...
	 */
	function register() {

		register_graphql_object_type( 'WPGatsbySatisfies', [
			'description' => __( 'Check compatibility with WPGatsby and WPGraphQL.' ),
			'fields'      => [
				'wpGQL'    => [
					'type'        => 'Boolean',
					'description' => __( 'Whether the provided version range requirement for WPGraphQL is met by this WP instance.', 'wp-gatsby' ),
				],
				'wpGatsby' => [
					'type'        => 'Boolean',
					'description' => __( 'Whether the provided version range requirement for WPGatsby is met by this WP instance.', 'wp-gatsby' ),
				],
			]
		] );

		register_graphql_object_type( 'WPGatsbyCompatibility', [
			'description' => __( 'Check compatibility with a given version of gatsby-source-wordpress and the WordPress source site.' ),
			'fields'      => [
				'satisfies' => [
					'type' => 'WPGatsbySatisfies',
				],
			]
		] );

		register_graphql_field( 'RootQuery', 'wpGatsbyCompatibility', [
			'description' => __( 'Information about the compatibility of the WordPress server with a provided version of gatsby-source-wordpress.', 'wp-gatsby' ),
			'type'        => 'WPGatsbyCompatibility',
			'args'        => [
				'wpGQLVersionRange'    => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'The semver version range of WPGraphQL that the requester wants to check compatibility with', 'wp-gatsby' ),
				],
				'wpGatsbyVersionRange' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'The semver version range of WPGatsby that the requester wants to check compatibility with', 'wp-gatsby' ),
				],
			],
			'resolve'     => function( $root, $args, $context, $info ) {

				$wpgql_version_range    = $args['wpGQLVersionRange'] ?? null;
				$wpgatsby_version_range = $args['wpGatsbyVersionRange'] ?? null;


				if ( ! $wpgql_version_range ) {
					throw new \Exception(
						__(
							'No WPGraphQL version was provided for the compatibility check. Please provide a semver version range for checking compatibility with WPGraphQL.',
							'wp-gatsby'
						)
					);
				}

				if ( ! $wpgatsby_version_range ) {
					throw new \Exception(
						__(
							'No WPGatsby version was provided for the compatibility check. Please provide a semver version range for checking compatibility with WPGatsby.',
							'wp-gatsby'
						)
					);
				}

				if ( ! self::isVersionARange( $wpgql_version_range ) ) {
					throw new \Exception(
						'The provided WPGraphQL version is not a range. '
						. $wpgql_version_range
					);
				}

				if ( ! self::isVersionARange( $wpgatsby_version_range ) ) {
					throw new \Exception(
						'The provided WPGatsby version is not a range. '
						. $wpgatsby_version_range
					);
				}

				/**
				 * Get the versions of WPGraphQL and WPGatsby
				 */
				$installed_wpgraphql_version = defined( 'WPGRAPHQL_VERSION' )
					? WPGRAPHQL_VERSION
					: null;

				$installed_wpgatsby_version = defined( 'WPGATSBY_VERSION' )
					? WPGATSBY_VERSION
					: null;

				$wpgql_is_satisfied = Semver::satisfies(
					$installed_wpgraphql_version,
					$wpgql_version_range
				);

				$wpgatsby_is_satisfied = Semver::satisfies(
					$installed_wpgatsby_version,
					$wpgatsby_version_range
				);

				/**
				 * Return the payload
				 */
				return [
					'satisfies' => [
						'wpGQL'    => $wpgql_is_satisfied,
						'wpGatsby' => $wpgatsby_is_satisfied,
					],
				];

			}
		] );

		register_graphql_field(
			'RootQuery', 'isWpGatsby', [
				'type'        => 'Boolean',
				'description' => __( 'Confirms this is a WP Gatsby site', 'wp-gatsby' ),
				'resolve'     => function() {
					return true;
				},
			]
		);

		register_graphql_field(
			'RootQuery', 'schemaMd5', [
				'type'        => 'String',
				'description' => __( 'Returns an MD5 hash of the schema, useful in determining if the schema has changed.', 'wp-gatsby' ),
				'resolve'     => function() {
					$graphql     = \graphql(
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
					$json_string = \wp_json_encode( $graphql );
					$md5         = md5( $json_string );

					return $md5;
				},
			]
		);
	}
}
