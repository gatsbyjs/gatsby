# React 19 Compatibility Test

This directory contains end-to-end tests to verify Gatsby's compatibility with React 19.

## Running the Tests

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the tests:
   ```bash
   npm test
   ```

## Test Cases

1. **Development Server**

   - Verifies that the development server starts with React 19
   - Tests React 19 state updates and hooks
   - Tests error boundaries with React 19

2. **Production Build**
   - Verifies that the production build completes successfully with React 19
   - Checks for the existence of expected output files

## Dependencies

- React 19.0.0 or later
- React DOM 19.0.0 or later
- Gatsby (linked to local development version)
