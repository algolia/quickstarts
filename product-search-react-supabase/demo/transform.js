// Canonical copy of the code pasted into the Algolia dashboard transformation editor
// (Data sources > Connectors > Supabase > Transformation).
//
// price_range is DERIVED here from price. It is not a column in Supabase and not an
// Algolia index setting; without this function the price facet has nothing to show.
async function transform(record, helper) {
  const price = Number(record.price);

  record.price_range =
    price < 25
      ? "Under $25"
      : price < 50
        ? "$25 to $49"
        : price < 100
          ? "$50 to $99"
          : "$100 and up";

  return record;
}
