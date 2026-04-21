import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });
loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is missing.");
}

if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN is missing.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});
const readClient = client.withConfig({ perspective: "raw" });

const TYPES_TO_DELETE = ["order", "customer", "product", "category", "store"];
const CHUNK_SIZE = 100;

async function countDocsByType(type: string): Promise<number> {
  return readClient.fetch<number>(`count(*[_type == $type])`, { type });
}

async function fetchDocIdsByType(type: string): Promise<string[]> {
  return readClient.fetch<string[]>(
    `*[_type == $type]|order(_updatedAt asc)[0...$limit]._id`,
    { type, limit: CHUNK_SIZE },
  );
}

async function main() {
  console.log(`Fresh start on dataset "${dataset}"...`);

  const total = await readClient.fetch<number>(`count(*[_type in $types])`, {
    types: TYPES_TO_DELETE,
  });

  if (total === 0) {
    console.log("No commerce docs found. Dataset is already fresh.");
    return;
  }

  let deletedTotal = 0;

  const maxPasses = 5;
  for (let pass = 1; pass <= maxPasses; pass += 1) {
    let deletedInPass = 0;
    console.log(`Cleanup pass ${pass}/${maxPasses}...`);

    for (const type of TYPES_TO_DELETE) {
      const typeCount = await countDocsByType(type);
      if (typeCount === 0) {
        continue;
      }

      let deletedType = 0;
      console.log(`Clearing ${type} docs... (${typeCount})`);

      while (true) {
        const ids = await fetchDocIdsByType(type);
        if (ids.length === 0) {
          break;
        }

        const tx = client.transaction();
        for (const id of ids) {
          tx.delete(id);
        }

        await tx.commit();
        deletedType += ids.length;
        deletedTotal += ids.length;
        deletedInPass += ids.length;

        console.log(
          `Deleted ${deletedType}/${typeCount} ${type} docs (${deletedTotal}/${total} total)...`,
        );
      }
    }

    const remaining = await readClient.fetch<number>(
      `count(*[_type in $types])`,
      { types: TYPES_TO_DELETE },
    );

    if (remaining === 0) {
      break;
    }

    if (deletedInPass === 0) {
      throw new Error(
        `Unable to finish cleanup: ${remaining} docs still remain (likely due to references outside commerce types).`,
      );
    }

    if (pass === maxPasses) {
      throw new Error(
        `Cleanup did not finish after ${maxPasses} passes. ${remaining} docs still remain.`,
      );
    }
  }

  const remainingAfterCleanup = await readClient.fetch<number>(
    `count(*[_type in $types])`,
    { types: TYPES_TO_DELETE },
  );

  if (remainingAfterCleanup > 0) {
    throw new Error(
      `Fresh start incomplete: ${remainingAfterCleanup} commerce docs still remain.`,
    );
  }

  console.log("Fresh start complete.");
  console.log(
    "Next step: sign in and use /onboarding to create your first store from flow.",
  );
}

void main();
