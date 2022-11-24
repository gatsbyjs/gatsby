# format-stale-output

Format the output of actions/stale into something you can pass to pullreminders/slack-action as blocks.

## Inputs

### `staled-issues-prs`

Comes from [actions/stale](https://github.com/actions/stale).

### `closed-issues-prs`

Comes from [actions/stale](https://github.com/actions/stale).

## Outputs

### `blocks`

Something you can directly pass to [pullreminders/slackaction](https://github.com/abinoda/slack-action) like:

```yaml
- name: Slack Report Closed Issues
  uses: pullreminders/slack-action@v1.0.7
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_TOKEN }}
  with:
    args: '{\"channel\": \"${{ secrets.SLACK_STALE_CHANNEL_ID }}\", \"text\": \"\", \"blocks\": ${{ steps.format-stale-output.outputs.blocks }} }'
```

## Example Usage

```yaml
name: Stale Bot
on:
  schedule:
    - cron: "0 */12 * * *"
jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v4
        name: stale
        id: stale
        with:
          days-before-stale: 20
          days-before-close: 40
      - name: Format Stale Output
        id: format-stale-output
        uses: ./.github/actions/format-stale-output
        with:
          staled-issues-prs: ${{ steps.stale.outputs.staled-issues-prs }}
          closed-issues-prs: ${{ steps.stale.outputs.closed-issues-prs }}
      - name: Slack Report Closed Issues
        uses: pullreminders/slack-action@v1.0.7
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_TOKEN }}
        with:
          args: '{\"channel\": \"${{ secrets.SLACK_STALE_CHANNEL_ID }}\", \"text\": \"\", \"blocks\": ${{ steps.format-stale-output.outputs.blocks }} }'
```

## Building this Action

Use [`@vercel/ncc`](https://github.com/vercel/ncc) to compile this action. You can run `npm run build` in this directory to run the command.
