import React from "react"
import MdArrowForward from "react-icons/lib/md/arrow-forward"

import { Box, Flex, Heading, Link, Text } from "../system"
import ImagePlaceholder from "../image-placeholder"
import Avatar from "../avatar"

const BlogCard = ({ ...props }) => (
  <Box
    {...props}
    minWidth="16rem"
    maxWidth="30rem"
    borderRadius={1}
    boxShadow="raised"
  >
    <ImagePlaceholder aspectRatio={1 / 2} mb={2} />
    <Box p={{ xxs: 4, md: 5 }}>
      <Heading fontSize={{ xxs: 4, md: 6, lg: 7 }} fontWeight={1}>
        Using decoupled Drupal with Gatsby with Kyle Mathews
      </Heading>

      <Flex alignItems="center" my={3}>
        <Avatar mr={2} />
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

      <Flex mt={4} alignItems="center">
        <Link href="#" css={{ textDecoration: `none` }}>
          Read more <MdArrowForward style={{ verticalAlign: `middle` }} />
        </Link>
      </Flex>
    </Box>
  </Box>
)

export default BlogCard
