<?php
// Plugin Name: WPGatsby Test Plugin (for tests only)

add_action( 'graphql_register_types', 'add_test_mutations' );

function add_test_mutations() {
  register_graphql_mutation( "attachFeaturedImageToNodeById", [
    'description' => 'Attaches a MediaItem database ID to a post featured image by database ID.',
    'inputFields' => [
      'mediaItemId' => [
        'type' => 'Int'
      ],
      'postId' => [
        'type' => 'Int'
      ]
    ],
    'outputFields' => [
      'success' => [
        'type' => 'Boolean'
      ]
    ],
    'mutateAndGetPayload' => function( $input ) {

      if ( empty( $input['mediaItemId'] ) || empty( $input['postId'] ) ) {
        return [
          'success' => false
        ];
      }

      $selectedPost = get_post( $input['postId'] );
      $selectedMediaItem = get_post( $input['mediaItemId'] );


      if ( ! $selectedPost || ! $selectedMediaItem ) {
        return [
          'success' => false,
        ];
      }

      set_post_thumbnail( $selectedPost->ID, $selectedMediaItem->ID );

      wp_update_post( [
        'ID' => $selectedPost->ID,
      ] );

      return [
        'success' => true,
      ];
    }
  ] );

  register_graphql_mutation( "removeFeaturedImageFromNodeById", [
    'description' => 'Removes a post featured image by post database ID.',
    'inputFields' => [
      'postId' => [
        'type' => 'Int'
      ]
    ],
    'outputFields' => [
      'success' => [
        'type' => 'Boolean'
      ]
    ],
    'mutateAndGetPayload' => function( $input ) {

      if ( empty( $input['postId'] ) ) {
        return [
          'success' => false
        ];
      }

      $selectedPost = get_post( $input['postId'] );


      if ( ! $selectedPost ) {
        return [
          'success' => false,
        ];
      }

      delete_post_meta( $selectedPost->ID, '_thumbnail_id' );

      wp_update_post( [
        'ID' => $selectedPost->ID,
      ] );

      return [
        'success' => true,
      ];
    }
  ] );

}

?>
