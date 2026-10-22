// Deploys WaterLink to the signed-in Cloudflare account (Workers + D1, free plan) as a
// self-hosted demo: changes need a shared demo access code, reading needs nothing.
//   npx wrangler login                     once, in the browser
//   node scripts/deploy-cloudflare.mjs     build, database, migration, code, deploy
// The access code is generated once and kept in the git-ignored file .env.demo-access.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const WORKER = "waterlink-demo", DATABASE = "waterlink-demo";
const deployConfig = "dist/server/wrangler.deploy.json";
const codeFile = ".env.demo-access";

function run(args, { input, quiet = false } = {}) {
  const result = spawnSync(process.execPath, ["--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js", ...args], {
    cwd: root, input, encoding: "utf8", stdio: [input === undefined ? "inherit" : "pipe", "pipe", "pipe"],
  });
  if (!quiet) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error(`wrangler ${args[0]} failed.`);
  }
  return result.stdout;
}
const step = (text) => console.log(`\n▸ ${text}`);

step("Checking the Cloudflare login");
const who = run(["whoami"], { quiet: true });
if (/not authenticated/i.test(who)) {
  console.error("Not signed in to Cloudflare. Run `npx wrangler login` first (free account is enough).");
  process.exit(1);
}

step("Building the production bundle");
const build = spawnSync(process.execPath, ["scripts/run-framework.mjs", "build"], { cwd: root, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

step(`Finding or creating the D1 database "${DATABASE}"`);
let databases = JSON.parse(run(["d1", "list", "--json"], { quiet: true }));
let database = databases.find((d) => d.name === DATABASE);
if (!database) {
  run(["d1", "create", DATABASE], { quiet: true });
  databases = JSON.parse(run(["d1", "list", "--json"], { quiet: true }));
  database = databases.find((d) => d.name === DATABASE);
}
if (!database?.uuid) throw new Error("Could not find the D1 database after creating it.");
console.log(`Database ${DATABASE}: ${database.uuid}`);

step("Writing the deploy configuration");
const config = JSON.parse(readFileSync(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
config.name = WORKER;
config.topLevelName = WORKER;
config.d1_databases = [{ binding: "DB", database_name: DATABASE, database_id: database.uuid }];
config.vars = { ...config.vars, WATERLINK_AUTH: "code" };
writeFileSync(new URL(`../${deployConfig}`, import.meta.url), JSON.stringify(config));

step("Creating the tables if they do not exist yet");
const migration = readFileSync(new URL("../drizzle/0000_salty_kingpin.sql", import.meta.url), "utf8")
  .replaceAll("--> statement-breakpoint", "")
  .replaceAll("CREATE TABLE `", "CREATE TABLE IF NOT EXISTS `");
writeFileSync(new URL("../dist/server/migration.remote.sql", import.meta.url), migration);
run(["d1", "execute", "DB", "--remote", "--config", deployConfig, "--file", "dist/server/migration.remote.sql", "--yes"], { quiet: true });

step("Deploying the worker");
const out = run(["deploy", "--config", deployConfig]);

step("Setting the demo access code");
let code = existsSync(new URL(`../${codeFile}`, import.meta.url))
  ? readFileSync(new URL(`../${codeFile}`, import.meta.url), "utf8").match(/^DEMO_ACCESS_CODE=(.+)$/m)?.[1]?.trim() : "";
// Without a local copy, a worker that already has a code keeps it: a new random code would sign everybody out
// and lock out whoever holds the old one (for example when deploying from another computer).
const listed = run(["secret", "list", "--config", deployConfig], { quiet: true });
const workerHasCode = (() => {
  try { return JSON.parse(listed.slice(listed.indexOf("["), listed.lastIndexOf("]") + 1)).some((secret) => secret.name === "DEMO_ACCESS_CODE"); }
  catch { return false; }
})();
const keepExisting = !code && workerHasCode;
if (keepExisting) {
  console.log("No local code file, but the worker already has a code: keeping it.");
} else {
  if (!code) {
    const words = ["pump", "river", "borehole", "jerrycan", "rain", "well", "tap", "spring", "bucket", "valley", "maji", "kisima"];
    code = `${words[randomInt(words.length)]}-${words[randomInt(words.length)]}-${words[randomInt(words.length)]}-${randomInt(1000, 10000)}`;
    writeFileSync(new URL(`../${codeFile}`, import.meta.url), `# Shared demo access code for the Cloudflare deployment. Do not commit.\nDEMO_ACCESS_CODE=${code}\n`);
  }
  run(["secret", "put", "DEMO_ACCESS_CODE", "--config", deployConfig], { input: `${code}\n`, quiet: true });
}

const url = out.match(/https:\/\/\S+\.workers\.dev/)?.[0];
console.log(`\nDone. WaterLink runs at ${url ?? "(see the deploy output above)"}`);
console.log(keepExisting ? "The access code for changes is unchanged." : `The access code for changes is in web/${codeFile}.`);
