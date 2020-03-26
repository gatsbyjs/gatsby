<?php

  wp_head();

  global $wp;
  $page_path = add_query_arg( array(), $wp->request );

  $preview_url = \WP_Gatsby\Admin\Preview::get_gatsby_preview_instance_url();
  $frontend_url = "$preview_url$page_path";
?>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Preview</title>
    <style>
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
</head>

<body>
    <?php if ($frontend_url): ?>
      <iframe
        id='preview'
        src="<?= $frontend_url; ?>"
        frameborder="0"
      ></iframe>
    <?php endif; ?>
</body>

</html>
<?php wp_footer(); ?>
