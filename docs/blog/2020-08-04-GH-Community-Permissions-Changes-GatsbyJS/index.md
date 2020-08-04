---
title: "Changes Coming to Community Permissions in Gatsby's GitHub Repo"
date: 2020-08-04
author: "Mikhail Novikov"
excerpt: "On August 12th we will be making changes to community permissions in the GatsbyJS open source repo. Here's what will be happening, and why -- plus announcing some new community programs and contributor opportunities."
tags: ["community", "open-source"]
---

## TL;DR

On **August 12th** we will be removing the Maintainers team from the GatsbyJS organization on GitHub. All members of this team, as well as all future Gatsby community contributors, will have their status set as "Outside Collaborators" on the GatsbyJS monorepo. All essential capabilities -- forking the repo, submitting issues and PRs, etc. -- will still be open for community members. However, a few capabilities previously held by organization members -- deleting or editing other contributors' PRs, issues, and comments; creating branches in the monorepo; requesting PR reviews through GitHub -- will no longer be available.

These changes will ultimately help the Core team manage Gatsby's ecosystem more efficiently and sustainably. It will also help us ensure that the community is an inclusive space with fewer opportunities for community members to take actions that could accidentally or intentionally violate our Code of Conduct.

---

There are changes coming to community permissions and access to the Gatsby open source monorepo on GitHub. They will going into effect on August 12th. To understand what will be happening and why, please make sure to read this document carefully. We'll be covering...

- What changes are being made

- Why we're making these changes

- How this will impact the community/contributing to Gatsby

- What's next for the community

## What changes are being made?

**These changes will take effect on Wednesday, August 12th by 12 pm ET/9am PT.**

1. The Maintainers team in the GatsbyJS organization on GitHub will be removed.

2. Members of the Maintainers team will have their status changed to "[Outside Collaborator](https://docs.github.com/en/github/getting-started-with-github/github-glossary#outside-collaborator)" and will no longer be part of the GatsbyJS organization in GitHub. Their [repository access level](https://docs.github.com/en/github/setting-up-and-managing-organizations-and-teams/repository-permission-levels-for-an-organization#repository-access-for-each-permission-level) will, in turn, change from "Write" to "Read".

3. Future community contributors will also be given Outside Collaborator status with Read access.

**These changes are not as scary as they sound, we promise!** Read more details about the actual effects of this status change, and the reasons why it is being done to greatly improve everyone's contributor experience, in the community impact section below.

## Why are we making changes to community permissions and access?

There are a few reasons we need to make these changes, including scalability, security, and providing a better community experience.

### Scalability

As the Gatsby community has grown, the Gatsby core team and open source project have also grown in size and complexity. Managing Gatsby open source in a sustainable and scalable way now requires more sophisticated processes and tools, which in turn require clearly defined roles and delegation of tasks.

The current permissions structure has resulted in the Gatsby Core Team receiving an unmanageable number of notifications from GitHub, mislabeled issues and PRs. It has also been a barrier to adopting tools that help automate issue triage and other tasks.

### Community Experience

As things currently stand, anyone and everyone who contributes to Gatsby open source automatically receives maintainer status, giving them "write" access to actions like:

- Assigning issues

- Deleting other contributors' issues and pull requests

- Creating and canceling workflows

- Plus other capabilities that would typically be reserved for an open source project's core team

**These are powerful actions that could, either accidentally or intentionally, be used in a way that harms other community members** and should therefore be reserved for community moderators rather than community members.

Additionally, with the improvements that can be made on the DevOps side of Gatsby open source, the Core Team will be able to manage the monorepo more effectively. Greatly reducing the flood of GH notifications to be triaged and handled means the Core Team will have more time to spend actually engaging with the community.

### Security

Finally, the Gatsby organization in GitHub has yet to adopt two-factor authentication for organization members. [This is a significant security risk.](https://www.wired.com/story/protect-accounts-two-factor-authentication/) Once 2FA is enabled, it will remove everyone from the organization who does not have 2FA on their own GitHub account. With the change in access levels, the GatsbyJS organization will be limited to Gatsby employees, and they will be the only ones affected by the addition of 2FA. **Community contributors will still be able to submit issues, PRs, make comments, etc. regardless of whether or not they use 2FA**.

## How will this impact the community/contributing to Gatsby?

The impact on the community should be minimal, though the changes will require some adjusting to. We recommend reviewing GitHub's breakdown of ["Repository access for each permission level"](https://docs.github.com/en/github/setting-up-and-managing-organizations-and-teams/repository-permission-levels-for-an-organization#repository-access-for-each-permission-level) to see a specific list of available actions. As we mentioned earlier, contributors' access will be changing from "Write" access to "Read" access.

You will still be able to...

- Open issues and pull requests

- Close your own issues and PRs

- Comment on issues and PRs, and manage your comments

- Have issues assigned to you

- Fork the Gatsby repo

- Include "Gatsby contributor" on your résumé and LinkedIn profile

These are the overwhelming majority of actions performed by community contributors.

Most of the actions that will no longer be available are rarely used by community members, and/or should not be used by community members (e.g. assigning PRs, editing and deleting another contributor's comments, etc.). A couple of actions you may miss are:

- Applying labels to PRs and issues

- Requesting PR reviews

- Creating branches in the GitHub monorepo, as opposed to a fork

The fact that these capabilities are currently available to all community contributors is extremely unusual for an open source project of Gatsby's size -- and furthermore introduces a great deal of risk to the security, integrity, and inclusiveness of our open source tools.

The good news is labeling will now be automated with Gatsbot, and with the status change there will be fewer barriers and distractions to get in the way of improving our PR process.

### Maintainer Status

Unfortunately, one of the consequences of this change is that you will no longer have Gatsby Maintainer status in your GitHub profile. We've tried to find a way to let you keep this status, but there's no way to do it without including every contributor in the organization. We know this status holds real meaning for many members of the community, and we're very sorry to have to take that status away. Please know that your contributions are deeply valued and appreciated, and we hope that you continue to be part of the Gatsby community.

**If you have any questions or concerns, please do not hesitate to reach out to us on [Twitter](https://twitter.com/AskGatsbyJS), [Discord](https://gatsby.dev/discord), and [GitHub](https://github.com/gatsbyjs/gatsby).**

All of that said, we didn't want to take anything away without offering new ways for our amazing contributors to be recognized and appreciated. So we have some exciting new plans and opportunities for the community to announce.

## What's next for the community?

So many things! Although you can still do all the core things as a GitHub contributor, we have more ways for you to show off your Gatsby status and contributions right now!

### New online community platform - early access coming soon!

We're in the early stages of building an online platform for Gatsby contributors and community members to ask questions, share their projects, connect with other Gatsby enthusiasts, and more. We're partnering with the Dev.to team to build the Gatsby online community with [Forem](https://www.forem.com/). **Anyone currently on the Maintainers team will be invited for special early access to the platform in September to try it out and help make sure we've built a platform worthy of this community.** We're also putting together some special swag items for everyone on the Maintainers list, so stay tuned for announcements.

### Gatsby Ambassador Program

Later in the fall, we will officially launch our Gatsby Ambassador program and open it up for public applications. The Ambassador program, currently in a trial pilot mode, is for community members who want to take their work in the Gatsby community a step further to become Gatsby experts and community leaders.

### Office Hours on Twitch

We will also continue to offer weekly office hours sessions on [the Gatsby Twitch channel](https://www.twitch.tv/gatsbyjs) on Thursdays at 2 pm ET/11 am PT. We encourage you to join us, bring your questions, and let us know what you'd like to see us cover in future office hours sessions.
