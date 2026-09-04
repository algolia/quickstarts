import { liteClient as algoliasearch } from "algoliasearch/lite";
import type { Hit } from "instantsearch.js";
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  PoweredBy,
  RefinementList,
  SearchBox,
  Snippet,
} from "react-instantsearch";
import "instantsearch.css/themes/reset-min.css";
import "./App.css";

// The connector's destination index. The Algolia integration cannot inject this, because
// the index does not exist until the connector task runs -- so it defaults instead of
// being required. Set VITE_ALGOLIA_INDEX_NAME to override.
const DEFAULT_INDEX_NAME = "quickstart-products";

// price_range is derived by the connector transformation, not stored in Supabase.
// Facet values sort by count by default, which scrambles the buckets.
const PRICE_RANGE_ORDER = [
  "Under $25",
  "$25 to $49",
  "$50 to $99",
  "$100 and up",
];

const appId = import.meta.env.VITE_ALGOLIA_APPLICATION_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME || DEFAULT_INDEX_NAME;

const missingEnv: string[] = [];
if (!appId) missingEnv.push("VITE_ALGOLIA_APPLICATION_ID");
if (!apiKey) missingEnv.push("VITE_ALGOLIA_SEARCH_API_KEY");

const searchClient =
  missingEnv.length === 0 ? algoliasearch(appId, apiKey) : null;

type ProductRecord = {
  title: string;
  description: string;
  product_type: string;
  price: number;
  showcase_image: string;
};

type ProductHit = Hit<ProductRecord>;

function MissingConfig({ missing }: { missing: string[] }) {
  return (
    <section className="config-notice">
      <h1 className="config-notice-title">Search is not configured yet</h1>
      <p className="config-notice-body">
        {missing.length === 1
          ? "This environment variable is missing:"
          : "These environment variables are missing:"}
      </p>
      <ul className="config-notice-list">
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p className="config-notice-body">
        Locally, copy <code>.env.example</code> to <code>.env.local</code> and fill
        it in, or run <code>vercel env pull .env.local</code>. On Vercel, check that
        the Algolia integration is installed on this project.
      </p>
    </section>
  );
}

function ProductCard({ hit }: { hit: ProductHit }) {
  return (
    <article className="product-card">
      <div className="product-card-image">
        <img src={hit.showcase_image} alt={hit.title} />
      </div>
      <div className="product-card-body">
        <p className="product-card-type">{hit.product_type}</p>
        <h2 className="product-card-title">
          <Highlight attribute="title" hit={hit} />
        </h2>
        <p className="product-card-description">
          <Snippet attribute="description" hit={hit} />
        </p>
        <p className="product-card-price">${hit.price}</p>
      </div>
    </article>
  );
}

export default function App() {
  if (!searchClient) {
    return <MissingConfig missing={missingEnv} />;
  }

  return (
    <InstantSearch indexName={indexName} searchClient={searchClient}>
      <Configure hitsPerPage={12} />
      <div className="search-header">
        <SearchBox placeholder="Search products" />
        <PoweredBy />
      </div>

      <div className="search-body">
        <div className="filter-panel">
          <div className="filter-panel-section">
            <div className="filter-panel-section-title">Product type</div>
            <RefinementList attribute="product_type" sortBy={["count:desc"]} />
          </div>
          <div className="filter-panel-section">
            <div className="filter-panel-section-title">Price range</div>
            <RefinementList
              attribute="price_range"
              sortBy={(a, b) =>
                PRICE_RANGE_ORDER.indexOf(a.name) -
                PRICE_RANGE_ORDER.indexOf(b.name)
              }
            />
          </div>
        </div>

        <div className="search-results">
          <Hits hitComponent={ProductCard} />
          <Pagination />
        </div>
      </div>
    </InstantSearch>
  );
}
