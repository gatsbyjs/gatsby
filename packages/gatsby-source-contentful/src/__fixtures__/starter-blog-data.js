exports.initialSync = {
  currentSyncData: {
    entries: [
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c15jwOBqpxqSAOy2eOO4S0m`,
          type: `Entry`,
          createdAt: `2020-04-09T10:53:01.487Z`,
          updatedAt: `2020-04-09T10:55:54.432Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 2,
          contentType: {
            sys: {
              type: `Link`,
              linkType: `ContentType`,
              id: `person`,
              contentful_id: `person`,
            },
          },
          contentful_id: `15jwOBqpxqSAOy2eOO4S0m`,
        },
        fields: {
          name: {
            "en-US": `John Doe`,
          },
          title: {
            "en-US": `Web Developer`,
            nl: `Web developer`,
          },
          company: {
            "en-US": `ACME`,
          },
          shortBio: {
            "en-US": `Research and recommendations for modern stack websites.`,
            nl: `Onderzoek en aanbevelingen voor moderne stapelwebsites.`,
          },
          email: {
            "en-US": `john@doe.com`,
          },
          phone: {
            "en-US": `0176 / 1234567`,
          },
          facebook: {
            "en-US": `johndoe`,
          },
          twitter: {
            "en-US": `johndoe`,
          },
          github: {
            "en-US": `johndoe`,
          },
          image: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c7orLdboQQowIUs22KAW4U`,
                type: `Asset`,
                createdAt: `2020-04-09T10:53:02.132Z`,
                updatedAt: `2020-04-09T10:53:02.132Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 1,
                contentful_id: `7orLdboQQowIUs22KAW4U`,
              },
              fields: {
                title: {
                  "en-US": `Sparkler`,
                },
                description: {
                  "en-US": `John with Sparkler`,
                },
                file: {
                  "en-US": {
                    url: `//images.ctfassets.net/uzfinxahlog0/7orLdboQQowIUs22KAW4U/d6906da78e61909fc5ad673d00da68e1/matt-palmer-254999.jpg`,
                    details: {
                      size: 2293094,
                      image: {
                        width: 3000,
                        height: 2000,
                      },
                    },
                    fileName: `matt-palmer-254999.jpg`,
                    contentType: `image/jpeg`,
                  },
                },
              },
            },
          },
        },
      },
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c31TNnjHlfaGUoMOwU0M2og`,
          type: `Entry`,
          createdAt: `2020-04-09T10:53:01.488Z`,
          updatedAt: `2020-04-09T10:53:01.488Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentType: {
            sys: {
              type: `Link`,
              linkType: `ContentType`,
              id: `blogPost`,
              contentful_id: `blogPost`,
            },
          },
          contentful_id: `31TNnjHlfaGUoMOwU0M2og`,
        },
        fields: {
          title: {
            "en-US": `Automate with webhooks`,
          },
          slug: {
            "en-US": `automate-with-webhooks`,
          },
          heroImage: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c4shwYI3POEGkw0Eg6kcyaQ`,
                type: `Asset`,
                createdAt: `2020-04-09T10:53:03.759Z`,
                updatedAt: `2020-04-09T10:53:03.759Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 1,
                contentful_id: `4shwYI3POEGkw0Eg6kcyaQ`,
              },
              fields: {
                title: {
                  "en-US": `Man in the fields`,
                },
                description: {
                  "en-US": `Tattooed man walking in a field`,
                },
                file: {
                  "en-US": {
                    url: `//images.ctfassets.net/uzfinxahlog0/4shwYI3POEGkw0Eg6kcyaQ/c4cb544901e8c454265d7350c9fa565d/felix-russell-saw-112140.jpg`,
                    details: {
                      size: 4539181,
                      image: {
                        width: 2500,
                        height: 1667,
                      },
                    },
                    fileName: `felix-russell-saw-112140.jpg`,
                    contentType: `image/jpeg`,
                  },
                },
              },
            },
          },
          description: {
            "en-US": `Webhooks notify you, another person or system when resources have changed by calling a given HTTP endpoint.`,
          },
          body: {
            "en-US": `## What are webhooks?\n\nThe webhooks are used to notify you when content has been changed. Specify a URL, configure your webhook, and we will send an HTTP POST request whenever something happens to your content.\n\n## How do I configure a webhook?\n\nGo to Settings ÔåÆ Webhooks from the navigation bar at the top. From there, hit Add webhook, and you will be directed to your new webhook. Then choose a name, put in the information of your HTTP endpoint (URL and authentication), specify any custom headers and select the types of events that should trigger the webhook.\n\n## Why do I get an old version in the CDA?\n\nAs the delivery API is powered by a CDN network consisting of hundreds of servers distributed across continents, it takes some time (up to a few minutes) to reflect the changes to the published content. This must be taken into consideration when reacting to webhooks. In normal conditions, there could be a reasonable delay of 2 to 5 minutes.\n\nExtracted from the [Webhooks FAQ](https://www.contentful.com/faq/webhooks/ "Webhooks FAQ").`,
          },
          author: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c15jwOBqpxqSAOy2eOO4S0m`,
                type: `Entry`,
                createdAt: `2020-04-09T10:53:01.487Z`,
                updatedAt: `2020-04-09T10:55:54.432Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 2,
                contentType: {
                  sys: {
                    type: `Link`,
                    linkType: `ContentType`,
                    id: `person`,
                    contentful_id: `person`,
                  },
                },
                contentful_id: `15jwOBqpxqSAOy2eOO4S0m`,
              },
              fields: {
                name: {
                  "en-US": `John Doe`,
                },
                title: {
                  "en-US": `Web Developer`,
                  nl: `Web developer`,
                },
                company: {
                  "en-US": `ACME`,
                },
                shortBio: {
                  "en-US": `Research and recommendations for modern stack websites.`,
                  nl: `Onderzoek en aanbevelingen voor moderne stapelwebsites.`,
                },
                email: {
                  "en-US": `john@doe.com`,
                },
                phone: {
                  "en-US": `0176 / 1234567`,
                },
                facebook: {
                  "en-US": `johndoe`,
                },
                twitter: {
                  "en-US": `johndoe`,
                },
                github: {
                  "en-US": `johndoe`,
                },
                image: {
                  "en-US": {
                    sys: {
                      space: {
                        sys: {
                          type: `Link`,
                          linkType: `Space`,
                          id: `uzfinxahlog0`,
                          contentful_id: `uzfinxahlog0`,
                        },
                      },
                      id: `c7orLdboQQowIUs22KAW4U`,
                      type: `Asset`,
                      createdAt: `2020-04-09T10:53:02.132Z`,
                      updatedAt: `2020-04-09T10:53:02.132Z`,
                      environment: {
                        sys: {
                          id: `master`,
                          type: `Link`,
                          linkType: `Environment`,
                          contentful_id: `master`,
                        },
                      },
                      revision: 1,
                      contentful_id: `7orLdboQQowIUs22KAW4U`,
                    },
                    fields: {
                      title: {
                        "en-US": `Sparkler`,
                      },
                      description: {
                        "en-US": `John with Sparkler`,
                      },
                      file: {
                        "en-US": {
                          url: `//images.ctfassets.net/uzfinxahlog0/7orLdboQQowIUs22KAW4U/d6906da78e61909fc5ad673d00da68e1/matt-palmer-254999.jpg`,
                          details: {
                            size: 2293094,
                            image: {
                              width: 3000,
                              height: 2000,
                            },
                          },
                          fileName: `matt-palmer-254999.jpg`,
                          contentType: `image/jpeg`,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          publishDate: {
            "en-US": `2017-05-12T00:00+02:00`,
          },
          tags: {
            "en-US": [`javascript`],
          },
        },
      },
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c3K9b0esdy0q0yGqgW2g6Ke`,
          type: `Entry`,
          createdAt: `2020-04-09T10:53:01.485Z`,
          updatedAt: `2020-04-09T10:53:01.485Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentType: {
            sys: {
              type: `Link`,
              linkType: `ContentType`,
              id: `blogPost`,
              contentful_id: `blogPost`,
            },
          },
          contentful_id: `3K9b0esdy0q0yGqgW2g6Ke`,
        },
        fields: {
          title: {
            "en-US": `Hello world`,
          },
          slug: {
            "en-US": `hello-world`,
          },
          heroImage: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c6Od9v3wzLOysiMum0Wkmme`,
                type: `Asset`,
                createdAt: `2020-04-09T10:53:01.953Z`,
                updatedAt: `2020-04-09T10:53:01.953Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 1,
                contentful_id: `6Od9v3wzLOysiMum0Wkmme`,
              },
              fields: {
                title: {
                  "en-US": `Woman with black hat`,
                },
                description: {
                  "en-US": `Woman wearing a black hat`,
                },
                file: {
                  "en-US": {
                    url: `//images.ctfassets.net/uzfinxahlog0/6Od9v3wzLOysiMum0Wkmme/6617fbe227b7362b236fc6777c0a67bf/cameron-kirby-88711.jpg`,
                    details: {
                      size: 7316629,
                      image: {
                        width: 3000,
                        height: 2000,
                      },
                    },
                    fileName: `cameron-kirby-88711.jpg`,
                    contentType: `image/jpeg`,
                  },
                },
              },
            },
          },
          description: {
            "en-US": `Your very first content with Contentful, pulled in JSON format using the Content Delivery API.`,
          },
          body: {
            "en-US": `These is your very first content with Contentful, pulled in JSON format using the [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/ "Content Delivery API"). Content and presentation are now decoupled, allowing you to focus your efforts in building the perfect app.\n\n## Your first steps\n\nBuilding with Contentful is easy. First take a moment to get [the basics of content modelling](https://www.contentful.com/r/knowledgebase/content-modelling-basics/ "the basics of content modelling"), which you can set up in the [Contentful Web app](https://app.contentful.com/ "Contentful Web app"). Once you get that, feel free to drop by the [Documentation](https://www.contentful.com/developers/docs/ "Documentation") to learn a bit more about how to build your app with Contentful, in particular the [API basics](https://www.contentful.com/developers/docs/concepts/apis/ "API basics") and each one of our four APIs, as shown below.\n\n### Content Delivery API\n\nThe [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/ "Content Delivery API") (CDA), available at \`cdn.contentful.com\`, is a read-only API for delivering content from Contentful to apps, websites and other media. Content is delivered as JSON data, and images, videos and other media as files.\nThe API is available via a globally distributed content delivery network. The server closest to the user serves all content, both JSON and binary. This minimizes latency, which especially benefits mobile apps. Hosting content in multiple global data centers also greatly improves the availability of content.\n\n### Content Management API\n\nThe [Content Management API](https://www.contentful.com/developers/docs/references/content-management-api/ "Content Management API") (CMA), available at \`api.contentful.com\`, is a read-write API for managing content. Unlike the Content Delivery API, the management API requires you to authenticate as a Contentful user. You could use the CMA for several use cases, such as:\n* Automatic imports from different CMSes like WordPress or Drupal.\n* Integration with other backend systems, such as an e-commerce shop.\n* Building custom editing experiences. We built the [Contentful Web app](https://app.contentful.com/ "Contentful Web app") on top of this API.\n\n### Preview API\n\nThe [Content Preview API](https://www.contentful.com/developers/docs/concepts/apis/#content-preview-api "Content Preview API"), available at \`preview.contentful.com\`, is a variant of the CDA for previewing your content before delivering it to your customers. You use the Content Preview API in combination with a "preview" deployment of your website (or a "preview" build of your mobile app) that allows content managers and authors to view their work in-context, as if it were published, using a "preview" access token as though it were delivered by the CDA.\n\n### Images API\n\nThe [Images API](https://www.contentful.com/developers/docs/concepts/apis/#images-api "Images API"), available at \`images.contentful.com\`, allows you to resize and crop images, change their background color and convert them to different formats. Using our API for these transformations lets you upload high-quality assets, deliver exactly what your app needs, and still get all the benefits of our caching CDN.`,
          },
          author: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c15jwOBqpxqSAOy2eOO4S0m`,
                type: `Entry`,
                createdAt: `2020-04-09T10:53:01.487Z`,
                updatedAt: `2020-04-09T10:55:54.432Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 2,
                contentType: {
                  sys: {
                    type: `Link`,
                    linkType: `ContentType`,
                    id: `person`,
                    contentful_id: `person`,
                  },
                },
                contentful_id: `15jwOBqpxqSAOy2eOO4S0m`,
              },
              fields: {
                name: {
                  "en-US": `John Doe`,
                },
                title: {
                  "en-US": `Web Developer`,
                  nl: `Web developer`,
                },
                company: {
                  "en-US": `ACME`,
                },
                shortBio: {
                  "en-US": `Research and recommendations for modern stack websites.`,
                  nl: `Onderzoek en aanbevelingen voor moderne stapelwebsites.`,
                },
                email: {
                  "en-US": `john@doe.com`,
                },
                phone: {
                  "en-US": `0176 / 1234567`,
                },
                facebook: {
                  "en-US": `johndoe`,
                },
                twitter: {
                  "en-US": `johndoe`,
                },
                github: {
                  "en-US": `johndoe`,
                },
                image: {
                  "en-US": {
                    sys: {
                      space: {
                        sys: {
                          type: `Link`,
                          linkType: `Space`,
                          id: `uzfinxahlog0`,
                          contentful_id: `uzfinxahlog0`,
                        },
                      },
                      id: `c7orLdboQQowIUs22KAW4U`,
                      type: `Asset`,
                      createdAt: `2020-04-09T10:53:02.132Z`,
                      updatedAt: `2020-04-09T10:53:02.132Z`,
                      environment: {
                        sys: {
                          id: `master`,
                          type: `Link`,
                          linkType: `Environment`,
                          contentful_id: `master`,
                        },
                      },
                      revision: 1,
                      contentful_id: `7orLdboQQowIUs22KAW4U`,
                    },
                    fields: {
                      title: {
                        "en-US": `Sparkler`,
                      },
                      description: {
                        "en-US": `John with Sparkler`,
                      },
                      file: {
                        "en-US": {
                          url: `//images.ctfassets.net/uzfinxahlog0/7orLdboQQowIUs22KAW4U/d6906da78e61909fc5ad673d00da68e1/matt-palmer-254999.jpg`,
                          details: {
                            size: 2293094,
                            image: {
                              width: 3000,
                              height: 2000,
                            },
                          },
                          fileName: `matt-palmer-254999.jpg`,
                          contentType: `image/jpeg`,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          publishDate: {
            "en-US": `2017-05-15T00:00+02:00`,
          },
          tags: {
            "en-US": [`general`],
          },
        },
      },
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c2PtC9h1YqIA6kaUaIsWEQ0`,
          type: `Entry`,
          createdAt: `2020-04-09T10:53:01.483Z`,
          updatedAt: `2020-04-09T10:53:01.483Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentType: {
            sys: {
              type: `Link`,
              linkType: `ContentType`,
              id: `blogPost`,
              contentful_id: `blogPost`,
            },
          },
          contentful_id: `2PtC9h1YqIA6kaUaIsWEQ0`,
        },
        fields: {
          title: {
            "en-US": `Static sites are great`,
          },
          slug: {
            "en-US": `static-sites-are-great`,
          },
          heroImage: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c4NzwDSDlGECGIiokKomsyI`,
                type: `Asset`,
                createdAt: `2020-04-09T10:53:01.941Z`,
                updatedAt: `2020-04-09T10:53:01.941Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 1,
                contentful_id: `4NzwDSDlGECGIiokKomsyI`,
              },
              fields: {
                title: {
                  "en-US": `City`,
                },
                description: {
                  "en-US": `City pictured from the sky`,
                },
                file: {
                  "en-US": {
                    url: `//images.ctfassets.net/uzfinxahlog0/4NzwDSDlGECGIiokKomsyI/c3745babd5d75655d1ce71d8a79b5986/denys-nevozhai-100695.jpg`,
                    details: {
                      size: 15736986,
                      image: {
                        width: 3992,
                        height: 2992,
                      },
                    },
                    fileName: `denys-nevozhai-100695.jpg`,
                    contentType: `image/jpeg`,
                  },
                },
              },
            },
          },
          description: {
            "en-US": `Worry less about security, caching, and talking to the server. Static sites are the new thing.`,
          },
          body: {
            "en-US": `## The case for the static site generator\n\nMore and more developers are jumping on the "go static train", and rightfully so. Static pages are fast, lightweight, they scale well. They are more secure, and simple to maintain and they allow you to focus all your time and effort on the user interface. Often times, this dedication really shows.\n\nIt just so happens that static site generators are mostly loved by developers, but not by the average Joe. They do not offer WYSIWYG, previewing on demo sites may take an update cycle, they are often based on markdown text files, and they require some knowledge of modern day repositories.\n\nMoreover, when teams are collaborating, it can get complicated quickly. Has this article already been proof-read or reviewed? Is this input valid? Are user permissions available, e.g. for administering adding and removing team members? Can this article be published at a future date? How can a large repository of content be categorized, organized, and searched? All these requirements have previously been more or less solved within the admin area of your CMS. But of course with all the baggage that made you leave the appserver-app-database-in-one-big-blob stack in the first place.\n\n## Content APIs to the rescue\n\nAn alternative is decoupling the content management aspect from the system. And then replacing the maintenance prone server with a cloud based web service offering. Effectively, instead of your CMS of old, you move to a [Content Management as a Service (CMaaS)](https://www.contentful.com/r/knowledgebase/content-as-a-service/ "Content Management as a Service (CMaaS)") world, with a content API to deliver all your content. That way, you get the all the [benefits of content management features](http://www.digett.com/blog/01/16/2014/pairing-static-websites-cms "benefits of content management features") while still being able to embrace the static site generator mantra.\n\nIt so happens that Contentful is offering just that kind of content API. A service that\n\n* from the ground up has been designed to be fast, scalable, secure, and offer high uptime, so that you donÔÇÖt have to worry about maintenance ever again.\n* offers a powerful editor and lots of flexibility in creating templates for your documents that your editors can reuse and combine, so that no developers resources are required in everyday writing and updating tasks.\n* separates content from presentation, so you can reuse your content repository for any device platform your heart desires. That way, you can COPE ("create once, publish everywhere").\n* offers webhooks that you can use to rebuild your static site in a fully automated fashion every time your content is modified.\n\nExtracted from the article [CMS-functionality for static site generators](https://www.contentful.com/r/knowledgebase/contentful-api-cms-static-site-generators/ "CMS-functionality for static site generators"). Read more about the [static site generators supported by Contentful](https://www.contentful.com/developers/docs/tools/staticsitegenerators/ "static site generators supported by Contentful").`,
          },
          author: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c15jwOBqpxqSAOy2eOO4S0m`,
                type: `Entry`,
                createdAt: `2020-04-09T10:53:01.487Z`,
                updatedAt: `2020-04-09T10:55:54.432Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 2,
                contentType: {
                  sys: {
                    type: `Link`,
                    linkType: `ContentType`,
                    id: `person`,
                    contentful_id: `person`,
                  },
                },
                contentful_id: `15jwOBqpxqSAOy2eOO4S0m`,
              },
              fields: {
                name: {
                  "en-US": `John Doe`,
                },
                title: {
                  "en-US": `Web Developer`,
                  nl: `Web developer`,
                },
                company: {
                  "en-US": `ACME`,
                },
                shortBio: {
                  "en-US": `Research and recommendations for modern stack websites.`,
                  nl: `Onderzoek en aanbevelingen voor moderne stapelwebsites.`,
                },
                email: {
                  "en-US": `john@doe.com`,
                },
                phone: {
                  "en-US": `0176 / 1234567`,
                },
                facebook: {
                  "en-US": `johndoe`,
                },
                twitter: {
                  "en-US": `johndoe`,
                },
                github: {
                  "en-US": `johndoe`,
                },
                image: {
                  "en-US": {
                    sys: {
                      space: {
                        sys: {
                          type: `Link`,
                          linkType: `Space`,
                          id: `uzfinxahlog0`,
                          contentful_id: `uzfinxahlog0`,
                        },
                      },
                      id: `c7orLdboQQowIUs22KAW4U`,
                      type: `Asset`,
                      createdAt: `2020-04-09T10:53:02.132Z`,
                      updatedAt: `2020-04-09T10:53:02.132Z`,
                      environment: {
                        sys: {
                          id: `master`,
                          type: `Link`,
                          linkType: `Environment`,
                          contentful_id: `master`,
                        },
                      },
                      revision: 1,
                      contentful_id: `7orLdboQQowIUs22KAW4U`,
                    },
                    fields: {
                      title: {
                        "en-US": `Sparkler`,
                      },
                      description: {
                        "en-US": `John with Sparkler`,
                      },
                      file: {
                        "en-US": {
                          url: `//images.ctfassets.net/uzfinxahlog0/7orLdboQQowIUs22KAW4U/d6906da78e61909fc5ad673d00da68e1/matt-palmer-254999.jpg`,
                          details: {
                            size: 2293094,
                            image: {
                              width: 3000,
                              height: 2000,
                            },
                          },
                          fileName: `matt-palmer-254999.jpg`,
                          contentType: `image/jpeg`,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          publishDate: {
            "en-US": `2017-05-16T00:00+02:00`,
          },
          tags: {
            "en-US": [`javascript`, `static-sites`],
          },
        },
      },
    ],
    assets: [
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c4shwYI3POEGkw0Eg6kcyaQ`,
          type: `Asset`,
          createdAt: `2020-04-09T10:53:03.759Z`,
          updatedAt: `2020-04-09T10:53:03.759Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentful_id: `4shwYI3POEGkw0Eg6kcyaQ`,
        },
        fields: {
          title: {
            "en-US": `Man in the fields`,
          },
          description: {
            "en-US": `Tattooed man walking in a field`,
          },
          file: {
            "en-US": {
              url: `//images.ctfassets.net/uzfinxahlog0/4shwYI3POEGkw0Eg6kcyaQ/c4cb544901e8c454265d7350c9fa565d/felix-russell-saw-112140.jpg`,
              details: {
                size: 4539181,
                image: {
                  width: 2500,
                  height: 1667,
                },
              },
              fileName: `felix-russell-saw-112140.jpg`,
              contentType: `image/jpeg`,
            },
          },
        },
      },
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c7orLdboQQowIUs22KAW4U`,
          type: `Asset`,
          createdAt: `2020-04-09T10:53:02.132Z`,
          updatedAt: `2020-04-09T10:53:02.132Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentful_id: `7orLdboQQowIUs22KAW4U`,
        },
        fields: {
          title: {
            "en-US": `Sparkler`,
          },
          description: {
            "en-US": `John with Sparkler`,
          },
          file: {
            "en-US": {
              url: `//images.ctfassets.net/uzfinxahlog0/7orLdboQQowIUs22KAW4U/d6906da78e61909fc5ad673d00da68e1/matt-palmer-254999.jpg`,
              details: {
                size: 2293094,
                image: {
                  width: 3000,
                  height: 2000,
                },
              },
              fileName: `matt-palmer-254999.jpg`,
              contentType: `image/jpeg`,
            },
          },
        },
      },
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c6Od9v3wzLOysiMum0Wkmme`,
          type: `Asset`,
          createdAt: `2020-04-09T10:53:01.953Z`,
          updatedAt: `2020-04-09T10:53:01.953Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentful_id: `6Od9v3wzLOysiMum0Wkmme`,
        },
        fields: {
          title: {
            "en-US": `Woman with black hat`,
          },
          description: {
            "en-US": `Woman wearing a black hat`,
          },
          file: {
            "en-US": {
              url: `//images.ctfassets.net/uzfinxahlog0/6Od9v3wzLOysiMum0Wkmme/6617fbe227b7362b236fc6777c0a67bf/cameron-kirby-88711.jpg`,
              details: {
                size: 7316629,
                image: {
                  width: 3000,
                  height: 2000,
                },
              },
              fileName: `cameron-kirby-88711.jpg`,
              contentType: `image/jpeg`,
            },
          },
        },
      },
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c4NzwDSDlGECGIiokKomsyI`,
          type: `Asset`,
          createdAt: `2020-04-09T10:53:01.941Z`,
          updatedAt: `2020-04-09T10:53:01.941Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentful_id: `4NzwDSDlGECGIiokKomsyI`,
        },
        fields: {
          title: {
            "en-US": `City`,
          },
          description: {
            "en-US": `City pictured from the sky`,
          },
          file: {
            "en-US": {
              url: `//images.ctfassets.net/uzfinxahlog0/4NzwDSDlGECGIiokKomsyI/c3745babd5d75655d1ce71d8a79b5986/denys-nevozhai-100695.jpg`,
              details: {
                size: 15736986,
                image: {
                  width: 3992,
                  height: 2992,
                },
              },
              fileName: `denys-nevozhai-100695.jpg`,
              contentType: `image/jpeg`,
            },
          },
        },
      },
    ],
    deletedEntries: [],
    deletedAssets: [],
    nextSyncToken: `wrXDkijCgsOuTgwXKDbCk8KiwqbCjmTDo0zCn0zCjMKdFsO5w5zCmFIhwpdnSGJFWl_Cn0DCvsKOSlzDqMKIC8KpwqPDucOKw43CmVbDvsKtPGdXw40MwqNccVvCscOkwqPDssOMAsKKwpxqM3cZBHBew7XDtMO5UQ`,
  },
  contentTypeItems: [
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `blogPost`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.586Z`,
        updatedAt: `2020-04-09T10:52:57.586Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 1,
        contentful_id: `blogPost`,
      },
      displayField: `title`,
      name: `Blog Post`,
      description: null,
      fields: [
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `slug`,
          name: `Slug`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `heroImage`,
          name: `Hero Image`,
          type: `Link`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
        {
          id: `description`,
          name: `Description`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `body`,
          name: `Body`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `author`,
          name: `Author`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Entry`,
        },
        {
          id: `publishDate`,
          name: `Publish Date`,
          type: `Date`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `tags`,
          name: `Tags`,
          type: `Array`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          items: {
            type: `Symbol`,
            validations: [
              {
                in: [`general`, `javascript`, `static-sites`],
              },
            ],
          },
        },
      ],
    },
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `person`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.596Z`,
        updatedAt: `2020-04-09T10:54:43.408Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 2,
        contentful_id: `person`,
      },
      displayField: `name`,
      name: `Person`,
      description: null,
      fields: [
        {
          id: `name`,
          name: `Name`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `company`,
          name: `Company`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `shortBio`,
          name: `Short Bio`,
          type: `Text`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `email`,
          name: `Email`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `phone`,
          name: `Phone`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `facebook`,
          name: `Facebook`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `twitter`,
          name: `Twitter`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `github`,
          name: `Github`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `image`,
          name: `Image`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
      ],
    },
  ],
  defaultLocale: `en-US`,
  locales: [
    {
      code: `en-US`,
      name: `English (United States)`,
      default: true,
      fallbackCode: null,
      sys: {
        id: `1uSElBQA68GRKF30tpTxxT`,
        type: `Locale`,
        version: 1,
      },
    },
    {
      code: `nl`,
      name: `Dutch`,
      default: false,
      fallbackCode: `en-US`,
      sys: {
        id: `2T7M2OzIrvE8cOCOF1HMuY`,
        type: `Locale`,
        version: 1,
      },
    },
  ],
  space: {
    sys: {
      type: `Space`,
      id: `uzfinxahlog0`,
    },
    name: `gatsby-test`,
    locales: [
      {
        code: `en-US`,
        default: true,
        name: `English (United States)`,
        fallbackCode: null,
      },
      {
        code: `nl`,
        default: false,
        name: `Dutch`,
        fallbackCode: `en-US`,
      },
    ],
  },
}

exports.createBlogPost = {
  currentSyncData: {
    entries: [
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c2XTZRrfbMRcfdyFSo4mrOR`,
          type: `Entry`,
          createdAt: `2020-04-09T10:59:16.604Z`,
          updatedAt: `2020-04-09T10:59:16.604Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentType: {
            sys: {
              type: `Link`,
              linkType: `ContentType`,
              id: `blogPost`,
              contentful_id: `blogPost`,
            },
          },
          contentful_id: `2XTZRrfbMRcfdyFSo4mrOR`,
        },
        fields: {
          title: {
            "en-US": `Integration tests`,
          },
          slug: {
            "en-US": `integration-tests`,
          },
          heroImage: {
            "en-US": {
              sys: {
                space: {
                  sys: {
                    type: `Link`,
                    linkType: `Space`,
                    id: `uzfinxahlog0`,
                    contentful_id: `uzfinxahlog0`,
                  },
                },
                id: `c21xFOvxOk9guLHTakpnezz`,
                type: `Asset`,
                createdAt: `2020-04-09T10:59:13.259Z`,
                updatedAt: `2020-04-09T10:59:13.259Z`,
                environment: {
                  sys: {
                    id: `master`,
                    type: `Link`,
                    linkType: `Environment`,
                    contentful_id: `master`,
                  },
                },
                revision: 1,
                contentful_id: `21xFOvxOk9guLHTakpnezz`,
              },
              fields: {
                title: {
                  "en-US": `Dummy image`,
                },
                description: {
                  "en-US": `Just a dummy image`,
                },
                file: {
                  "en-US": {
                    url: `//images.ctfassets.net/uzfinxahlog0/21xFOvxOk9guLHTakpnezz/11442938f3ed3db99680c78d69e256c4/dummy.jpg`,
                    details: {
                      size: 617491,
                      image: {
                        width: 2133,
                        height: 1200,
                      },
                    },
                    fileName: `dummy.jpg`,
                    contentType: `image/jpeg`,
                  },
                },
              },
            },
          },
          description: {
            "en-US": `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris et nisl eget dolor consequat vulputate. Duis a turpis sit amet turpis tincidunt imperdiet eget ac magna. Vestibulum aliquam id nisi nec consequat. Maecenas imperdiet sem ut pharetra vehicula. Fusce tristique luctus ex a porttitor. Duis blandit rutrum dui eu finibus. Etiam consequat nec tellus ut lacinia. Morbi a tempor purus. Donec sit amet consequat augue, nec interdum nulla. Vivamus urna sapien, luctus eget lectus non, malesuada dapibus purus. Nulla cursus commodo nunc. Mauris sapien est, pharetra vel fermentum in, pulvinar ut magna. Nunc sapien justo, sollicitudin ac tortor vel, tristique dictum quam.`,
          },
          body: {
            "en-US": `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris et nisl eget dolor consequat vulputate. Duis a turpis sit amet turpis tincidunt imperdiet eget ac magna. Vestibulum aliquam id nisi nec consequat. Maecenas imperdiet sem ut pharetra vehicula. Fusce tristique luctus ex a porttitor. Duis blandit rutrum dui eu finibus. Etiam consequat nec tellus ut lacinia. Morbi a tempor purus. Donec sit amet consequat augue, nec interdum nulla. Vivamus urna sapien, luctus eget lectus non, malesuada dapibus purus. Nulla cursus commodo nunc. Mauris sapien est, pharetra vel fermentum in, pulvinar ut magna. Nunc sapien justo, sollicitudin ac tortor vel, tristique dictum quam.\n\nEtiam a imperdiet massa, sit amet sodales arcu. In risus ex, venenatis vitae vestibulum at, cursus sed urna. Phasellus cursus finibus suscipit. Fusce scelerisque felis commodo nulla vehicula faucibus. Nullam magna mi, fermentum sed mauris at, condimentum sagittis risus. Maecenas rutrum condimentum nisl. Pellentesque ut tortor tortor. In venenatis congue justo, id condimentum leo. Maecenas sed accumsan magna, ac condimentum dui. Aliquam a dapibus turpis. Etiam laoreet vel dui eget ultricies. Proin nec elit odio.`,
          },
          author: {
            "en-US": {
              sys: {
                type: `Link`,
                linkType: `Entry`,
                id: `c15jwOBqpxqSAOy2eOO4S0m`,
                contentful_id: `15jwOBqpxqSAOy2eOO4S0m`,
              },
            },
          },
          publishDate: {
            "en-US": `2020-04-01T00:00+00:00`,
          },
        },
      },
    ],
    assets: [
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c21xFOvxOk9guLHTakpnezz`,
          type: `Asset`,
          createdAt: `2020-04-09T10:59:13.259Z`,
          updatedAt: `2020-04-09T10:59:13.259Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          contentful_id: `21xFOvxOk9guLHTakpnezz`,
        },
        fields: {
          title: {
            "en-US": `Dummy image`,
          },
          description: {
            "en-US": `Just a dummy image`,
          },
          file: {
            "en-US": {
              url: `//images.ctfassets.net/uzfinxahlog0/21xFOvxOk9guLHTakpnezz/11442938f3ed3db99680c78d69e256c4/dummy.jpg`,
              details: {
                size: 617491,
                image: {
                  width: 2133,
                  height: 1200,
                },
              },
              fileName: `dummy.jpg`,
              contentType: `image/jpeg`,
            },
          },
        },
      },
    ],
    deletedEntries: [],
    deletedAssets: [],
    nextSyncToken: `wrXDkijCgsOuTgwXKDbCk8KiwqbCjmTDo0zCn0zCjMKdFsO5w5zCmFIhwpdnSGJFBhDDtTrCs8KPw6bCrQ3CssKIwo0Gw7BNN13DsMKYw4zDuUrClcOGb8Ouw4nDjGJAMRbDihVjTEgub8OpUMO2dR8Pc8O0wpw`,
  },
  contentTypeItems: [
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `blogPost`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.586Z`,
        updatedAt: `2020-04-09T10:52:57.586Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 1,
        contentful_id: `blogPost`,
      },
      displayField: `title`,
      name: `Blog Post`,
      description: null,
      fields: [
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `slug`,
          name: `Slug`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `heroImage`,
          name: `Hero Image`,
          type: `Link`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
        {
          id: `description`,
          name: `Description`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `body`,
          name: `Body`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `author`,
          name: `Author`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Entry`,
        },
        {
          id: `publishDate`,
          name: `Publish Date`,
          type: `Date`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `tags`,
          name: `Tags`,
          type: `Array`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          items: {
            type: `Symbol`,
            validations: [
              {
                in: [`general`, `javascript`, `static-sites`],
              },
            ],
          },
        },
      ],
    },
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `person`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.596Z`,
        updatedAt: `2020-04-09T10:54:43.408Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 2,
        contentful_id: `person`,
      },
      displayField: `name`,
      name: `Person`,
      description: null,
      fields: [
        {
          id: `name`,
          name: `Name`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `company`,
          name: `Company`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `shortBio`,
          name: `Short Bio`,
          type: `Text`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `email`,
          name: `Email`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `phone`,
          name: `Phone`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `facebook`,
          name: `Facebook`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `twitter`,
          name: `Twitter`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `github`,
          name: `Github`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `image`,
          name: `Image`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
      ],
    },
  ],
  defaultLocale: `en-US`,
  locales: [
    {
      code: `en-US`,
      name: `English (United States)`,
      default: true,
      fallbackCode: null,
      sys: {
        id: `1uSElBQA68GRKF30tpTxxT`,
        type: `Locale`,
        version: 1,
      },
    },
    {
      code: `nl`,
      name: `Dutch`,
      default: false,
      fallbackCode: `en-US`,
      sys: {
        id: `2T7M2OzIrvE8cOCOF1HMuY`,
        type: `Locale`,
        version: 1,
      },
    },
  ],
  space: {
    sys: {
      type: `Space`,
      id: `uzfinxahlog0`,
    },
    name: `gatsby-test`,
    locales: [
      {
        code: `en-US`,
        default: true,
        name: `English (United States)`,
        fallbackCode: null,
      },
      {
        code: `nl`,
        default: false,
        name: `Dutch`,
        fallbackCode: `en-US`,
      },
    ],
  },
}

exports.updateBlogPost = {
  currentSyncData: {
    entries: [
      {
        sys: {
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          id: `c3K9b0esdy0q0yGqgW2g6Ke`,
          type: `Entry`,
          createdAt: `2020-04-09T10:53:01.485Z`,
          updatedAt: `2020-04-09T11:01:27.357Z`,
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 2,
          contentType: {
            sys: {
              type: `Link`,
              linkType: `ContentType`,
              id: `blogPost`,
              contentful_id: `blogPost`,
            },
          },
          contentful_id: `3K9b0esdy0q0yGqgW2g6Ke`,
        },
        fields: {
          title: {
            "en-US": `Hello world 1234`,
          },
          slug: {
            "en-US": `hello-world`,
          },
          heroImage: {
            "en-US": {
              sys: {
                type: `Link`,
                linkType: `Asset`,
                id: `c6Od9v3wzLOysiMum0Wkmme`,
                contentful_id: `6Od9v3wzLOysiMum0Wkmme`,
              },
            },
          },
          description: {
            "en-US": `Your very first content with Contentful, pulled in JSON format using the Content Delivery API.`,
          },
          body: {
            "en-US": `These is your very first content with Contentful, pulled in JSON format using the [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/ "Content Delivery API"). Content and presentation are now decoupled, allowing you to focus your efforts in building the perfect app.\n\n## Your first steps\n\nBuilding with Contentful is easy. First take a moment to get [the basics of content modelling](https://www.contentful.com/r/knowledgebase/content-modelling-basics/ "the basics of content modelling"), which you can set up in the [Contentful Web app](https://app.contentful.com/ "Contentful Web app"). Once you get that, feel free to drop by the [Documentation](https://www.contentful.com/developers/docs/ "Documentation") to learn a bit more about how to build your app with Contentful, in particular the [API basics](https://www.contentful.com/developers/docs/concepts/apis/ "API basics") and each one of our four APIs, as shown below.\n\n### Content Delivery API\n\nThe [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/ "Content Delivery API") (CDA), available at \`cdn.contentful.com\`, is a read-only API for delivering content from Contentful to apps, websites and other media. Content is delivered as JSON data, and images, videos and other media as files.\nThe API is available via a globally distributed content delivery network. The server closest to the user serves all content, both JSON and binary. This minimizes latency, which especially benefits mobile apps. Hosting content in multiple global data centers also greatly improves the availability of content.\n\n### Content Management API\n\nThe [Content Management API](https://www.contentful.com/developers/docs/references/content-management-api/ "Content Management API") (CMA), available at \`api.contentful.com\`, is a read-write API for managing content. Unlike the Content Delivery API, the management API requires you to authenticate as a Contentful user. You could use the CMA for several use cases, such as:\n* Automatic imports from different CMSes like WordPress or Drupal.\n* Integration with other backend systems, such as an e-commerce shop.\n* Building custom editing experiences. We built the [Contentful Web app](https://app.contentful.com/ "Contentful Web app") on top of this API.\n\n### Preview API\n\nThe [Content Preview API](https://www.contentful.com/developers/docs/concepts/apis/#content-preview-api "Content Preview API"), available at \`preview.contentful.com\`, is a variant of the CDA for previewing your content before delivering it to your customers. You use the Content Preview API in combination with a "preview" deployment of your website (or a "preview" build of your mobile app) that allows content managers and authors to view their work in-context, as if it were published, using a "preview" access token as though it were delivered by the CDA.\n\n### Images API\n\nThe [Images API](https://www.contentful.com/developers/docs/concepts/apis/#images-api "Images API"), available at \`images.contentful.com\`, allows you to resize and crop images, change their background color and convert them to different formats. Using our API for these transformations lets you upload high-quality assets, deliver exactly what your app needs, and still get all the benefits of our caching CDN.`,
          },
          author: {
            "en-US": {
              sys: {
                type: `Link`,
                linkType: `Entry`,
                id: `c15jwOBqpxqSAOy2eOO4S0m`,
                contentful_id: `15jwOBqpxqSAOy2eOO4S0m`,
              },
            },
          },
          publishDate: {
            "en-US": `2017-05-15T00:00+02:00`,
          },
          tags: {
            "en-US": [`general`],
          },
        },
      },
    ],
    assets: [],
    deletedEntries: [],
    deletedAssets: [],
    nextSyncToken: `wrXDkijCgsOuTgwXKDbCk8KiwqbCjmTDo0zCn0zCjMKdFsO5w5zCmFIhwpdnSGJFwrxIOXrCkMKJw5_CkcKrVjhQwq_DucKOLcKTwrNNHiIvOzfDi8KBXjHDtikNwobDksKhwp8_TcOgLjjCtMO7O25Mw7smwos`,
  },
  contentTypeItems: [
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `blogPost`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.586Z`,
        updatedAt: `2020-04-09T10:52:57.586Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 1,
        contentful_id: `blogPost`,
      },
      displayField: `title`,
      name: `Blog Post`,
      description: null,
      fields: [
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `slug`,
          name: `Slug`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `heroImage`,
          name: `Hero Image`,
          type: `Link`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
        {
          id: `description`,
          name: `Description`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `body`,
          name: `Body`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `author`,
          name: `Author`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Entry`,
        },
        {
          id: `publishDate`,
          name: `Publish Date`,
          type: `Date`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `tags`,
          name: `Tags`,
          type: `Array`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          items: {
            type: `Symbol`,
            validations: [
              {
                in: [`general`, `javascript`, `static-sites`],
              },
            ],
          },
        },
      ],
    },
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `person`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.596Z`,
        updatedAt: `2020-04-09T10:54:43.408Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 2,
        contentful_id: `person`,
      },
      displayField: `name`,
      name: `Person`,
      description: null,
      fields: [
        {
          id: `name`,
          name: `Name`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `company`,
          name: `Company`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `shortBio`,
          name: `Short Bio`,
          type: `Text`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `email`,
          name: `Email`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `phone`,
          name: `Phone`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `facebook`,
          name: `Facebook`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `twitter`,
          name: `Twitter`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `github`,
          name: `Github`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `image`,
          name: `Image`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
      ],
    },
  ],
  defaultLocale: `en-US`,
  locales: [
    {
      code: `en-US`,
      name: `English (United States)`,
      default: true,
      fallbackCode: null,
      sys: {
        id: `1uSElBQA68GRKF30tpTxxT`,
        type: `Locale`,
        version: 1,
      },
    },
    {
      code: `nl`,
      name: `Dutch`,
      default: false,
      fallbackCode: `en-US`,
      sys: {
        id: `2T7M2OzIrvE8cOCOF1HMuY`,
        type: `Locale`,
        version: 1,
      },
    },
  ],
  space: {
    sys: {
      type: `Space`,
      id: `uzfinxahlog0`,
    },
    name: `gatsby-test`,
    locales: [
      {
        code: `en-US`,
        default: true,
        name: `English (United States)`,
        fallbackCode: null,
      },
      {
        code: `nl`,
        default: false,
        name: `Dutch`,
        fallbackCode: `en-US`,
      },
    ],
  },
}

exports.removeBlogPost = {
  currentSyncData: {
    entries: [],
    assets: [],
    deletedEntries: [
      {
        sys: {
          type: `DeletedEntry`,
          id: `c2XTZRrfbMRcfdyFSo4mrOR`,
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          createdAt: `2020-04-09T11:02:59.504Z`,
          updatedAt: `2020-04-09T11:02:59.504Z`,
          deletedAt: `2020-04-09T11:02:59.504Z`,
          contentful_id: `2XTZRrfbMRcfdyFSo4mrOR`,
        },
      },
    ],
    deletedAssets: [],
    nextSyncToken: `wrXDkijCgsOuTgwXKDbCk8KiwqbCjmTDo0zCn0zCjMKdFsO5w5zCmFIhwpdnSGJFbHrCtg_Cix3DmMO6FMKsGsK1QHUmLwdHw5nDmMO4CMK1w4nCvsK_fMOOwpg2w4bCksOGwrfClsKYw5tXw5rDoMOHwrPChMKKwp3CtTzCkg`,
  },
  contentTypeItems: [
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `blogPost`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.586Z`,
        updatedAt: `2020-04-09T10:52:57.586Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 1,
        contentful_id: `blogPost`,
      },
      displayField: `title`,
      name: `Blog Post`,
      description: null,
      fields: [
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `slug`,
          name: `Slug`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `heroImage`,
          name: `Hero Image`,
          type: `Link`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
        {
          id: `description`,
          name: `Description`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `body`,
          name: `Body`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `author`,
          name: `Author`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Entry`,
        },
        {
          id: `publishDate`,
          name: `Publish Date`,
          type: `Date`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `tags`,
          name: `Tags`,
          type: `Array`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          items: {
            type: `Symbol`,
            validations: [
              {
                in: [`general`, `javascript`, `static-sites`],
              },
            ],
          },
        },
      ],
    },
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `person`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.596Z`,
        updatedAt: `2020-04-09T10:54:43.408Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 2,
        contentful_id: `person`,
      },
      displayField: `name`,
      name: `Person`,
      description: null,
      fields: [
        {
          id: `name`,
          name: `Name`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `company`,
          name: `Company`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `shortBio`,
          name: `Short Bio`,
          type: `Text`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `email`,
          name: `Email`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `phone`,
          name: `Phone`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `facebook`,
          name: `Facebook`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `twitter`,
          name: `Twitter`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `github`,
          name: `Github`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `image`,
          name: `Image`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
      ],
    },
  ],
  defaultLocale: `en-US`,
  locales: [
    {
      code: `en-US`,
      name: `English (United States)`,
      default: true,
      fallbackCode: null,
      sys: {
        id: `1uSElBQA68GRKF30tpTxxT`,
        type: `Locale`,
        version: 1,
      },
    },
    {
      code: `nl`,
      name: `Dutch`,
      default: false,
      fallbackCode: `en-US`,
      sys: {
        id: `2T7M2OzIrvE8cOCOF1HMuY`,
        type: `Locale`,
        version: 1,
      },
    },
  ],
  space: {
    sys: {
      type: `Space`,
      id: `uzfinxahlog0`,
    },
    name: `gatsby-test`,
    locales: [
      {
        code: `en-US`,
        default: true,
        name: `English (United States)`,
        fallbackCode: null,
      },
      {
        code: `nl`,
        default: false,
        name: `Dutch`,
        fallbackCode: `en-US`,
      },
    ],
  },
}

