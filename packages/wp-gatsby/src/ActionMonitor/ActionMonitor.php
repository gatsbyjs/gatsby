<?php

namespace WP_Gatsby\ActionMonitor;

use GraphQLRelay\Relay;

/**
 * This class registers and controls a post type which can be used to
 * monitor WP events like post save or delete in order to invalidate
 * Gatsby's cached nodes
*/
class ActionMonitor
{
    /**
     * Set up the Action monitor when the class is initialized
     */
    function __construct()
    {
        add_action(
            'init',
            function () {
                $this->initPostType();
                $this->monitorActions();
                $this->registerGraphQLFields();
            }
        );
    }

    /**
     * Use WP Action hooks to create action monitor posts
     */
    function monitorActions()
    {
        add_action('save_post', [$this, 'savePost'], 10, 2);
    }

    /**
     * On save post
     */
    function savePost($post_id, $post)
    {
        if ($post->post_status === 'auto-draft') {
            return $post_id;
        }

        if ($post->post_type === 'revision') {
            return $post_id;
        }

        if ($post->post_type === 'action_monitor') {
            return $post_id;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return $post_id;
        }

        //
        // add a check here to make sure this is a post type available in WPGQL
        // so that we don't monitor posts made by plugins
        // maybe add a filter to allow plugins to add themselves to this list of
        // whitelisted post types?
        //

        $action_type = null;

        if ($post->post_status === 'trash') {
            $action_type = 'DELETE';
            // when we delete a post, Gatsby deletes it
            // that means when we untrash a post, it's a new
            // node for Gatsby. If WP think of untrashing as an update
            // rather than a create, Gatsby will error.
            // So set __update to false, when next time this post
            // is untrashed, we'll record it as a new post.
            update_post_meta($post_id, '__update', false);
        } else {
            // this post meta helps determine if this is a new post or not
            // since the 3rd argument in the save_post hook "$update" always
            // returns true unless using wp_insert_post(), which we're not
            $update = get_post_meta($post_id, '__update', true);
            if (!$update) {
                update_post_meta($post_id, '__update', true);
            }

            $action_type = $update ? 'UPDATE' : 'CREATE';
        }

        $post_type_object = \get_post_type_object($post->post_type);
        $global_relay_id = Relay::toGlobalId(
            $post_type_object->name,
            absint($post_id)
        );

        $action_monitor_post = \wp_insert_post(
            [
                'post_title'    => "[$action_type] - {$post->post_title}",
                'post_type'     => 'action_monitor',
                'post_status'   => 'publish',
            ]
        );

        if ($action_monitor_post !== 0) {
            \update_post_meta(
                $action_monitor_post,
                'action_type',
                $action_type
            );
            \update_post_meta(
                $action_monitor_post,
                'referenced_post_status',
                $post->post_status
            );
            \update_post_meta(
                $action_monitor_post,
                'referenced_post_id',
                $post_id
            );
            \update_post_meta(
                $action_monitor_post,
                'referenced_post_relay_id',
                $global_relay_id
            );
            \update_post_meta(
                $action_monitor_post,
                'referenced_post_single_name',
                $post_type_object->graphql_single_name
            );
            \update_post_meta(
                $action_monitor_post,
                'referenced_post_plural_name',
                $post_type_object->graphql_plural_name
            );
        }
    }

