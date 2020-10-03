const crypto = require("crypto")
const squareConnect = require("square-connect")
require("dotenv").config({})

exports.handler = async (event, context) => {
  console.log(`function method:${event.httpMethod}`)
  try {
    // check the method due to pre-flight options request done before the actual post by some browsers
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 205,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        },
        body: "BOOP",
      }
    }

    // checks the method and body to see if they are allowed
    if (event.httpMethod !== "POST" || !event.body) {
      return { statusCode: 405, body: "Method Not Allowed" }
    }

    // fetches the token (don't forget that this might be using the sandbox one, adjust accordingly when deploying)
    const token = process.env.GATSBY_SQUARE_APLLICATION_TOKEN
    if (!token) {
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        },
        body:
          "Something is wrong with the configuration. Check your configuration",
      }
    }

    // retrieves the payment data sent from the website
    const data = JSON.parse(event.body)

    // Set Square Connect credentials and environment
    const defaultClient = squareConnect.ApiClient.instance

    // Configure OAuth2 access token for authorization: oauth2
    const oauth2 = defaultClient.authentications["oauth2"]
    oauth2.accessToken = token

    // Set 'basePath' to switch between sandbox env and production env
    // sandbox: https://connect.squareupsandbox.com
    // production: https://connect.squareup.com
    defaultClient.basePath = "https://connect.squareupsandbox.com"

    // generate a idempotency key for the payment
    const idempotency_key = crypto.randomBytes(22).toString("hex")

    // instantiates the api
    const payments_api = new squareConnect.PaymentsApi()

    // generates a request object to process the payment
    const request_body = {
      source_id: data.cardNounce,
      amount_money: {
        amount: data.paymentAmmount,
        currency: data.currency,
      },
      idempotency_key: idempotency_key,
    }
    //
    // calls the square payments api to process the payment issued
    const response = await payments_api.createPayment(request_body)
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      },
      body:JSON.stringify({
        message: `Payment Successful`,
        paymentInfo:response
      }),
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      },
      body: "Something went wrong with your request. Try again later",
    }
  }
}
