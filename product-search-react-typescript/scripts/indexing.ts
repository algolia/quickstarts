/* Index sample data into an Algolia index `quickstart-products`.
 *
 * Run this once before starting the app, so it has an index to search.
 * Requires `ALGOLIA_WRITE_API_KEY` in `.env.local`.
 * Consider this key a **secret**. Don't expose it and don't commit it to GitHub.
 */
import { algoliasearch } from "algoliasearch";
import ora from "ora";
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
const spinner = ora();

async function indexProducts() {
  spinner.text = "Fetching the products dataset...";

  const response = await fetch(
    "https://dashboard.algolia.com/api/1/sample_datasets?type=apparel",
  );

  if (!response.ok) {
    throw new Error(
      `Error fetching products dataset: ${response.status} ${response.statusText}`,
    );
  }

  const products = await response.json();

  spinner.text = `Indexing ${products.length.toLocaleString()} products into ${indexName}...`;

  await client.saveObjects({
    indexName,
    objects: products,
    waitForTasks: true,
  });
}

async function configureIndex() {
  spinner.text = `Configuring ${indexName}...`;

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
  spinner.start("Beginning index setup...");
  await indexProducts();
  await configureIndex();
  spinner.succeed("Successfully indexed and configured products.");
} catch (error) {
  spinner.fail("Indexing failed.");
  console.error(error);
  process.exitCode = 1;
}
