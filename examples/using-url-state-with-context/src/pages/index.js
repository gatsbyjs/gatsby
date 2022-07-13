import * as React from "react";

import Layout from "../components/layout";
import Seo from "../components/seo";
import SearchForm from "../components/SearchForm";
import * as styles from "../components/index.module.css";

const IndexPage = props => {
  return (
    <Layout>
      <Seo title="Home" />
      <div className={styles.textCenter}>
        <h1>
          Welcome to <b>Gatsby!</b>
        </h1>
        <p className={styles.intro}>
          <b>Example Url-state</b> <br />
        </p>
        <SearchForm />
      </div>
    </Layout>
  );
};

export default IndexPage;
