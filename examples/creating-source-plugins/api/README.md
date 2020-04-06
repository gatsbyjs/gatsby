# Simple GraphQL Server Example

[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/risan/simple-graphql-server-example)
[![License](https://img.shields.io/github/license/risan/simple-graphql-server-example.svg)](https://github.com/risan/simple-graphql-server-example/blob/master/LICENSE.md)

A simple GraphQL server example with in-memory data. Powered by [graphql-yoga](https://github.com/graphcool/graphql-yoga) 🧘.

Checkout the [GraphQL playground demo](https://general-repair.glitch.me/).

![GraphQL Playground](https://res.cloudinary.com/risan/image/upload/v1523218704/simple-graphql-server-example_utvh2a.png)

> ⚠️ This example is using in-memory data
>
> Note that this example is for learning purpose and it's using in-memory data. It means the data will be loss on every server restart.

## Requirements

The following items are required to run this application:

- [Node.js](https://nodejs.org) version 8 or higher

## Installation

### 1. Clone the Repository

Clone this repository to your computer:

```shell
$ git clone git@github.com:risan/simple-graphql-server-example.git
```

### 2. Install the Dependencies

On your terminal, go to the project directory and install all of the required dependencies:

```shell
# Go to the project directory.
$ cd simple-graphql-server-example

# Install all of the dependencies.
$ npm install

# Or if you prefer to use Yarn.
$ yarn install
```

### 3. Configure the Port (Optional)

By default this application will be run at port `4000`. If you want to change this default port, copy the `.env.example` first:

```shell
cp .env.example .env
```

Open the `.env` file and set the `PORT` where the application will be running.

```
PORT=4000
```

### 4. Run the application 🎉

To run the application type the following command:

```shell
npm run start

# Or if you prefer to use Yarn
yarn start
```

Once it's started, visit the application with your browser (default address at [localhost:4000](http://localhost:4000)). You should see the GraphQL playground.

## License

MIT © [Risan Bagja Pradana](https://risan.io)
