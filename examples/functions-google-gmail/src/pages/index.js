import React, { useState } from "react";
import "./index.css";
import { useGoogleLogin } from 'react-use-googlelogin'
const axios = require("axios");

const IndexPage = () => {
  const [labels, setLabels] = useState([]);

  const { signIn, signOut, googleUser, isSignedIn } = useGoogleLogin({
    clientId: process.env.GATSBY_GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/gmail.readonly",
  })

  function getLabelsBox(labels) {
    var labelsMsg = [];

    labelsMsg.push(
      <div>
        <p></p>
      </div>
    );
    labels.forEach((label) => {
      labelsMsg.push(<div>- {label}</div>);
    });

    return labelsMsg;
  }

  function signOutSteps() {
    setLabels([])
    signOut();
  }

  function fetchLabels(user) {
    const token = user?.accessToken
    const id = user.googleId
    if (token != null) {

      axios
        .get("/api/labels", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            authorization: "Bearer " + token,
            id
          },
        })
        .then((response) => {
          setLabels(response.data.labels);
        });
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={signIn} style={{ marginRight: '1rem' }}>
        Sign in
      </button>
      <button onClick={() => signOutSteps()}>Sign Out</button>

      {isSignedIn && (
        <div>
          <h1><img width='25px' src={googleUser.profileObj.imageUrl} alt="Avatar." /> {googleUser.profileObj.name}</h1>
          <button onClick={() => fetchLabels(googleUser)}>Fetch Labels</button>
          {getLabelsBox(labels)}
        </div>
      )}
    </div>
  )
}

export default IndexPage