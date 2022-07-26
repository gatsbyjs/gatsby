/*
THIS RUNS THE INITIAL SETUP FOR THE SITE BASED ON the following variables:
	env.DATA_PATH
	env.BENCHMARK_AGILITY_WEBSITE_NAME
	env.BENCHMARK_AGILITY_SECURITY_KEY
*/

require("dotenv").config({
	path: `.env.${process.env.NODE_ENV}`,
})

const async = require("async")
const fs = require("fs")
const path = require(`path`)
const fetch = require('node-fetch');
const agilityMgmt = require('@agility/content-management')

const runSetup = async () => {

	const dataPath = process.env.DATA_PATH
	const websiteName = process.env.BENCHMARK_AGILITY_WEBSITE_NAME
	const securityKey = process.env.BENCHMARK_AGILITY_SECURITY_KEY

	console.log(`*** STARTING IMPORT ${websiteName}`)

	const mgmtApi = agilityMgmt.getApi({
		location: 'USA',
		websiteName: websiteName,
		securityKey: securityKey

	});


	let itemCount = 0
	const posts = await readposts(dataPath)

	await async.eachLimit(posts, 10, async (post) => {

		await importPost({ mgmtApi, post })
		itemCount++
	});

	console.log(`*** FINISHED IMPORT OF ${itemCount} items`)
}

const importPost = async ({ post, mgmtApi }) => {

	//create the media
	//let imageUrl = post.image.url
	// let fetchRes = await fetch(imageUrl)
	// let imageBlob = await fetchRes.buffer()

	// let filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1)

	// let mediaObj = await mgmtApi.uploadMedia({
	// 	fileName: filename,
	// 	fileContent: imageBlob
	// })

	/*
	mediaID
	url
	size
	contentType
	*/

	//create the content item
	let contentItem = {
		contentID: -1,
		fields: {
			"Title": post.title,
			"articleNumber": post.articleNumber,
			"content": post.content,
			"image": post.image.url
		}
	}

	const contentID = await mgmtApi.saveContentItem({
		contentItem,
		languageCode: "en-us",
		referenceName: "posts"
	})

	console.log("Saved content item ", contentID)


}


async function* readposts(dataPath) {
	console.log("READING posts ", dataPath)
	if (!fs.promises.opendir) {
		console.error(`This command requires Node 12.12+`)
		process.exit(1)
	}

	if (!fs.existsSync(dataPath)) {
		console.error(`Could not find datasource directory: ${dataPath}`)
		process.exit(1)
	}
	const dir = await fs.promises.opendir(dataPath)


	for await (const dirent of dir) {
		console.log(dirent)
		if (dirent.isFile() && /\.json$/.test(dirent.name)) {
			const filePath = path.join(dataPath, dirent.name)


			const content = fs.readFileSync(filePath)
			const posts = JSON.parse(content)
			for (const post of posts) {
				yield post
			}
		}
	}
}


runSetup()