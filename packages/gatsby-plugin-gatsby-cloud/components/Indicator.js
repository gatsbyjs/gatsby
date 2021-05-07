"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = Indicator;

var _react = _interopRequireWildcard(require("react"));

var _getBuildInfo = _interopRequireDefault(require("../utils/getBuildInfo"));

var _Style = _interopRequireDefault(require("./Style"));

var _GatsbyIndicatorButton = _interopRequireDefault(require("./GatsbyIndicatorButton"));

var _LinkIndicatorButton = _interopRequireDefault(require("./LinkIndicatorButton"));

var _InfoIndicatorButton = _interopRequireDefault(require("./InfoIndicatorButton"));

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL || 3000;

function Indicator({
  children
}) {
  const [buildInfo, setBuildInfo] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    const prettyUrlRegex = /^preview-/;
    const host = window.location.hostname;
    let buildId;

    try {
      const poll = setInterval(async () => {
        // currentBuild is the most recent build that is not QUEUED.
        // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
        const isOnPrettyUrl = prettyUrlRegex.test(host);
        const {
          siteInfo,
          currentBuild,
          latestBuild
        } = await (0, _getBuildInfo.default)();
        console.log(currentBuild, latestBuild, siteInfo); // buildId = "b4ac0f53-63ce-405c-ab78-90f7dada0dd8"

        if (!buildId) {
          if (isOnPrettyUrl) {
            buildId = latestBuild === null || latestBuild === void 0 ? void 0 : latestBuild.id;
          } else {
            const buildIdMatch = host.match(/build-(.*?(?=\.))/);
            buildId = buildIdMatch && buildIdMatch[1];
          }
        }

        const defaultBuildInfo = {
          createdAt: currentBuild === null || currentBuild === void 0 ? void 0 : currentBuild.createdAt,
          orgId: siteInfo === null || siteInfo === void 0 ? void 0 : siteInfo.orgId,
          siteId: siteInfo === null || siteInfo === void 0 ? void 0 : siteInfo.siteId,
          buildId,
          isOnPrettyUrl,
          sitePrefix: siteInfo === null || siteInfo === void 0 ? void 0 : siteInfo.sitePrefix
        };

        if ((currentBuild === null || currentBuild === void 0 ? void 0 : currentBuild.buildStatus) === `BUILDING`) {
          setBuildInfo({
            status: 'BUILDING',
            ...defaultBuildInfo
          });
        } else if ((currentBuild === null || currentBuild === void 0 ? void 0 : currentBuild.buildStatus) === `ERROR`) {
          setBuildInfo({
            status: 'ERROR',
            ...defaultBuildInfo
          });
        } else if (buildId === (currentBuild === null || currentBuild === void 0 ? void 0 : currentBuild.id)) {
          setBuildInfo({
            status: 'UPTODATE',
            ...defaultBuildInfo
          });
        } else if (buildId !== (latestBuild === null || latestBuild === void 0 ? void 0 : latestBuild.id) && (latestBuild === null || latestBuild === void 0 ? void 0 : latestBuild.buildStatus) === `SUCCESS`) {
          setBuildInfo({
            status: 'SUCCESS',
            ...defaultBuildInfo
          });
        }
      }, process.env.NODE_ENV === `test` ? 10 : POLLING_INTERVAL);
      return function cleanup() {
        clearInterval(poll);
      };
    } catch (e) {
      console.log(e);
    }
  });
  console.log(buildInfo);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Style.default, null), /*#__PURE__*/_react.default.createElement("div", {
    "data-testid": "preview-status-indicator",
    "data-gatsby-preview-indicator": "root",
    "aria-live": "assertive"
  }, /*#__PURE__*/_react.default.createElement(_GatsbyIndicatorButton.default, buildInfo), /*#__PURE__*/_react.default.createElement(_LinkIndicatorButton.default, buildInfo), /*#__PURE__*/_react.default.createElement(_InfoIndicatorButton.default, buildInfo)), children);
}