import React, { useEffect } from "react";
import qs from "query-string";

import * as styles from "./auth-redirect.module.scss";

export default function AuthRedirect({ location, navigate }) {
  // Get the code set as the token in the query params from googleAccessToken function.
  const query = qs.parse(location?.search);

  useEffect(() => {
    if (typeof window !== `undefined`) {
      window.localStorage.setItem(`google:tokens`, query.token);
    }

    // After setting token in localStorage, go to app homepage.
    setTimeout(() => {
      window.location.assign("/app/");
    }, 1000);
  });

  return (
    <p className={styles.message}>
      Saving Google token info to local storage...
    </p>
  );
}