    function registerPostGraphQLFields() {
      add_action(
            'graphql_register_types',
            function () {
                register_graphql_field(
                    'ActionMonitorAction',
                    'actionType',
                    [
                        'type' => 'String',
                        'description' => __(
                            'The type of action (CREATE, UPDATE, DELETE)',
                            'WP_Gatsby'
                        ),
                        'resolve' => function ($post) {
                            $action_type
                                = get_post_meta($post->ID, 'action_type', true);
                            return $action_type ?? null;
                        }
                    ]
                );
                register_graphql_field(
                    'ActionMonitorAction',
                    'referencedNodeStatus',
                    [
                        'type' => 'String',
                        'description' => __(
                            'The post status of the post that triggered this action',
                            'WP_Gatsby'
                        ),
                        'resolve' => function ($post) {
                            $referenced_post_status = get_post_meta(
                                $post->ID,
                                'referenced_post_status',
                                true
                            );
                            return $referenced_post_status ?? null;
                        }
                    ]
                );
                register_graphql_field(
                    'ActionMonitorAction',
                    'referencedNodeID',
                    [
                        'type' => 'String',
                        'description' => __(
                            'The post ID of the post that triggered this action',
                            'WP_Gatsby'
                        ),
                        'resolve' => function ($post) {
                            $referenced_post_id = get_post_meta(
                                $post->ID,
                                'referenced_post_id',
                                true
                            );
                            return $referenced_post_id ?? null;
                        }
                    ]
                );
                register_graphql_field(
                    'ActionMonitorAction',
                    'referencedNodeGlobalRelayID',
                    [
                        'type' => 'String',
                        'description' => __(
                            'The global relay ID of the post that triggered this action',
                            'WP_Gatsby'
                        ),
                        'resolve' => function ($post) {
                            $referenced_post_relay_id = get_post_meta(
                                $post->ID,
                                'referenced_post_relay_id',
                                true
                            );
                            return $referenced_post_relay_id ?? null;
                        }
                    ]
                );
                register_graphql_field(
                    'ActionMonitorAction',
                    'referencedNodeSingularName',
                    [
                        'type' => 'String',
                        'description' => __(
                            'The WPGraphQL single name of the referenced post',
                            'WP_Gatsby'
                        ),
                        'resolve' => function ($post) {
                            $referenced_post_single_name = get_post_meta(
                                $post->ID,
                                'referenced_post_single_name',
                                true
                            );
                            return $referenced_post_single_name ?? null;
                        }
                    ]
                );
                register_graphql_field(
                    'ActionMonitorAction',
                    'referencedNodePluralName',
                    [
                        'type' => 'String',
                        'description' => __(
                            'The WPGraphQL plural name of the referenced post',
                            'WP_Gatsby'
                        ),
                        'resolve' => function ($post) {
                            $referenced_post_plural_name = get_post_meta(
                                $post->ID,
                                'referenced_post_plural_name',
                                true
                            );
                            return $referenced_post_plural_name ?? null;
                        }
                    ]
                );

                register_graphql_field(
                    'RootQueryToActionMonitorActionConnectionWhereArgs',
                    'sinceTimestamp',
                    [
                        'type' => 'Number',
                        'description' => 'List Actions performed since a timestamp.'
                    ]
                );

                add_filter(
                    'graphql_post_object_connection_query_args',
                    function ($args) {
                        $sinceTimestamp = $args['sinceTimestamp'] ?? null;

                        if ($sinceTimestamp) {
                            $args['date_query'] = [
                                'after' => date('c', $sinceTimestamp / 1000)
                            ];
                        }
                        return $args;
                    }
                );
            }
        );
    }

    /**
     * Add post meta to schema
     */
    function registerGraphQLFields()
    {
        $this->registerPostGraphQLFields();
    }

    /**
     * Register Action monitor post type
     */
    function initPostType()
    {
        /**
         * Post Type: Action Monitor.
         */

        $labels = array(
            "name" => __("Action Monitor", "WP_Gatsby"),
            "singular_name" => __("Action Monitor", "WP_Gatsby"),
        );

        $args = array(
            "label" => __("Action Monitor", "WP_Gatsby"),
            "labels" => $labels,
            "description" => "Used to keep a log of actions in WordPress for cache invalidation in gatsby-source-wpgraphql.",
            "public" => true,
            "publicly_queryable" => true,
            "show_ui" => true,
            "delete_with_user" => false,
            "show_in_rest" => true,
            "rest_base" => "",
            "rest_controller_class" => "WP_REST_Posts_Controller",
            "has_archive" => false,
            "show_in_menu" => true,
            "show_in_nav_menus" => true,
            "exclude_from_search" => false,
            "capability_type" => "post",
            "map_meta_cap" => true,
            "hierarchical" => false,
            "rewrite" => array( "slug" => "action_monitor", "with_front" => true ),
            "query_var" => true,
            "supports" => array( "title" ),
            "show_in_graphql" => true,
            "graphql_single_name" => "ActionMonitorAction",
            "graphql_plural_name" => "ActionMonitorActions",
        );

        register_post_type("action_monitor", $args);
    }
}

?>
