/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdArrowForward } from "react-icons/md"

import { Box, Flex } from "theme-ui"
import { Heading, Link, Text } from "../system"
import ImagePlaceholder from "../image-placeholder"
import Avatar from "../avatar"

const BlogCard = () => (
  <Box
    sx={{
      minWidth: `16rem`,
      maxWidth: `30rem`,
      borderRadius: 1,
      boxShadow: `raised`,
      mx: [0, null, 6],
    }}
  >
    <ImagePlaceholder aspectRatio={1 / 2} mb={2} />
    <Box
      sx={{
        p: [4, null, null, 5],
      }}
    >
      <Heading
        sx={{
          fontSize: [4, 5, 6, null, 7],
        }}
        fontWeight="heading"
      >
        Using decoupled Drupal with Gatsby with Kyle Mathews
      </Heading>

      <Flex
        sx={{
          alignItems: `center`,
          my: 3,
        }}
      >
        <Avatar />
        <Text color="grey.50" fontSize={1}>
          <Link href="#" css={{ textDecoration: `none` }}>
            Shannon Soper
          </Link>
          {` `}
          on August 13th 2018
        </Text>
      </Flex>

      <Text fontSize={2} my={6}>
        <strong>Why use Drupal + Gatsby together?</strong> Kyle Mathews is
        presenting on “Gatsby + Drupal” at Decoupled Drupal Days NYC this
        Saturday; for those who can’t make it to his presentation, we wanted to
        give you a sneak peek of what it will be about.
      </Text>

      <Flex
        sx={{
          alignItems: `center`,
          mt: 4,
        }}
      >
        <Link href="#" css={{ textDecoration: `none` }}>
          Read more <MdArrowForward />
        </Link>
      </Flex>
    </Box>
  </Box>
)

export default BlogCard
