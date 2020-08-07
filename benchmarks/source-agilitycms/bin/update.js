/*
THIS UPDATES A POST IN THE WEBSITE
	Requires the following variables to be set correctly:
	env.BENCHMARK_AGILITY_WEBSITE_NAME
	env.BENCHMARK_AGILITY_SECURITY_KEY
	env.BENCHMARK_AGILITY_GUID
	env.BENCHMARK_AGILITY_API_KEY
	env.BENCHMARK_AGILITY_API_ISPREVIEW
*/

require("dotenv").config({
	path: `.env.${process.env.NODE_ENV}`,
})


const agilityMgmt = require('@agility/content-management')
const agilityFetch = require('@agility/content-fetch')

const runUpdate = async () => {
	try {
		const websiteName = process.env.BENCHMARK_AGILITY_WEBSITE_NAME
		const securityKey = process.env.BENCHMARK_AGILITY_SECURITY_KEY
		const guid = process.env.BENCHMARK_AGILITY_GUID
		const apiKey = process.env.BENCHMARK_AGILITY_API_KEY
		const isPreview = process.env.BENCHMARK_AGILITY_API_ISPREVIEW

		console.log(`*** STARTING UPDATE - ${websiteName}`)

		const mgmtApi = agilityMgmt.getApi({ location: 'USA', websiteName, securityKey });
		const fetchAPI = agilityFetch.getApi({ guid, apiKey, isPreview });

		const languageCode = "en-us"

		//pull the first item in the list
		const listResult = await fetchAPI.getContentList({
			referenceName: "posts",
			languageCode,
			contentLinkDepth: 0,
			take: 1
		})

		if (!listResult
			|| !listResult.items
			|| !(listResult.items.length > 0)) {
			console.warn("The first content item in the posts list was not returned.")
			return
		}

		const contentItem = listResult.items[0]

		contentItem.fields.Title = contentItem.fields.title = "evolve Ergonomic Frozen Keyboard Strategist optical Kwanza Money Market Account Principal " + new Date().toISOString()

		//update the content item (this will place it in Staging mode)
		const contentID = await mgmtApi.saveContentItem({
			contentItem,
			languageCode: "en-us",
			referenceName: "posts"
		})

		//publish the item (this will kick the webhook)
		await mgmtApi.publishContent({
			contentID,
			languageCode
		})

		console.log(`*** UPDATE COMPLETE - ${websiteName}`)
	} catch (e) {
		console.error("An error occurred while updating the posts list: ", e)
	}
}

runUpdate()