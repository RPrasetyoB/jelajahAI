const path = require("node:path");
const { createStrapi } = require("@strapi/strapi");

const appDir = process.cwd();
const distDir = path.join(appDir, "dist");

const run = async () => {
  console.log("Seed: loading Strapi...");
  const strapi = await createStrapi({
    appDir,
    distDir
  }).load();

  try {
    console.log("Seed complete.");
    process.exit(0);
  } catch (error) {
    throw error;
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
