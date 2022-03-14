export function commonTypeBuilder(prefix: string): string {
  return `
      type ${prefix}App {
        shopifyId: String!
      }

      type ${prefix}AppFeedback {
        app: ${prefix}App!
        link: ${prefix}Link
        messages: [${prefix}UserError!]!
      }

      enum ${prefix}CountryCode {
        AF
        AX
        AL
        DZ
        AD
        AO
        AI
        AG
        AR
        AM
        AW
        AC
        AU
        AT
        AZ
        BS
        BH
        BD
        BB
        BY
        BE
        BZ
        BJ
        BM
        BT
        BO
        BA
        BW
        BV
        BR
        IO
        BN
        BG
        BF
        BI
        KH
        CA
        CV
        BQ
        KY
        CF
        TD
        CL
        CN
        CX
        CC
        CO
        KM
        CG
        CD
        CK
        CR
        HR
        CU
        CW
        CY
        CZ
        CI
        DK
        DJ
        DM
        DO
        EC
        EG
        SV
        GQ
        ER
        EE
        SZ
        ET
        FK
        FO
        FJ
        FI
        FR
        GF
        PF
        TF
        GA
        GM
        GE
        DE
        GH
        GI
        GR
        GL
        GD
        GP
        GT
        GG
        GN
        GW
        GY
        HT
        HM
        VA
        HN
        HK
        HU
        IS
        IN
        ID
        IR
        IQ
        IE
        IM
        IL
        IT
        JM
        JP
        JE
        JO
        KZ
        KE
        KI
        KP
        XK
        KW
        KG
        LA
        LV
        LB
        LS
        LR
        LY
        LI
        LT
        LU
        MO
        MG
        MW
        MY
        MV
        ML
        MT
        MQ
        MR
        MU
        YT
        MX
        MD
        MC
        MN
        ME
        MS
        MA
        MZ
        MM
        NA
        NR
        NP
        NL
        AN
        NC
        NZ
        NI
        NE
        NG
        NU
        NF
        MK
        NO
        OM
        PK
        PS
        PA
        PG
        PY
        PE
        PH
        PN
        PL
        PT
        QA
        CM
        RE
        RO
        RU
        RW
        BL
        SH
        KN
        LC
        MF
        PM
        WS
        SM
        ST
        SA
        SN
        RS
        SC
        SL
        SG
        SX
        SK
        SI
        SB
        SO
        ZA
        GS
        KR
        SS
        ES
        LK
        VC
        SD
        SR
        SJ
        SE
        CH
        SY
        TW
        TJ
        TZ
        TH
        TL
        TG
        TK
        TO
        TT
        TA
        TN
        TR
        TM
        TC
        TV
        UG
        UA
        AE
        GB
        US
        UM
        UY
        UZ
        VU
        VE
        VN
        VG
        WF
        EH
        YE
        ZM
        ZW
        ZZ
      }

      enum ${prefix}CurrencyCode {
        USD
        EUR
        GBP
        CAD
        AFN
        ALL
        DZD
        AOA
        ARS
        AMD
        AWG
        AUD
        BBD
        AZN
        BDT
        BSD
        BHD
        BIF
        BZD
        BMD
        BTN
        BAM
        BRL
        BOB
        BWP
        BND
        BGN
        MMK
        KHR
        CVE
        KYD
        XAF
        CLP
        CNY
        COP
        KMF
        CDF
        CRC
        HRK
        CZK
        DKK
        DOP
        XCD
        EGP
        ETB
        XPF
        FJD
        GMD
        GHS
        GTQ
        GYD
        GEL
        HTG
        HNL
        HKD
        HUF
        ISK
        INR
        IDR
        ILS
        IQD
        JMD
        JPY
        JEP
        JOD
        KZT
        KES
        KWD
        KGS
        LAK
        LVL
        LBP
        LSL
        LRD
        LTL
        MGA
        MKD
        MOP
        MWK
        MVR
        MXN
        MYR
        MUR
        MDL
        MAD
        MNT
        MZN
        NAD
        NPR
        ANG
        NZD
        NIO
        NGN
        NOK
        OMR
        PAB
        PKR
        PGK
        PYG
        PEN
        PHP
        PLN
        QAR
        RON
        RUB
        RWF
        WST
        SAR
        STD
        RSD
        SCR
        SGD
        SDG
        SYP
        ZAR
        KRW
        SSP
        SBD
        LKR
        SRD
        SZL
        SEK
        CHF
        TWD
        THB
        TZS
        TTD
        TND
        TRY
        TMT
        UGX
        UAH
        AED
        UYU
        UZS
        VUV
        VND
        XOF
        YER
        ZMW
        BYN
        BYR @deprecated(reason: "\`BYR\` is deprecated. Use \`BYN\` available from version \`2021-01\` onwards instead.")
        DJF
        ERN
        FKP
        GIP
        GNF
        IRR
        KID
        LYD
        MRU
        SLL
        SHP
        SOS
        TJS
        TOP
        VEF @deprecated(reason: "\`VEF\` is deprecated. Use \`VES\` available from version \`2020-10\` onwards instead.")
        VES
        XXX
      }

      type ${prefix}EditableProperty {
        locked: Boolean!
        reason: String
      }

      type ${prefix}FileError {
        code: ${prefix}FileErrorCode!
        details: String
        message: String!
      }

      enum ${prefix}FileErrorCode {
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

      enum ${prefix}FileStatus {
        UPLOADED
        PROCESSING
        READY
        FAILED
      }

      type ${prefix}Image {
        altText: String
        height: Int
        originalSrc: String!
        src: String!
        transformedSrc: String!
        width: Int
      }

      type ${prefix}Link {
        label: String!
        url: String!
      }

      type ${prefix}MoneyV2 {
        amount: Float!
        currencyCode: ${prefix}CurrencyCode!
      }

      type ${prefix}ResourceFeedback {
        details: [${prefix}AppFeedback!]!
        summary: String!
      }

      type ${prefix}SEO {
        description: String
        title: String
      }

      type ${prefix}UserError {
        field: [String!]
        message: String!
      }

      enum ${prefix}WeightUnit {
        KILOGRAMS
        GRAMS
        POUNDS
        OUNCES
      }
    `
}
