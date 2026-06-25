import { liteClient as algoliasearch } from "algoliasearch/lite";
import type { Hit } from "instantsearch.js";
import {
  Chat,
  ChatTrigger,
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
import "instantsearch.css/components/chat-min.css";
import "instantsearch.css/components/ai-mode-button.css";
import "./App.css";

const appId = import.meta.env.VITE_ALGOLIA_APPLICATION_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
const agentId = import.meta.env.VITE_ALGOLIA_AGENT_ID;

if (!appId) {
  console.error("Missing environment variable: VITE_ALGOLIA_APPLICATION_ID");
}

if (!apiKey) {
  console.error("Missing environment variable: VITE_ALGOLIA_SEARCH_API_KEY");
}

if (!agentId) {
  console.error("Missing environment variable: VITE_ALGOLIA_AGENT_ID");
}

type ProductRecord = {
  title: string;
  description: string;
  product_type: string;
  price: number;
  showcase_image: string;
};

type ProductHit = Hit<ProductRecord>;

const shoppingAssistantPrompts = [
  "Find me a summer wedding outfit",
  "Show sneakers under $150",
  "What goes with wide-leg jeans?",
  "Help me choose the right size",
];

type ProductItem = ProductRecord & {
  objectID: string;
  __position: number;
  __queryID?: string;
  _highlightResult?: ProductHit["_highlightResult"];
  _snippetResult?: ProductHit["_snippetResult"];
};

type ProductCardProps = {
  hit?: ProductHit;
  item?: ProductItem;
  onClick?: () => void;
  onAuxClick?: () => void;
};

function hasHighlightResult(product: ProductHit | ProductItem): product is ProductHit {
  return Boolean(product._highlightResult?.title);
}

function hasSnippetResult(product: ProductHit | ProductItem): product is ProductHit {
  return Boolean(product._snippetResult?.description);
}

function ShoppingAssistantWelcome({
  sendMessage,
  status,
}: {
  sendMessage?: (params: { text: string }) => void;
  status?: string;
}) {
  const disabled = status !== undefined && status !== "ready";

  return (
    <div className="ais-ChatGreeting">
      <h2 className="ais-ChatGreeting-heading">How can I help you shop today?</h2>
      <p className="ais-ChatGreeting-subheading">
        Ask for outfit ideas, product recommendations, sizing help, or style
        advice.
      </p>
      <div className="ais-ChatPromptSuggestions">
        {shoppingAssistantPrompts.map((prompt) => (
          <button
            className="ais-ChatPromptSuggestions-suggestion"
            disabled={disabled || !sendMessage}
            key={prompt}
            onClick={() => sendMessage?.({ text: prompt })}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ hit, item, onClick, onAuxClick }: ProductCardProps) {
  const product = hit ?? item;

  if (!product) {
    throw new Error("ProductCard requires either `hit` or `item`.");
  }

  return (
    <article
      className="product-card"
      onAuxClick={onAuxClick}
      onClick={onClick}
    >
      <div className="product-card-image">
        <img src={product.showcase_image} alt={product.title} />
      </div>
      <div className="product-card-body">
        <p className="product-card-type">{product.product_type}</p>
        <h2 className="product-card-title">
          {hasHighlightResult(product) ? (
            <Highlight attribute="title" hit={product} />
          ) : (
            product.title
          )}
        </h2>
        <p className="product-card-description">
          {hasSnippetResult(product) ? (
            <Snippet attribute="description" hit={product} />
          ) : (
            product.description
          )}
        </p>
        <p className="product-card-price">${product.price}</p>
      </div>
    </article>
  );
}

export default function App() {
  const searchClient = algoliasearch(appId, apiKey);

  return (
    <InstantSearch indexName="quickstart-products" searchClient={searchClient}>
      <Configure hitsPerPage={12} />
      <header className="app-banner">
        <p className="app-banner-description">
          Ready to build? Explore the{" "}
          <a
            href="https://www.algolia.com/doc/guides/get-started/quickstart"
            rel="noreferrer"
            target="_blank"
          >
            Algolia docs
          </a>{" "}
          and get started in minutes.
        </p>
      </header>
      <div className="search-header">
        <SearchBox
          placeholder="Search products"
          aiMode
          translations={{ aiModeButtonTitle: "Ask assistant" }}
        />
        <PoweredBy />
      </div>

      <div>
        <Chat<ProductItem>
          agentId={agentId}
          emptyComponent={ShoppingAssistantWelcome}
          feedback={true}
          itemComponent={ProductCard}
          translations={{
            header: {
              title: "Shopping assistant",
            },
          }}
        />
      </div>

      <div className="search-body">
        <div className="filter-panel">
          <div className="filter-panel-section">
            <div className="filter-panel-section-title">Product type</div>
            <RefinementList attribute="product_type" sortBy={["count:desc"]} />
          </div>
        </div>

        <div className="search-results">
          <Hits<ProductRecord> hitComponent={ProductCard} />
          <Pagination />
        </div>
      </div>

      <ChatTrigger />
    </InstantSearch>
  );
}
