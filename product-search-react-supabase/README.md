# Product Search Quickstart: React InstantSearch + Supabase

A minimal [Vite](https://vite.dev) + React starter for instant, typo-tolerant search over
Postgres data. [Supabase](https://supabase.com) stores the products,
[Algolia](https://www.algolia.com) searches them, and the
[Algolia Supabase connector](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/connectors/supabase)
keeps the index in sync — no sync code in the app.

This is the deployable companion to the connector quickstart: finish the quickstart, click
Deploy, and search runs over your own data.

## Deploy your own

The button installs both integrations on your new project — Supabase provisions a Postgres
database, Algolia provisions an application — and injects their environment variables.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?project-name=product-search-react-supabase&repository-name=product-search-react-supabase&repository-url=https%3A%2F%2Fgithub.com%2Falgolia%2Fquickstarts%2Ftree%2Fmain%2Fproduct-search-react-supabase&products=%255B%257B%2522type%2522%253A%2522integration%2522%252C%2522protocol%2522%253A%2522other%2522%252C%2522productSlug%2522%253A%2522application%2522%252C%2522integrationSlug%2522%253A%2522algolia%2522%257D%252C%257B%2522type%2522%253A%2522integration%2522%252C%2522protocol%2522%253A%2522storage%2522%252C%2522productSlug%2522%253A%2522supabase%2522%252C%2522integrationSlug%2522%253A%2522supabase%2522%257D%255D)

While provisioning, Supabase asks for a public environment variable prefix. Pick
`VITE_PUBLIC_` to match this template's framework — though nothing here reads Supabase from
the browser, so the choice makes no practical difference.

The first deploy succeeds, but the search box returns nothing — the Algolia index does not
exist until you finish the three steps below. Credentials are already wired up at this
point; there is just no data to search.

## Load the data into Supabase

Open Supabase from your Vercel project's integration page. Download the
[Algolia apparel sample data](https://raw.githubusercontent.com/algolia/quickstarts/main/sample-data/apparel.csv)
(1,000 products) and import it via **Table Editor** → **Insert** → **Import data from
CSV**. Name the table `apparel`, and select `objectID` as the primary key — the connector
requires it.

The importer creates the table and infers the column types, so there is no schema to run.

## Connect Algolia

Create the connector from the Algolia dashboard → **Data sources** → **Connectors** →
**Supabase**:

1. **Connect Supabase** — connect directly to prefill the database values.
2. **Transformation** — paste [`demo/transform.js`](demo/transform.js) into the wizard's
   transformation editor. Grab it as
   [raw text](https://raw.githubusercontent.com/algolia/quickstarts/main/product-search-react-supabase/demo/transform.js)
   to copy it cleanly. It passes each record through and **derives `price_range` from
   `price`** — a transformation can compute fields, not just strip them. Check the preview:
   `price_range` should be present with a value like `$25 to $49`.
3. **Destination** — set the index name to `quickstart-products`. If you use a different
   name, set `VITE_ALGOLIA_INDEX_NAME` in your Vercel project settings to match.
4. **Task** — choose **Full reindexing**, select the `apparel` table, then create the
   task. Creating it does not sync anything: run the task to trigger the first
   sync. Add a schedule if you want recurring syncs after that.

Refresh the browser, and search is live, but not the filters.

## Configure the index

The index needs four settings. The search UI reads all of them, and the first two fail
silently if unset. Any route below works — then refresh the page.

### Either: one API call

Nothing to install. Copy `ALGOLIA_APP_ID` and `ALGOLIA_WRITE_API_KEY` from **Environment
Variables** in your Vercel project's left-hand menu, set them in your shell, then paste this
as-is:

```bash
export ALGOLIA_APP_ID=...
export ALGOLIA_WRITE_API_KEY=...

curl -X PUT "https://$ALGOLIA_APP_ID.algolia.net/1/indexes/quickstart-products/settings" \
  -H "X-Algolia-API-Key: $ALGOLIA_WRITE_API_KEY" \
  -H "X-Algolia-Application-Id: $ALGOLIA_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "attributesForFaceting": ["product_type", "price_range"],
    "attributesToSnippet": ["description:30"],
    "searchableAttributes": ["unordered(title)", "unordered(product_type)", "unordered(description)"],
    "customRanking": ["desc(units_sold)", "desc(price)"]
  }'
```

A successful call returns `{"updatedAt":...,"taskID":...}`. A DNS error means the variables
are not set in the shell you pasted into.

### Or: the Algolia dashboard

Open Algolia from your Vercel project's integration page, then on index
`quickstart-products`:

| Setting | Dashboard location | Value | If unset |
| --- | --- | --- | --- |
| `attributesForFaceting` | **Configuration** → **Facets** | `product_type`, `price_range` | Sidebar filters render empty |
| `attributesToSnippet` | **Configuration** → **Snippeting** | `description`, length `30` | Every card shows no description |
| `searchableAttributes` | **Configuration** → **Searchable attributes** | `title`, `product_type`, `description`; leave the ordering dropdown on its **Unordered** default | Defaults to all attributes |
| `customRanking` | **Configuration** → **Ranking and Sorting** | add `units_sold`, then `price`; set each to **Descending** in the dropdown beside it | Popular products no longer surface first |

### Or: the configure-index script

Only if you already have a local checkout — see [Local development](#local-development) for
`gitpick` and pulling credentials. Needs `ALGOLIA_WRITE_API_KEY` in `.env.local`.

```bash
npm run configure:index
```

[`scripts/configure-index.ts`](scripts/configure-index.ts) applies all four settings in one
call. It never writes records — the connector supplies those, and its transformation derives
`price_range`, which no index setting can produce on its own.

### Then refresh

No redeploy is needed — the credentials and index name are already in the built bundle, and
only the index changed.

## Local development

Requires Node.js 22 or later.

```bash
npx gitpick algolia/quickstarts/tree/main/product-search-react-supabase
cd product-search-react-supabase
npm install
```

Then get credentials into `.env.local`, either way:

**From the CLI** — pulls them from the project you deployed:

```bash
npx vercel link
npx vercel env pull .env.local
```

**From the dashboard** — no CLI needed. Open **Environment Variables** in your Vercel
project's left-hand menu and reveal these:

| Variable | Needed for |
| --- | --- |
| `ALGOLIA_APP_ID` | the search UI |
| `ALGOLIA_SEARCH_API_KEY` | the search UI |
| `ALGOLIA_WRITE_API_KEY` | `npm run configure:index`; the app itself never reads it |

Paste them into `.env.local` as-is. There is no need to rename anything to `VITE_` — the
app accepts either shape. (`vercel env pull` brings all three down, plus `POSTGRES_URL`,
which nothing here reads.)

Then:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## How it works

The Algolia integration injects three bare variables: `ALGOLIA_APP_ID`,
`ALGOLIA_SEARCH_API_KEY` and `ALGOLIA_WRITE_API_KEY`. Vite only exposes
`VITE_`-prefixed variables to the browser, so [`vite.config.ts`](vite.config.ts) maps the
two public ones onto `VITE_` names. The write key is never mapped.

| Variable                      | Purpose                              | Browser-safe?                                          |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------ |
| `VITE_ALGOLIA_APPLICATION_ID` | Identifies your Algolia application  | ✅ inlined into the bundle                              |
| `VITE_ALGOLIA_SEARCH_API_KEY` | Search key used by the frontend      | ✅ inlined into the bundle                              |
| `VITE_ALGOLIA_INDEX_NAME`     | Optional index override              | ✅ already `VITE_`-prefixed, so no mapping needed       |
| `ALGOLIA_WRITE_API_KEY`       | Indexing key                         | ❌ injected on Vercel, never mapped, never read by the app |
| `POSTGRES_URL`                | Supabase connection string           | ❌ never mapped; the frontend never reads Postgres       |

⚠️ Anything mapped onto `import.meta.env` is inlined into public JavaScript. Never add
`ALGOLIA_WRITE_API_KEY` or `POSTGRES_URL` to the `define` block in `vite.config.ts` — the
integration does inject the write key into the build environment, so it is right there to
be leaked.

The search key the integration provisions is scoped to the whole application rather than
this one index. That is fine for sample data, but if you point this template at an Algolia
application that also holds real data, create a key restricted to `search` on
`quickstart-products` and set it as `VITE_ALGOLIA_SEARCH_API_KEY` in your Vercel project —
it overrides the injected value.

Key files:

- [`src/App.tsx`](src/App.tsx) — the InstantSearch UI (`algoliasearch` lite client)
- [`vite.config.ts`](vite.config.ts) — maps the injected Algolia values onto `VITE_` names
- [`demo/transform.js`](demo/transform.js) — canonical copy of the dashboard transformation
- [`scripts/configure-index.ts`](scripts/configure-index.ts) — applies the index settings

## Going to production

- Add authentication before exposing any write path — this template is read-only.
- Enable incremental sync with a soft-delete column so removals propagate to the index.
- Trigger the connector task from the [Ingestion API](https://www.algolia.com/doc/rest-api/ingestion/)
  as a server-side extension instead of the dashboard schedule.

## License

[MIT](https://github.com/algolia/quickstarts/blob/main/LICENSE)
