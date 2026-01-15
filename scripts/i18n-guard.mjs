import fs from "fs";
import path from "path";

const root = process.cwd();
const enPath = path.join(root, "src/messages/en.json");
const arPath = path.join(root, "src/messages/ar.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const en = readJson(enPath);
  const ar = readJson(arPath);

  const missingInAr = Object.keys(en).filter((key) => !(key in ar));
  const badArValues = Object.entries(ar)
    .filter(([key, value]) => typeof value === "string")
    .filter(([, value]) => value.includes("????") || value.includes("�"))
    .map(([key]) => key);

  const errors = [];
  if (missingInAr.length > 0) {
    errors.push(
      `Missing Arabic keys (need to add to ar.json): ${missingInAr.join(", ")}`
    );
  }
  if (badArValues.length > 0) {
    errors.push(
      `Arabic keys contain invalid placeholder characters: ${badArValues.join(", ")}`
    );
  }

  if (errors.length > 0) {
    errors.forEach((err) => console.error(err));
    process.exit(1);
  } else {
    console.log("i18n guard: OK");
  }
}

main();
