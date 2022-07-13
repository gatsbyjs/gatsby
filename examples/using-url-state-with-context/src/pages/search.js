import * as React from "react";
import { Link } from "gatsby";
import SearchForm from "../components/SearchForm";
import Layout from "../components/layout";
import Seo from "../components/seo";

const SecondPage = () => {
  return (
    <Layout>
      <Seo title="SearchPage" />
      <h1>Hi from the second page</h1>
      <p>Submit will remain the state at context level</p>
      <SearchForm />
      <div
        style={{
          marginTop: `var(--space-5)`,
          fontSize: `var(--font-m)`,
        }}
      >
        <Link to="/">Go back to the homepage (try with & without submit)</Link>

        <div>
          <Link to="/?demoCheckbox=true&demoDropdown=c&demoRange=100&demoTXT=demoOtherTxt&utm_source=searchPage">
            Home page with diffrent query params{" "}
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default SecondPage;
