FROM node:10-slim

LABEL com.github.actions.name="Gatsby Lint Reporter"
LABEL com.github.actions.description="Reports lint errors inline in PRs"
LABEL com.github.actions.icon="code"
LABEL com.github.actions.color="yellow"

COPY src /action/src
ENTRYPOINT ["/action/src/entrypoint.sh"]
