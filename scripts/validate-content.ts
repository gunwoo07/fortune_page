import { validateContentAndAssignments } from "../lib/content-validation";

const errors = validateContentAndAssignments();

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Content and campaign assignments are valid.");
}