exports.removeAsset = {
  currentSyncData: {
    entries: [],
    assets: [],
    deletedEntries: [],
    deletedAssets: [
      {
        sys: {
          type: `DeletedAsset`,
          id: `c21xFOvxOk9guLHTakpnezz`,
          space: {
            sys: {
              type: `Link`,
              linkType: `Space`,
              id: `uzfinxahlog0`,
              contentful_id: `uzfinxahlog0`,
            },
          },
          environment: {
            sys: {
              id: `master`,
              type: `Link`,
              linkType: `Environment`,
              contentful_id: `master`,
            },
          },
          revision: 1,
          createdAt: `2020-04-09T11:03:48.457Z`,
          updatedAt: `2020-04-09T11:03:48.457Z`,
          deletedAt: `2020-04-09T11:03:48.457Z`,
          contentful_id: `21xFOvxOk9guLHTakpnezz`,
        },
      },
    ],
    nextSyncToken: `wrXDkijCgsOuTgwXKDbCk8KiwqbCjmTDo0zCn0zCjMKdFsO5w5zCmFIhwpdnSGJFaERvTsKwI8K0w69BSCfChsO3wqbDnMKwaxcKFMOIw4DDkcKYw7fCuHnCmV1MQcKtw79DwokewrvCscOcwpgFd3R_T0TDpxU`,
  },
  contentTypeItems: [
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `blogPost`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.586Z`,
        updatedAt: `2020-04-09T10:52:57.586Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 1,
        contentful_id: `blogPost`,
      },
      displayField: `title`,
      name: `Blog Post`,
      description: null,
      fields: [
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `slug`,
          name: `Slug`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `heroImage`,
          name: `Hero Image`,
          type: `Link`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
        {
          id: `description`,
          name: `Description`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `body`,
          name: `Body`,
          type: `Text`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `author`,
          name: `Author`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Entry`,
        },
        {
          id: `publishDate`,
          name: `Publish Date`,
          type: `Date`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `tags`,
          name: `Tags`,
          type: `Array`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          items: {
            type: `Symbol`,
            validations: [
              {
                in: [`general`, `javascript`, `static-sites`],
              },
            ],
          },
        },
      ],
    },
    {
      sys: {
        space: {
          sys: {
            type: `Link`,
            linkType: `Space`,
            id: `uzfinxahlog0`,
            contentful_id: `uzfinxahlog0`,
          },
        },
        id: `person`,
        type: `ContentType`,
        createdAt: `2020-04-09T10:52:57.596Z`,
        updatedAt: `2020-04-09T10:54:43.408Z`,
        environment: {
          sys: {
            id: `master`,
            type: `Link`,
            linkType: `Environment`,
            contentful_id: `master`,
          },
        },
        revision: 2,
        contentful_id: `person`,
      },
      displayField: `name`,
      name: `Person`,
      description: null,
      fields: [
        {
          id: `name`,
          name: `Name`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `title`,
          name: `Title`,
          type: `Symbol`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `company`,
          name: `Company`,
          type: `Symbol`,
          localized: false,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `shortBio`,
          name: `Short Bio`,
          type: `Text`,
          localized: true,
          required: true,
          disabled: false,
          omitted: false,
        },
        {
          id: `email`,
          name: `Email`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `phone`,
          name: `Phone`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `facebook`,
          name: `Facebook`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `twitter`,
          name: `Twitter`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `github`,
          name: `Github`,
          type: `Symbol`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
        },
        {
          id: `image`,
          name: `Image`,
          type: `Link`,
          localized: false,
          required: false,
          disabled: false,
          omitted: false,
          linkType: `Asset`,
        },
      ],
    },
  ],
  defaultLocale: `en-US`,
  locales: [
    {
      code: `en-US`,
      name: `English (United States)`,
      default: true,
      fallbackCode: null,
      sys: {
        id: `1uSElBQA68GRKF30tpTxxT`,
        type: `Locale`,
        version: 1,
      },
    },
    {
      code: `nl`,
      name: `Dutch`,
      default: false,
      fallbackCode: `en-US`,
      sys: {
        id: `2T7M2OzIrvE8cOCOF1HMuY`,
        type: `Locale`,
        version: 1,
      },
    },
  ],
  space: {
    sys: {
      type: `Space`,
      id: `uzfinxahlog0`,
    },
    name: `gatsby-test`,
    locales: [
      {
        code: `en-US`,
        default: true,
        name: `English (United States)`,
        fallbackCode: null,
      },
      {
        code: `nl`,
        default: false,
        name: `Dutch`,
        fallbackCode: `en-US`,
      },
    ],
  },
}
