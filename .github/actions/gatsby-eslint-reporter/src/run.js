const request = require("./request")

const { GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE } = process.env
const event = require(GITHUB_EVENT_PATH)
const { repository, after: actualSHA } = event
const {
  owner: { login: owner },
} = repository
const { name: repo } = repository

// console.log('my debug stuff:', {
//   owner,
//   repo,
//   actualSHA,
//   event
// })

const checkName = "Display lint in PR"

const headers = {
  "Content-Type": "application/json",
  // As per the note at https://developer.github.com/v3/checks/runs/#create-a-check-run
  // The Accept type must be set to a custom vnd.github.antiope-preview+json
  Accept: "application/vnd.github.antiope-preview+json",
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  "User-Agent": "eslint-reporter",
}

function runEslint() {
  const eslint = require("eslint")

  console.log("Running eslint now ...")

  const cli = new eslint.CLIEngine({
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    // Dedupe messages between eslint/prettier/TS (ever growing list)
    rules: {
      "@typescript-eslint/quotes": 0,
    },
  })
  const report = cli.executeOnFiles(["."])

  // fixableErrorCount, fixableWarningCount are available too
  const { results, errorCount, warningCount } = report

  console.log("Finished eslint")
  console.log("Found", errorCount, "errors (and", warningCount, "warnings)")
  console.log(
    "Marking action as",
    errorCount > 0 ? "failure due to error count" : "success"
  )

  const levels = ["", "warning", "failure"]

  // There is no "quiet" option for CLIEngine and getting a config is too
  // much work so we just filter the warnings here.

  const annotations = []
  for (const result of results) {
    const { filePath, messages } = result
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1)
    for (const msg of messages) {
      const { line, severity, ruleId, message } = msg
      const annotationLevel = levels[severity]
      if (annotationLevel === "failure") {
        annotations.push({
          path,
          start_line: line,
          end_line: line,
          annotation_level: annotationLevel,
          message: `[${ruleId}] ${message}`,
        })
      }
    }
  }

  return {
    conclusion: errorCount > 0 ? "failure" : "success",
    output: {
      title: checkName,
      summary: `${errorCount} error(s) (and ${warningCount} warnings) found`,
      annotations,
    },
  }
}

async function startAction() {
  const body = {
    name: checkName,
    head_sha: actualSHA,
    status: "in_progress",
    started_at: new Date(),
  }

  const {
    data: { id },
  } = await request(
    `https://api.github.com/repos/${owner}/${repo}/check-runs`,
    {
      method: "POST",
      headers,
      body,
    }
  )

  return id
}

async function completeAction(id, conclusion, output) {
  const body = {
    name: checkName,
    head_sha: actualSHA,
    status: "completed",
    completed_at: new Date(),
    conclusion,
    output,
  }

  await request(
    `https://api.github.com/repos/${owner}/${repo}/check-runs/${id}`,
    {
      method: "PATCH",
      headers,
      body,
    }
  )
}

function exitWithError(err) {
  console.error("Error", err.stack)
  if (err.data) {
    console.error(err.data)
  }
  process.exit(1)
}

async function run() {
  const id = await startAction()
  try {
    const { conclusion, output } = runEslint()

    await completeAction(id, conclusion, output)
    if (conclusion === "failure") {
      process.exit(78)
    }
  } catch (err) {
    await completeAction(id, "failure")
    exitWithError(err)
  }
}

run().catch(exitWithError)
