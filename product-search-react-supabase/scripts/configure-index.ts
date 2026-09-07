/* Configure the Algolia index used by this quickstart.
 *
 * This script only applies index settings -- it never writes records. The Supabase
 * connector supplies those, and its transformation derives `price_range`, which no
 * index setting can produce on its own.
 *
 * All four settings below are read by the search UI, and the first two fail silently
 * if unset.
 *
 * Needs ALGOLIA_WRITE_API_KEY. Treat that key as a secret; never commit it.
 */
import { algoliasearch } from "algoliasearch";
import ora from "ora";
import { loadEnv } from "vite";

const env = loadEnv(process.env.MODE ?? "dev", process.cwd(), "");

const appId = env.VITE_ALGOLIA_APPLICATION_ID || env.ALGOLIA_APP_ID;
const writeApiKey = env.ALGOLIA_WRITE_API_KEY;
const indexName = env.VITE_ALGOLIA_INDEX_NAME || "quickstart-products";

if (!appId) {
  throw new Error(
    "Missing VITE_ALGOLIA_APPLICATION_ID (or ALGOLIA_APP_ID) environment variable.",
  );
}

if (!writeApiKey) {
  throw new Error("Missing ALGOLIA_WRITE_API_KEY environment variable.");
}

const client = algoliasearch(appId, writeApiKey);
const spinner = ora();

try {
  spinner.start(`Configuring ${indexName}...`);

  const { taskID } = await client.setSettings({
    indexName,
    indexSettings: {
      attributesForFaceting: ["product_type", "price_range"],
      searchableAttributes: [
        "unordered(title)",
        "unordered(product_type)",
        "unordered(description)",
      ],
      attributesToSnippet: ["description:30"],
      customRanking: ["desc(units_sold)", "desc(price)"],
    },
  });

  await client.waitForTask({ indexName, taskID });
  spinner.succeed(`Successfully configured ${indexName}.`);
} catch (error) {
  spinner.fail("Index configuration failed.");
  console.error(error);
  process.exitCode = 1;
}
