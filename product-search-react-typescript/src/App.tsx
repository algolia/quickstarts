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

const appId = import.meta.env.VITE_ALGOLIA_APPLICATION_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;

if (!appId) {
  console.error("Missing environment variable: VITE_ALGOLIA_APPLICATION_ID");
}

if (!apiKey) {
  console.error("Missing environment variable: VITE_ALGOLIA_SEARCH_API_KEY");
}

type ProductRecord = {
  title: string;
  description: string;
  product_type: string;
  price: number;
  showcase_image: string;
};

type ProductHit = Hit<ProductRecord>;

type ProductCardProps = {
  hit: ProductHit;
};

function ProductCard({ hit }: ProductCardProps) {
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
  const searchClient = algoliasearch(appId, apiKey);

  return (
    <InstantSearch indexName="quickstart-products" searchClient={searchClient}>
      <Configure hitsPerPage={12} />
      <div className="demo-credentials-note">
        <span className="demo-credentials-icon" aria-hidden="true">
          i
        </span>
        <span>
          This app uses a hosted demo Algolia index. To connect your own index,{" "}
          <a href="https://www.algolia.com/users/sign_up" rel="noreferrer" target="_blank">
            sign up for Algolia
          </a>{" "}
          and set <code>VITE_ALGOLIA_APPLICATION_ID</code> and{" "}
          <code>VITE_ALGOLIA_SEARCH_API_KEY</code>.
        </span>
      </div>
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
        </div>

        <div className="search-results">
          <Hits hitComponent={ProductCard} />
          <Pagination />
        </div>
      </div>
    </InstantSearch>
  );
}
