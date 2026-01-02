import fs from "fs";
import path from "path";

const API_DIR = path.join(process.cwd(), "src/app/api");

function scanDir(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith("route.ts")) {
      checkFile(fullPath);
    }
  });
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(process.cwd(), filePath);

  const issues: string[] = [];

  // 1. Check for try-catch
  if (!content.includes("try {") || !content.includes("catch")) {
    issues.push("Missing try-catch block");
  }

  // 2. Check for Validation Session (Standard)
  // Look for `auth()` or `validateSession` or `getServerSession`
  if (!content.includes("auth()") && !content.includes("validateSession") && !relPath.includes("public") && !relPath.includes("login") && !relPath.includes("register")) {
    // Public APIs exclude
    issues.push("Possible missing Authentication check");
  }

  // 3. Check for generic TODOs
  if (content.includes("TODO")) {
    issues.push("Contains TODO comments");
  }

  if (issues.length > 0) {
    console.log(`\nFile: ${relPath}`);
    issues.forEach(issue => console.log(` - ${issue}`));
  }
}

console.log("Starting API Audit...");
scanDir(API_DIR);
console.log("\nAudit Complete.");
