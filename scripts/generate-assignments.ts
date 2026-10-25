import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { generateAssignmentTable } from "../lib/assignments";

async function main(): Promise<void> {
  const outputPath = resolve(
    process.cwd(),
    "content",
    "assignments.generated.ts",
  );
  const assignments = generateAssignmentTable();
  const output = [
    'import type { AssignmentTable } from "../lib/assignments";',
    "",
    `export const ASSIGNMENTS: AssignmentTable = ${JSON.stringify(assignments, null, 2)};`,
    "",
  ].join("\n");

  await writeFile(outputPath, output, "utf8");
  console.log(
    `Generated ${Object.keys(assignments).length} daily assignments at ${outputPath}`,
  );
}

main().catch((error: unknown) => {
  console.error("Failed to generate keyword assignments:", error);
  process.exitCode = 1;
});
