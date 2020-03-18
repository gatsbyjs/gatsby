const axios = require(`axios`)

const fetch = (username, limit = 100) => {
  const url = `https://medium.com/${username}/?format=json&limit=${limit}`
  return axios.get(url)
}

const prefix = `])}while(1);</x>`

const convertTimestamps = (nextObj, prevObj, prevKey) => {
  if (typeof nextObj === `object`) {
    Object.keys(nextObj).map(key =>
      convertTimestamps(nextObj[key], nextObj, key)
    )
  } else {
    if (typeof nextObj === `number` && nextObj >> 0 !== nextObj) {
      const date = new Date(nextObj)
      if (date.getTime() === nextObj) {
        prevObj[prevKey] = date.toISOString().slice(0, 10)
      }
    }
  }
}

const strip = payload => payload.replace(prefix, ``)

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  { username, limit }
) => {
  const { createNode } = actions

  try {
    const { data } = await fetch(username, limit)
    const { payload } = JSON.parse(strip(data))

    let importableResources = []
    let posts = {} // because `posts` needs to be in a scope accessible by `links` below

    const users = Object.keys(payload.references.User).map(
      key => payload.references.User[key]
    )
    importableResources = importableResources.concat(users)

    if (payload.posts) {
      posts = payload.posts
      importableResources = importableResources.concat(posts)
    }

    if (payload.references.Post) {
      posts = Object.keys(payload.references.Post).map(
        key => payload.references.Post[key]
      )
      importableResources = importableResources.concat(posts)
    }

    if (payload.references.Collection) {
      const collections = Object.keys(payload.references.Collection).map(
        key => payload.references.Collection[key]
      )
      importableResources = importableResources.concat(collections)
    }

    const resources = [ ...importableResources ]
      .map(resource => ({
        ...resource,
        medium_id: resource.id,
        id: createNodeId(resource.id ? resource.id : resource.userId),
      }))

    const getID = node => (node ? node.id : null)

    resources.map(resource => {
      convertTimestamps(resource)

      const contentDigest = createContentDigest(resource)

      let links = {}

      if (resource.type === `Post`) {
        links = {
          author___NODE: getID(
            resources.find(r => r.userId === resource.creatorId)
          ),
        }
      }
      else if (resource.type === `User`) {
        links = {
          posts___NODE: resources
            .filter(
              r => (r.type === `Post`) && (r.creatorId === resource.userId)
            )
            .map(r => r.id),
        }
      }

      const node = {
        ...resource,
        ...links,
        parent: null,
        children: [],
        internal: {
          type: `Medium${resource.type}`,
          contentDigest,
        },
      }

      createNode(node)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

exports.createSchemaCustomization = async ({ actions }) => {
  const typeDefs = `
    type MediumCollection implements Node @derivedTypes @dontInfer {
      name: String
      slug: String
      tags: [String]
      creatorId: String
      description: String
      shortDescription: String
      image: MediumCollectionImage
      metadata: MediumCollectionMetadata
      virtuals: MediumCollectionVirtuals
      logo: MediumCollectionLogo
      twitterUsername: String
      publicEmail: String
      collectionMastheadId: String
      sections: [MediumCollectionSections]
      tintColor: String
      lightText: Boolean
      favicon: MediumCollectionFavicon
      colorPalette: MediumCollectionColorPalette
      colorBehavior: Int
      instantArticlesState: Int
      acceleratedMobilePagesState: Int
      ampLogo: MediumCollectionAmpLogo
      header: MediumCollectionHeader
      subscriberCount: Int
      tagline: String
      type: String
      medium_id: String
    }

    type MediumCollectionImage {
      imageId: String
      filter: String
      backgroundSize: String
      originalWidth: Int
      originalHeight: Int
      strategy: String
      height: Int
      width: Int
    }

    type MediumCollectionMetadata {
      followerCount: Int
      activeAt: Date @dateformat
    }

    type MediumCollectionVirtuals @derivedTypes {
      permissions: MediumCollectionVirtualsPermissions
      isSubscribed: Boolean
      isEnrolledInHightower: Boolean
      isEligibleForHightower: Boolean
      isSubscribedToCollectionEmails: Boolean
      isMuted: Boolean
    }

    type MediumCollectionVirtualsPermissions {
      canPublish: Boolean
      canPublishAll: Boolean
      canRepublish: Boolean
      canRemove: Boolean
      canManageAll: Boolean
      canSubmit: Boolean
      canEditPosts: Boolean
      canAddWriters: Boolean
      canViewStats: Boolean
      canSendNewsletter: Boolean
      canViewLockedPosts: Boolean
      canViewCloaked: Boolean
      canEditOwnPosts: Boolean
      canBeAssignedAuthor: Boolean
      canEnrollInHightower: Boolean
      canLockPostsForMediumMembers: Boolean
      canLockOwnPostsForMediumMembers: Boolean
      canViewNewsletterV2Stats: Boolean
      canCreateNewsletterV3: Boolean
    }

    type MediumCollectionLogo {
      imageId: String
      filter: String
      backgroundSize: String
      originalWidth: Int
      originalHeight: Int
      strategy: String
      height: Int
      width: Int
    }

    type MediumCollectionSections @derivedTypes {
      type: Int
      collectionHeaderMetadata: MediumCollectionSectionsCollectionHeaderMetadata
      postListMetadata: MediumCollectionSectionsPostListMetadata
    }

    type MediumCollectionSectionsCollectionHeaderMetadata @derivedTypes {
      title: String
      description: String
      logoImage: MediumCollectionSectionsCollectionHeaderMetadataLogoImage
      alignment: Int
      layout: Int
    }

    type MediumCollectionSectionsCollectionHeaderMetadataLogoImage {
      id: String
      originalWidth: Int
      originalHeight: Int
      alt: String
    }

    type MediumCollectionSectionsPostListMetadata {
      source: Int
      layout: Int
      number: Int
      sectionHeader: String
    }

    type MediumCollectionFavicon {
      imageId: String
      filter: String
      backgroundSize: String
      originalWidth: Int
      originalHeight: Int
      strategy: String
      height: Int
      width: Int
    }

    type MediumCollectionColorPalette @derivedTypes {
      defaultBackgroundSpectrum: MediumCollectionColorPaletteDefaultBackgroundSpectrum
      tintBackgroundSpectrum: MediumCollectionColorPaletteTintBackgroundSpectrum
      highlightSpectrum: MediumCollectionColorPaletteHighlightSpectrum
    }

    type MediumCollectionColorPaletteDefaultBackgroundSpectrum @derivedTypes {
      colorPoints: [MediumCollectionColorPaletteDefaultBackgroundSpectrumColorPoints]
      backgroundColor: String
    }

    type MediumCollectionColorPaletteDefaultBackgroundSpectrumColorPoints {
      color: String
      point: Float
    }

    type MediumCollectionColorPaletteTintBackgroundSpectrum @derivedTypes {
      colorPoints: [MediumCollectionColorPaletteTintBackgroundSpectrumColorPoints]
      backgroundColor: String
    }

    type MediumCollectionColorPaletteTintBackgroundSpectrumColorPoints {
      color: String
      point: Float
    }

    type MediumCollectionColorPaletteHighlightSpectrum @derivedTypes {
      colorPoints: [MediumCollectionColorPaletteHighlightSpectrumColorPoints]
      backgroundColor: String
    }

    type MediumCollectionColorPaletteHighlightSpectrumColorPoints {
      color: String
      point: Float
    }

    type MediumCollectionAmpLogo {
      imageId: String
      filter: String
      backgroundSize: String
      originalWidth: Int
      originalHeight: Int
      strategy: String
      height: Int
      width: Int
    }

    type MediumCollectionHeader @derivedTypes {
      title: String
      description: String
      logoImage: MediumCollectionHeaderLogoImage
      alignment: Int
      layout: Int
    }

    type MediumCollectionHeaderLogoImage {
      id: String
      originalWidth: Int
      originalHeight: Int
      alt: String
    }

    type MediumUser implements Node @dontInfer {
      userId: String
      name: String
      username: String
      mediumMemberAt: Date @dateformat
      createdAt: Date @dateformat
      imageId: String
      backgroundImageId: String
      bio: String
      twitterScreenName: String
      allowNotes: Int
      isWriterProgramEnrolled: Boolean
      isQuarantined: Boolean
      isSuspended: Boolean
      isMembershipTrialEligible: Boolean
      type: String
      posts: [MediumPost] @link(by: "id", from: "posts___NODE")
      firstOpenedIosApp: Date @dateformat
    }

    type MediumPost implements Node @derivedTypes @dontInfer {
      versionId: String
      creatorId: String
      homeCollectionId: String
      title: String
      detectedLanguage: String
      latestVersion: String
      latestPublishedVersion: String
      hasUnpublishedEdits: Boolean
      latestRev: Int
      createdAt: Date @dateformat
      updatedAt: Date @dateformat
      curationEligibleAt: Date @dateformat
      acceptedAt: Date @dateformat
      firstPublishedAt: Date @dateformat
      latestPublishedAt: Date @dateformat
      vote: Boolean
      experimentalCss: String
      displayAuthor: String
      content: MediumPostContent
      virtuals: MediumPostVirtuals
      coverless: Boolean
      slug: String
      translationSourcePostId: String
      translationSourceCreatorId: String
      isApprovedTranslation: Boolean
      inResponseToPostId: String
      inResponseToRemovedAt: Date @dateformat
      isTitleSynthesized: Boolean
      allowResponses: Boolean
      importedUrl: String
      importedPublishedAt: Date @dateformat
      visibility: Int
      uniqueSlug: String
      previewContent: MediumPostPreviewContent
      license: Int
      inResponseToMediaResourceId: String
      canonicalUrl: String
      approvedHomeCollectionId: String
      newsletterId: String
      webCanonicalUrl: String
      mediumUrl: String
      migrationId: String
      notifyFollowers: Boolean
      notifyTwitter: Boolean
      notifyFacebook: Boolean
      responseHiddenOnParentPostAt: Date @dateformat
      isSeries: Boolean
      isSubscriptionLocked: Boolean
      seriesLastAppendedAt: Date @dateformat
      audioVersionDurationSec: Int
      sequenceId: String
      isEligibleForRevenue: Boolean
      isBlockedFromHightower: Boolean
      deletedAt: Date @dateformat
      lockedPostSource: Int
      hightowerMinimumGuaranteeStartsAt: Date @dateformat
      hightowerMinimumGuaranteeEndsAt: Date @dateformat
      featureLockRequestAcceptedAt: Date @dateformat
      mongerRequestType: Int
      layerCake: Int
      socialTitle: String
      socialDek: String
      editorialPreviewTitle: String
      editorialPreviewDek: String
      isProxyPost: Boolean
      proxyPostFaviconUrl: String
      proxyPostProviderName: String
      proxyPostType: Int
      isSuspended: Boolean
      isLimitedState: Boolean
      seoTitle: String
      previewContent2: MediumPostPreviewContent2
      cardType: Int
      isDistributionAlertDismissed: Boolean
      isShortform: Boolean
      shortformType: Int
      type: String
      medium_id: String
      author: MediumUser @link(by: "id", from: "author___NODE")
      primaryTopicId: String
    }

    type MediumPostContent @derivedTypes {
      subtitle: String
      postDisplay: MediumPostContentPostDisplay
      metaDescription: String
    }

    type MediumPostContentPostDisplay {
      coverless: Boolean
    }

    type MediumPostVirtuals @derivedTypes {
      statusForCollection: String
      allowNotes: Boolean
      previewImage: MediumPostVirtualsPreviewImage
      wordCount: Int
      imageCount: Int
      readingTime: Float
      subtitle: String
      publishedInCount: Int
      noIndex: Boolean
      recommends: Int
      isBookmarked: Boolean
      tags: [MediumPostVirtualsTags]
      socialRecommendsCount: Int
      responsesCreatedCount: Int
      links: MediumPostVirtualsLinks
      isLockedPreviewOnly: Boolean
      metaDescription: String
      totalClapCount: Int
      sectionCount: Int
      readingList: Int
      topics: [MediumPostVirtualsTopics]
    }

    type MediumPostVirtualsPreviewImage {
      imageId: String
      filter: String
      backgroundSize: String
      originalWidth: Int
      originalHeight: Int
      strategy: String
      height: Int
      width: Int
    }

    type MediumPostVirtualsTags @derivedTypes {
      slug: String
      name: String
      postCount: Int
      metadata: MediumPostVirtualsTagsMetadata
      type: String
    }

    type MediumPostVirtualsTagsMetadata @derivedTypes {
      postCount: Int
      coverImage: MediumPostVirtualsTagsMetadataCoverImage
    }

    type MediumPostVirtualsTagsMetadataCoverImage {
      id: String
      originalWidth: Int
      originalHeight: Int
      isFeatured: Boolean
      unsplashPhotoId: String
      focusPercentX: Int
      focusPercentY: Int
      alt: String
      backgroundSize: String
      filter: String
      externalSrc: String
      repairedAt: Date @dateformat
    }

    type MediumPostVirtualsLinks @derivedTypes {
      entries: [MediumPostVirtualsLinksEntries]
      version: String
      generatedAt: Date @dateformat
    }

    type MediumPostVirtualsLinksEntries @derivedTypes {
      url: String
      alts: [MediumPostVirtualsLinksEntriesAlts]
      httpStatus: Int
    }

    type MediumPostVirtualsLinksEntriesAlts {
      type: Int
      url: String
    }

    type MediumPostVirtualsTopics @derivedTypes {
      topicId: String
      slug: String
      createdAt: Date @dateformat
      deletedAt: Date @dateformat
      image: MediumPostVirtualsTopicsImage
      name: String
      description: String
      visibility: Int
      type: String
    }

    type MediumPostVirtualsTopicsImage {
      id: String
      originalWidth: Int
      originalHeight: Int
    }

    type MediumPostPreviewContent @derivedTypes {
      bodyModel: MediumPostPreviewContentBodyModel
      isFullContent: Boolean
      subtitle: String
    }

    type MediumPostPreviewContentBodyModel @derivedTypes {
      paragraphs: [MediumPostPreviewContentBodyModelParagraphs]
      sections: [MediumPostPreviewContentBodyModelSections]
    }

    type MediumPostPreviewContentBodyModelParagraphs @derivedTypes {
      name: String
      type: Int
      text: String
      layout: Int
      metadata: MediumPostPreviewContentBodyModelParagraphsMetadata
      markups: [MediumPostPreviewContentBodyModelParagraphsMarkups]
      alignment: Int
      hasDropCap: Boolean
    }

    type MediumPostPreviewContentBodyModelParagraphsMetadata {
      id: String
      originalWidth: Int
      originalHeight: Int
      isFeatured: Boolean
      unsplashPhotoId: String
      alt: String
    }

    type MediumPostPreviewContentBodyModelParagraphsMarkups {
      type: Int
      start: Int
      end: Int
      href: String
      title: String
      rel: String
      anchorType: Int
      userId: String
    }

    type MediumPostPreviewContentBodyModelSections {
      startIndex: Int
    }

    type MediumPostPreviewContent2 @derivedTypes {
      bodyModel: MediumPostPreviewContent2BodyModel
      isFullContent: Boolean
      subtitle: String
    }

    type MediumPostPreviewContent2BodyModel @derivedTypes {
      paragraphs: [mediumPostPreviewContent2BodyModelParagraphs]
      sections: [mediumPostPreviewContent2BodyModelSections]
    }

    type mediumPostPreviewContent2BodyModelParagraphs @derivedTypes {
      name: String
      type: Int
      text: String
      markups: [mediumPostPreviewContent2BodyModelParagraphsMarkups]
      layout: Int
      metadata: mediumPostPreviewContent2BodyModelParagraphsMetadata
      iframe: mediumPostPreviewContent2BodyModelParagraphsIframe
      hasDropCap: Boolean
    }

    type mediumPostPreviewContent2BodyModelParagraphsMarkups {
      type: Int
      start: Int
      end: Int
      href: String
      title: String
      rel: String
      anchorType: Int
      userId: String
      name: String
    }

    type mediumPostPreviewContent2BodyModelParagraphsMetadata {
      id: String
      originalWidth: Int
      originalHeight: Int
      isFeatured: Boolean
      unsplashPhotoId: String
      alt: String
    }

    type mediumPostPreviewContent2BodyModelParagraphsIframe {
      mediaResourceId: String
      thumbnailUrl: String
    }

    type mediumPostPreviewContent2BodyModelSections {
      startIndex: Int
    }
  `

  actions.createTypes(typeDefs)
}
