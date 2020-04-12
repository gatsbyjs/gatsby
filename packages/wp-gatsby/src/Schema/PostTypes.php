<?php

namespace WPGatsby\Schema;

/**
 * Adds a PostTypes root field to the WPGraphQL schema
 */
class PostTypes {
	/**
	 * A list of post types that shouldn't show up in this field
	 */
	private $_blacklisted_post_types = [
		'attachment',
		'revision',
		'nav_menu_item',
		'custom_css',
		'customize_changeset',
		'oembed_cache',
		'user_request',
		'wp_block',
		'action_monitor',
	];

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

	/**
	 * Registers fields for the postTypes root field
	 */
	function register() {

		register_graphql_field(
			'RootQuery', 'postTypes', [
				'type'        => [ 'list_of' => 'PostTypeInfo' ],
				'description' => __( 'Returns a list of available post types', 'wp-gatsby' ),
				'resolve'     => function() {
					$graphql = \graphql(
						[
							'query' => ' {
		                        __schema {
		                          queryType {
		                            fields {
		                              name
		                              type {
		                                name
		                              }
		                            }
		                          }
		                        }
		                      } '
						]
					);

					$root_fields = $graphql['data']['__schema']['queryType']['fields'];

					// Get all available GQL post types, excluding blacklisted types like revisions.
					$possible_types     = [];
					$allowed_post_types = \WPGraphQL::get_allowed_post_types();

					if ( ! empty( $allowed_post_types ) && is_array( $allowed_post_types ) ) {
						foreach ( $allowed_post_types as $allowed_post_type ) {

							$is_blacklisted = in_array( $allowed_post_type, $this->_blacklisted_post_types );
							$is_processed   = ! empty( $possible_types[ $allowed_post_type ] );

							if ( ! $is_blacklisted && ! $is_processed ) {
								$post_type_object    = get_post_type_object( $allowed_post_type );
								$graphql_single_name = lcfirst( $post_type_object->graphql_single_name ) ?? null;
								$graphql_plural_name = lcfirst( $post_type_object->graphql_plural_name ) ?? null;

								$root_field_index = array_search(
									$graphql_single_name,
									array_column(
										$root_fields,
										'name'
									)
								);

								$root_field        = $root_fields[ $root_field_index ] ?? null;
								$graphql_type_name = $root_field['type']['name'] ?? null;

								if ( $graphql_single_name && $graphql_plural_name && $graphql_type_name ) {
									$possible_types[ $allowed_post_type ]['fieldNames']['singular'] = $graphql_single_name;
									$possible_types[ $allowed_post_type ]['fieldNames']['plural']   = $graphql_plural_name;
									$possible_types[ $allowed_post_type ]['typeName']               = $graphql_type_name;
								}
							}

						}
					}

					return $possible_types;
				},
			]
		);

		register_graphql_object_type(
			'PostTypeInfoGraphQLFieldNames',
			[
				'description' => 'The GraphQL field names for a registered post type',
				'fields'      => [
					'singular' => [
						'type' => 'String',
						'description'
						       => 'The singular GraphQL field name of the post type'
					],
					'plural'   => [
						'type' => 'String',
						'description'
						       => 'The plural GraphQL field name of the post type'
					],
				]
			]
		);

		register_graphql_object_type(
			'PostTypeInfo',
			[
				'description' => 'Info about a registered post type',
				'fields'      => [
					'fieldNames' => [
						'type'        => 'PostTypeInfoGraphQLFieldNames',
						'description' => 'GraphQL field names for the post type'
					],
					'typeName'   => [
						'type'        => 'String',
						'description' => 'The type name for this post type'
					],
				]
			]
		);
	}
}
