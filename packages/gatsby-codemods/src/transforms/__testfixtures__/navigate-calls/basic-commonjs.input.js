/* eslint-disable */
const React = require('react');
const { navigateTo } = require('gatsby-link');

export default function Example() {
  return <button onClick={() => navigateTo('/sample')}>waddup</button>;
}
