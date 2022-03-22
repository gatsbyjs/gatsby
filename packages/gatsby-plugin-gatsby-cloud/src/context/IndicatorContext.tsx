import React, { createContext, useState, useMemo, FC } from "react";
import { differenceInDays } from "date-fns";
import Cookies from "js-cookie";
import {
  FEEDBACK_COOKIE_NAME,
  DAYS_BEFORE_FEEDBACK,
  INTERACTION_COOKIE_NAME,
  INTERACTIONS_BEFORE_FEEDBACK,
} from "../constants";
import { BuildInfo, ContentSyncInfo, ManifestInfo, TrackEventProps } from "../models/interfaces";
import { BuildStatus } from "../models/enums";

interface IIndicatorContext {
  isOnPrettyUrl: boolean;
  currentBuildId?: string | null;
  currentBuildStatus?: BuildStatus | null;
  cookies: { [key: string]: string };
  buildInfo?: BuildInfo | null;
  contentSyncInfo?: ContentSyncInfo | null;
  manifestInfo?: ManifestInfo | null;
  askForFeedback?: boolean;
  showFeedback?: boolean;
  usingContentSync?: boolean;
  checkForFeedback: () => void;
  trackEvent: (info: TrackEventProps) => void;
  setCookie: (name: string, value: string) => void;
  getCookie: (name: string) => string;
  removeCookie: (name: string) => void;
  setCurrentBuildStatus: (status: BuildStatus) => void;
  setBuildInfo: (info: BuildInfo | null) => void;
  setContentSyncInfo: (info: ContentSyncInfo | null) => void;
  setManifestInfo: (info: ManifestInfo | null) => void;
}

const isOnPrettyUrl = /^preview-/.test(window.location.hostname);

const defaultState: IIndicatorContext = {
  isOnPrettyUrl,
  cookies: Cookies.get(),
  checkForFeedback: (): void => {},
  trackEvent: (): void => {},
  setCookie: (): void => {},
  getCookie: (): string => ``,
  removeCookie: (): void => {},
  setCurrentBuildStatus: (): void => {},
  setBuildInfo: (): void => {},
  setContentSyncInfo: (): void => {},
  setManifestInfo: (): void => {},
};

const IndicatorContext = createContext<IIndicatorContext>(defaultState);

const IndicatorProvider: FC = ({ children }) => {
  const rootDomain = window.location.hostname.split(`.`).reverse().splice(0, 2).reverse().join(`.`);
  const [cookies, setCookies] = useState(defaultState.cookies);
  const [askForFeedback, setAskForFeedback] = useState(false);
  const [currentBuildStatus, setCurrentBuildStatusData] = useState<BuildStatus | null>(null);
  const [buildInfo, setBuildData] = useState<BuildInfo | null>(null);
  const [contentSyncInfo, setContentSyncData] = useState<ContentSyncInfo | null>(null);
  const [manifestInfo, setManifestData] = useState<ManifestInfo | null>(null);
  const interactionCount = useMemo(
    () => (!!cookies[INTERACTION_COOKIE_NAME] ? parseInt(cookies[INTERACTION_COOKIE_NAME]) : 0),
    [cookies[INTERACTION_COOKIE_NAME]]
  );
  const showFeedback = useMemo(
    () => askForFeedback && interactionCount > INTERACTIONS_BEFORE_FEEDBACK,
    [askForFeedback, interactionCount]
  );
  const currentBuildId = useMemo(() => {
    const host = window.location.hostname;
    if (isOnPrettyUrl || host === `localhost`) {
      return buildInfo?.latestBuild?.id;
    } else {
      // Match UUID from preview build URL https://build-af44185e-b8e5-11eb-8529-0242ac130003.gtsb.io
      const buildIdMatch = host.match(/build-(.*?(?=\.))/);
      if (buildIdMatch) {
        return buildIdMatch[1];
      }
      return null;
    }
  }, [buildInfo?.latestBuild?.id]);
  const usingContentSync = useMemo(() => !!contentSyncInfo, [contentSyncInfo]);

  // cookie methods
  const setCookie = (name: string, value: string): void => {
    Cookies.set(name, value, {
      domain: rootDomain,
    });
    const newValue = { [`${name}`]: value };
    setCookies(newValue);
  };

  const getCookie = (name: string): string => Cookies.get(name);

  const removeCookie = (name: string): void => {
    Cookies.remove(name, { domain: rootDomain });
    if (name in cookies) {
      delete cookies[name];
      setCookies(cookies);
    }
  };

  // buildInfo methods
  const setBuildInfo = (info: BuildInfo | null): void => {
    setBuildData(info);
  };

  const setCurrentBuildStatus = (status: BuildStatus | null): void => {
    setCurrentBuildStatusData(status);
  };

  // contentSyncInfo methods
  const setContentSyncInfo = (info: ContentSyncInfo | null): void => {
    setContentSyncData(info);
  };

  // manifestInfo methods
  const setManifestInfo = (info: ManifestInfo | null): void => {
    setManifestData(info);
  };

  // feedback methods
  const checkForFeedback = (): void => {
    const lastFeedback = getCookie(FEEDBACK_COOKIE_NAME);
    if (lastFeedback) {
      const lastFeedbackDate = new Date(lastFeedback);
      const now = new Date();
      const diffInDays = differenceInDays(now, lastFeedbackDate);
      const askForFeedback = diffInDays >= DAYS_BEFORE_FEEDBACK;
      setAskForFeedback(askForFeedback);
    } else {
      setAskForFeedback(true);
    }
  };

  // track event methods
  const trackEvent = async ({ eventType, name }: TrackEventProps): Promise<void> => {
    checkForFeedback();
    if (askForFeedback) {
      const interactions = isNaN(parseInt(getCookie(INTERACTION_COOKIE_NAME)))
        ? 0
        : parseInt(getCookie(INTERACTION_COOKIE_NAME));
      setCookie(INTERACTION_COOKIE_NAME, `${interactions + 1}`);
    }
    if (process.env.GATSBY_TELEMETRY_API) {
      try {
        const body = {
          time: new Date(),
          eventType,
          componentId: `gatsby-plugin-gatsby-cloud_preview-indicator`,
          version: 1,
          componentVersion: process.env.GATSBY_PREVIEW_UI_APP_VERSION || `4.11.0-next.0`,
          organizationId: buildInfo?.siteInfo?.orgId,
          siteId: buildInfo?.siteInfo?.siteId,
          buildId: currentBuildId,
          name,
        };

        await fetch(process.env.GATSBY_TELEMETRY_API, {
          mode: `cors`,
          method: `POST`,
          headers: {
            "Content-Type": `application/json`,
          },
          body: JSON.stringify(body),
        });
      } catch (e) {
        console.log(e, e.message);
      }
    }
  };

  return (
    <IndicatorContext.Provider
      value={{
        isOnPrettyUrl,
        currentBuildId,
        cookies,
        askForFeedback,
        showFeedback,
        buildInfo,
        contentSyncInfo,
        manifestInfo,
        currentBuildStatus,
        usingContentSync,
        checkForFeedback,
        trackEvent,
        setCookie,
        getCookie,
        removeCookie,
        setCurrentBuildStatus,
        setBuildInfo,
        setContentSyncInfo,
        setManifestInfo,
      }}
    >
      {children}
    </IndicatorContext.Provider>
  );
};

export default IndicatorContext;
export { IndicatorProvider };
