import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";

const providersSchema = JSON.parse(
  readFileSync("providers.schema.json", "utf8"),
);
const programsSchema = JSON.parse(
  readFileSync("programs.schema.json", "utf8"),
);
const providers = JSON.parse(readFileSync("providers.json", "utf8"));
const programs = JSON.parse(readFileSync("programs.json", "utf8"));

// --- Schema validation ---

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const validateProviders = ajv.compile(providersSchema);
if (!validateProviders(providers)) {
  console.error("providers.json schema validation failed:");
  for (const err of validateProviders.errors) {
    console.error(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}
console.log("✓ providers.json schema validation passed");

const validatePrograms = ajv.compile(programsSchema);
if (!validatePrograms(programs)) {
  console.error("programs.json schema validation failed:");
  for (const err of validatePrograms.errors) {
    console.error(`  ${err.instancePath || "/"}: ${err.message}`);
  }
  process.exit(1);
}
console.log("✓ programs.json schema validation passed");

// --- Cross-referential checks ---

const errors = [];
const warnings = [];
const programEntries = programs.programs;
const programKeys = new Set(Object.keys(programEntries));

// Collect all quarters defined across all programs
const allQuarters = new Set();
for (const program of Object.values(programEntries)) {
  for (const q of program.year1Quarters ?? []) allQuarters.add(q);
  for (const q of program.year2Quarters ?? []) allQuarters.add(q);
}

// Check unique slugs
const slugs = providers.providers.map((p) => p.slug);
const seen = new Set();
for (const slug of slugs) {
  if (seen.has(slug)) errors.push(`Duplicate slug: "${slug}"`);
  seen.add(slug);
}

// Check providers are sorted alphabetically by name
for (let i = 1; i < providers.providers.length; i++) {
  const prev = providers.providers[i - 1].name.toLowerCase();
  const curr = providers.providers[i].name.toLowerCase();
  if (prev > curr) {
    errors.push(
      `Providers not sorted: "${providers.providers[i - 1].name}" before "${providers.providers[i].name}"`,
    );
  }
}

for (const provider of providers.providers) {
  const { slug } = provider;

  // Provider program keys must reference defined programs
  for (const key of Object.keys(provider.programs)) {
    if (!programKeys.has(key)) {
      errors.push(`${slug}: references undefined program "${key}"`);
    }
  }

  // Report keys must match a quarter defined in some program
  for (const key of Object.keys(provider.reports)) {
    if (!allQuarters.has(key)) {
      errors.push(
        `${slug}: report "${key}" doesn't match any program quarter`,
      );
    }
  }

  // Report quarters must belong to a program the provider participates in
  const providerQuarters = new Set();
  for (const programKey of Object.keys(provider.programs)) {
    const program = programEntries[programKey];
    if (!program) continue;
    for (const q of program.year1Quarters ?? []) providerQuarters.add(q);
    if (provider.programs[programKey].streamDuration === 2) {
      for (const q of program.year2Quarters ?? []) providerQuarters.add(q);
    }
  }
  for (const key of Object.keys(provider.reports)) {
    if (!providerQuarters.has(key)) {
      warnings.push(
        `${slug}: report "${key}" doesn't belong to any program the provider participates in`,
      );
    }
  }

  // streamDuration: 2 only valid when program has year2Quarters
  for (const [programKey, entry] of Object.entries(provider.programs)) {
    const program = programEntries[programKey];
    if (
      entry.streamDuration === 2 &&
      program &&
      (!program.year2Quarters || program.year2Quarters.length === 0)
    ) {
      errors.push(
        `${slug}: streamDuration 2 in ${programKey} but program has no year2Quarters`,
      );
    }
  }
}

// Check budget proposal date is before selection proposal date
for (const [key, program] of Object.entries(programEntries)) {
  if (program.budgetProposal.date > program.selectionProposal.date) {
    errors.push(
      `${key}: budget proposal (${program.budgetProposal.id}) should be before selection (${program.selectionProposal.id})`,
    );
  }
}

if (warnings.length > 0) {
  console.warn("Cross-validation warnings:");
  for (const warn of warnings) console.warn(`  ⚠ ${warn}`);
}

if (errors.length > 0) {
  console.error("Cross-validation failed:");
  for (const err of errors) console.error(`  ${err}`);
  process.exit(1);
}
console.log("✓ Cross-validation passed");

const reportCount = providers.providers.reduce(
  (n, p) => n + Object.keys(p.reports).length,
  0,
);
console.log(
  `\n  ${programKeys.size} programs, ${providers.providers.length} providers, ${reportCount} reports`,
);
