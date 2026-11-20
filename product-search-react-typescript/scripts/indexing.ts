/* Index sample data into an Algolia index `quickstart-products`.
 *
 * Run this once before starting the app, so it has an index to search.
 * Requires `ALGOLIA_WRITE_API_KEY` in `.env.local`.
 * Consider this key a **secret**. Don't expose it and don't commit it to GitHub.
 */
import { algoliasearch } from "algoliasearch";
import { loadEnv } from "vite";

const env = loadEnv(process.env.MODE ?? "dev", process.cwd(), "");

const appId = env.VITE_ALGOLIA_APPLICATION_ID;
const writeApiKey = env.ALGOLIA_WRITE_API_KEY;
const indexName = "quickstart-products";

if (!appId) {
  throw new Error("Missing VITE_ALGOLIA_APPLICATION_ID environment variable.");
}

if (!writeApiKey) {
  throw new Error(
    "Missing ALGOLIA_WRITE_API_KEY. Add it to .env.local, and never commit it.",
  );
}

const client = algoliasearch(appId, writeApiKey);

async function indexProducts() {
  console.log("Fetching the products dataset...");

  const response = await fetch(
    "https://dashboard.algolia.com/api/1/sample_datasets?type=apparel",
  );

  if (!response.ok) {
    throw new Error(
      `Error fetching products dataset: ${response.status} ${response.statusText}`,
    );
  }

  const products = await response.json();

  console.log(
    `Indexing ${products.length.toLocaleString()} products into ${indexName}...`,
  );

  await client.saveObjects({
    indexName,
    objects: products,
    waitForTasks: true,
  });
}

async function configureIndex() {
  console.log(`Configuring ${indexName}...`);

  const { taskID } = await client.setSettings({
    indexName,
    indexSettings: {
      attributesForFaceting: ["product_type"],
      attributesToSnippet: ["description:30"],
    },
  });

  await client.waitForTask({ indexName, taskID });
}

try {
  console.log("Beginning index setup...");
  await indexProducts();
  await configureIndex();
  console.log("Successfully indexed and configured products.");
} catch (error) {
  console.error("Indexing failed.");
  console.error(error);
  process.exitCode = 1;
}
