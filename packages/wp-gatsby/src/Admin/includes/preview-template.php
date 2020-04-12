<?php

use GraphQLRelay\Relay;

wp_head();

global $post;
$post_id  = $post->ID;
$revision = array_values( wp_get_post_revisions( $post_id ) )[0] ?? null;

$post_type_object = \get_post_type_object( $post->post_type );

$global_relay_id = Relay::toGlobalId(
	$post_type_object->name,
	absint( $post_id )
);

$referenced_node_single_name
	= $post_type_object->graphql_single_name ?? null;

$post_url = get_the_permalink( $post );
$path     = str_ireplace( get_home_url(), '', $post_url );

// if the post parent has a ? in it's url, this is a new draft
// and or the post has no proper permalink that Gatsby can use.
// so we will create one /post_graphql_name/post_db_id
// this same logic is on the Gatsby side to account for this situation.
if ( strpos( $path, '?' ) ) {
	$path = "/$referenced_node_single_name/$post_id";
}

$preview_url  = \WPGatsby\Admin\Preview::get_gatsby_preview_instance_url();
$preview_url  = rtrim( $preview_url, '/' );
$frontend_url = "$preview_url$path";
?>

<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Preview</title>
	<style>
		.content {
			width: 100%;
			left: 0;
			top: 46px;
			height: 100%;
			height: calc(100vh - 46px);

			text-align: center;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;

			max-width: 80%;
			margin: 0 auto;
		}

		.content p {
			max-width: 800px;
			margin: 0 auto;
		}

		iframe {
			position: fixed;

			width: 100%;
			left: 0;

			top: 46px;
			height: 100%;
			height: calc(100vh - 46px);
		}

		@media (min-width: 783px) {
			iframe {
				top: 32px;
				height: calc(100vh - 32px);
			}
		}
	</style>

	<script async>
        function showError() {
            document.addEventListener("DOMContentLoaded", function () {
                try {
                    const iframe = document.querySelector('#preview')
                    iframe.style.display = "none"
                } catch (e) {
                }

                try {
                    const content = document.querySelector('.content')
                    content.style.display = "block"
                } catch (e) {
                }
            })
        }

        fetch("<?php echo $frontend_url; ?>", {mode: 'no-cors'})
            .catch(e => {
                showError()
            });
	</script>
</head>

<body>
<?php if ( $frontend_url ): ?>
	<iframe
			id='preview'
			src="<?= $frontend_url; ?>"
			frameborder="0"
	></iframe>
<?php endif; ?>

<div class="content error" style="display: none;">
	<h1>Preview broken</h1>
	<p>The Preview webhook set on the <a
				href="<?php echo get_bloginfo( 'url' ); ?>/wp-admin/options-general.php?page=gatsbyjs">settings
			page</a> isn't working properly.
		<br>
		Please ensure your URL is correct.
		<br>
		<br>
		If you've set the correct URL and you're still having trouble, please <a
				href="https://www.gatsbyjs.com/preview/" target="_blank"
				rel="noopener, nofollow. noreferrer, noopener, external">refer to the docs</a> for
		troubleshooting steps, or <a href="https://www.gatsbyjs.com/preview/" target="_blank"
									 rel="noopener, nofollow. noreferrer, noopener, external">contact
			support</a> if that doesn't solve your issue.
		<br>
		<br>
		If you don't have a valid Gatsby Preview instance, you can <a
				href="https://www.gatsbyjs.com/preview/" target="_blank"
				rel="noopener, nofollow. noreferrer, noopener, external">set one up now on Gatsby
			Cloud.</a>
	</p>
</div>
</body>

</html>
<?php wp_footer(); ?>
