# Product Search Quickstart: React InstantSearch + TypeScript

This repo is a small product-search app built with React InstantSearch and TypeScript.
For more information, see [Build your first search experience](https://www.algolia.com/doc/guides/get-started/quickstart).

## Requirements

- Node.js 20 or later

## Run this app

Run the following commands to download the quickstart code, connect it to your Algolia account, index the sample products, and start a local preview of this app.

1. Download the quickstart code from GitHub:

   ```sh
   npx gitpick algolia/quickstarts/tree/main/product-search-react-typescript
   ```

1. Install dependencies:

   ```sh
   npm install
   ```

1. Create an Algolia application ([Create one for free](https://www.algolia.com/users/sign_up)).

1. Copy `.env.example` to `.env.local`.
   (This file contains secrets, don't expose it or commit it to GitHub.)

1. Add your application ID and API keys from [the dashboard](https://dashboard.algolia.com/account/api-keys):

   ```sh
   VITE_ALGOLIA_APPLICATION_ID=your_application_id
   VITE_ALGOLIA_SEARCH_API_KEY=your_search_only_api_key
   ALGOLIA_WRITE_API_KEY=your_write_api_key
   ```

   > [!WARNING]
   > `ALGOLIA_WRITE_API_KEY` has write access to your Algolia app.
   > Treat it as a secret and don't expose it in client code, or on GitHub.

1. Index the sample products into your Algolia application:

   ```sh
   npm run index:products
   ```

1. Start the development server:

   ```sh
   npm run dev
   ```

1. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Customize

- Add more facets by updating `attributesForFaceting` in `scripts/indexing.ts`,
  then adding more refinement widgets in `src/App.tsx`.

## Use your own data

This quickstart indexes a sample product dataset into your Algolia application.
To use a different dataset, update `scripts/indexing.ts` and run:

```sh
npm run index:products
```

Make sure to adjust the UI (`ProductRecord`) to match.

