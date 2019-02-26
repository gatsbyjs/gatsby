module.exports={
    siteMetadata:{
        title:`Blog Search using js-search`,
    },
    plugins:[
        {
            resolve:`gatsby-source-filesystem`,
            options:{
                path:`${__dirname}/content`
            }
        },
        `gatsby-transformer-remark`
    ]
}