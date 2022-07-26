export function mediaTypeBuilder(prefix: string): string {
  return `
      type ${prefix}ExternalVideo implements Node & ${prefix}Media @dontInfer {
        alt: String
        embeddedUrl: String!
        host: ${prefix}MediaHost!
        id: ID!
        mediaContentType: ${prefix}MediaContentType!
        mediaErrors: [${prefix}MediaError!]!
        preview: ${prefix}MediaPreviewImage
        shopifyId: String!
        status: ${prefix}MediaStatus!
      }

      interface ${prefix}Media implements Node @dontInfer {
        alt: String
        id: ID!
        mediaContentType: ${prefix}MediaContentType!
        mediaErrors: [${prefix}MediaError!]!
        preview: ${prefix}MediaPreviewImage
        shopifyId: String!
        status: ${prefix}MediaStatus!
      }

      enum ${prefix}MediaContentType {
        VIDEO
        EXTERNAL_VIDEO
        MODEL_3D
        IMAGE
      }

      type ${prefix}MediaError {
        code: ${prefix}MediaErrorCode!
        details: String
        message: String!
      }

      enum ${prefix}MediaErrorCode {
        UNKNOWN
        INVALID_SIGNED_URL
        IMAGE_DOWNLOAD_FAILURE
        IMAGE_PROCESSING_FAILURE
        MEDIA_TIMEOUT_ERROR
        EXTERNAL_VIDEO_NOT_FOUND
        EXTERNAL_VIDEO_UNLISTED
        EXTERNAL_VIDEO_INVALID_ASPECT_RATIO
        EXTERNAL_VIDEO_EMBED_DISABLED
        EXTERNAL_VIDEO_EMBED_NOT_FOUND_OR_TRANSCODING
        GENERIC_FILE_DOWNLOAD_FAILURE
        GENERIC_FILE_INVALID_SIZE
        VIDEO_METADATA_READ_ERROR
        VIDEO_INVALID_FILETYPE_ERROR
        VIDEO_MIN_WIDTH_ERROR
        VIDEO_MAX_WIDTH_ERROR
        VIDEO_MIN_HEIGHT_ERROR
        VIDEO_MAX_HEIGHT_ERROR
        VIDEO_MIN_DURATION_ERROR
        VIDEO_MAX_DURATION_ERROR
        VIDEO_VALIDATION_ERROR
        MODEL3D_VALIDATION_ERROR
        MODEL3D_THUMBNAIL_GENERATION_ERROR
        MODEL3D_GLB_TO_USDZ_CONVERSION_ERROR
        MODEL3D_GLB_OUTPUT_CREATION_ERROR
        UNSUPPORTED_IMAGE_FILE_TYPE
        INVALID_IMAGE_FILE_SIZE
        INVALID_IMAGE_ASPECT_RATIO
        INVALID_IMAGE_RESOLUTION
        FILE_STORAGE_LIMIT_EXCEEDED
      }

      enum ${prefix}MediaHost {
        YOUTUBE
        VIMEO
      }

      type ${prefix}MediaImage implements Node & ${prefix}Media @dontInfer {
        alt: String
        createdAt: Date! @dateformat
        fileErrors: [${prefix}FileError!]!
        fileStatus: ${prefix}FileStatus!
        id: ID!
        image: ${prefix}Image
        mediaContentType: ${prefix}MediaContentType!
        mediaErrors: [${prefix}MediaError!]!
        mimeType: String
        preview: ${prefix}MediaPreviewImage
        shopifyId: String!
        status: ${prefix}MediaStatus!
      }

      type ${prefix}MediaPreviewImage {
        image: ${prefix}Image
        status: ${prefix}MediaPreviewImageStatus!
      }

      enum ${prefix}MediaPreviewImageStatus {
        UPLOADED
        PROCESSING
        READY
        FAILED
      }

      enum ${prefix}MediaStatus {
        UPLOADED
        PROCESSING
        READY
        FAILED
      }

      type ${prefix}Model3d implements Node & ${prefix}Media @dontInfer {
        alt: String
        filename: String!
        id: ID!
        mediaContentType: ${prefix}MediaContentType!
        mediaErrors: [${prefix}MediaError!]!
        originalSource: ${prefix}Model3dSource
        preview: ${prefix}MediaPreviewImage
        sources: [${prefix}Model3dSource!]!
        shopifyId: String!
        status: ${prefix}MediaStatus!
      }

      type ${prefix}Model3dSource {
        filesize: Int!
        format: String!
        mimeType: String!
        url: String!
      }

      type ${prefix}Video implements Node & ${prefix}Media @dontInfer {
        alt: String
        filename: String!
        id: ID!
        mediaContentType: ${prefix}MediaContentType!
        mediaErrors: [${prefix}MediaError!]!
        originalSource: ${prefix}VideoSource
        preview: ${prefix}MediaPreviewImage
        shopifyId: String!
        sources: [${prefix}VideoSource!]!
        status: ${prefix}MediaStatus!
      }

      type ${prefix}VideoSource {
        format: String!
        height: Int!
        mimeType: String!
        url: String!
        width: Int!
      }
    `
}
