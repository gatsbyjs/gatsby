import { danger, peril } from "danger";
import * as octokit from "@octokit/rest";

const ACCEPTABLE_MERGEABLE_STATES = [`clean`, `unstable`];

async function checkPRConditionsAndMerge({
  pull_number,
  owner,
  repo,
}: {
  pull_number: number;
  owner: string;
  repo: string;
}) {
  // we need to check if "bot: merge on green" label is applied and PR is mergeable (checks are green and have approval)
  const userAuthedAPI = new octokit.Octokit();
  userAuthedAPI.auth({
    type: "token",
    token: peril.env.GITHUB_ACCESS_TOKEN,
  });

  const pr = await userAuthedAPI.pulls.get({ pull_number, owner, repo });

  const isMergeButtonGreen = ACCEPTABLE_MERGEABLE_STATES.includes(
    pr.data.mergeable_state,
  );

  const hasMergeOnGreenLabel = pr.data.labels.some(
    (label: { name: string }) => label.name === `bot: merge on green`,
  );

  console.log({
    pull_number,
    owner,
    repo,
    isMergeButtonGreen,
    hasMergeOnGreenLabel,
    mergeable_state: pr.data.mergeable_state,
  });

  if (isMergeButtonGreen && hasMergeOnGreenLabel) {
    await userAuthedAPI.pulls.merge({
      merge_method: `squash`,
      commit_title: `${pr.data.title} (#${pull_number})`,
      pull_number,
      owner,
      repo,
    });
  }
}

export async function mergeOnGreen() {
  try {
    // @ts-ignore Property 'action' does not exist on type 'GitHubDSL'.ts(2339)
    // Property 'check_suite' does not exist on type 'GitHubDSL'.ts(2339)
    if (danger.github.action === `completed` && danger.github.check_suite) {
      // this is for check_suite.completed
      // search returns first 100 results, we are not handling pagination right now
      // because it's unlikely to get more 100 results for given sha
      // @ts-ignore Property 'issues' does not exist on type '{ code: { (params?: (RequestParameters & Omit<{ q: string; sort?: "indexed" | undefined; order?: "desc" | "asc" | undefined; per_page?: number | undefined; page?: number | undefined; }, "baseUrl" | ... 1 more ... | "mediaType">) | undefined): Promise<...>; defaults: <O extends RequestParameters = RequestParameters>(...'.ts(2339)
      const results = await danger.github.api.search.issues({
        // @ts-ignore Property 'check_suite' does not exist on type 'GitHubDSL'.ts(2339)
        q: `${danger.github.check_suite.head_sha} is:open repo:${danger.github.repository.owner.login}/${danger.github.repository.name}`,
      });

      let i = 0;
      while (i < results.data.items.length) {
        const pr = results.data.items[i];
        i++;
        await checkPRConditionsAndMerge({
          pull_number: pr.number,
          // @ts-ignore Property 'repository' does not exist on type 'GitHubDSL'.ts(2339)
          owner: danger.github.repository.owner.login,
          // @ts-ignore Property 'repository' does not exist on type 'GitHubDSL'.ts(2339)
          repo: danger.github.repository.name,
        });
      }
      // @ts-ignore Property 'state' does not exist on type 'GitHubDSL'.ts(2339)
      // Property 'commit' does not exist on type 'GitHubDSL'.ts(2339)
    } else if (danger.github.state === `success` && danger.github.commit) {
      // this is for status.success
      // search returns first 100 results, we are not handling pagination right now
      // because it's unlikely to get more 100 results for given sha
      // @ts-ignore Property 'issues' does not exist on type '{ code: { (params?: (RequestParameters & Omit<{ q: string; sort?: "indexed" | undefined; order?: "desc" | "asc" | undefined; per_page?: number | undefined; page?: number | undefined; }, "baseUrl" | ... 1 more ... | "mediaType">) | undefined): Promise<...>; defaults: <O extends RequestParameters = RequestParameters>(...'.ts(2339)
      const results = await danger.github.api.search.issues({
        // @ts-ignore Property 'commit' does not exist on type 'GitHubDSL'. Did you mean 'commits'?ts(2551)
        // Property 'repository' does not exist on type 'GitHubDSL'.ts(2339)
        q: `${danger.github.commit.sha} is:open repo:${danger.github.repository.owner.login}/${danger.github.repository.name}`,
      });

      let i = 0;
      while (i < results.data.items.length) {
        const pr = results.data.items[i];
        i++;
        await checkPRConditionsAndMerge({
          pull_number: pr.number,
          // @ts-ignore Property 'repository' does not exist on type 'GitHubDSL'.ts(2339)
          owner: danger.github.repository.owner.login,
          // @ts-ignore Property 'repository' does not exist on type 'GitHubDSL'.ts(2339)
          repo: danger.github.repository.name,
        });
      }
    } else if (
      // @ts-ignore Property 'action' does not exist on type 'GitHubDSL'.ts(2339)
      danger.github.action === `submitted` &&
      danger.github.pr
    ) {
      // this is for pull_request_review.submitted
      await checkPRConditionsAndMerge({
        pull_number: danger.github.pr.number,
        repo: danger.github.pr.base.repo.name,
        owner: danger.github.pr.base.repo.owner.login,
      });
    } else {
      // this is for pull_request.labeled
      await checkPRConditionsAndMerge({
        pull_number: danger.github.pr.number,
        repo: danger.github.pr.base.repo.name,
        owner: danger.github.pr.base.repo.owner.login,
      });
    }
  } catch (e) {
    console.log(e);
  }
}

export default async () => {
  await mergeOnGreen();
};
