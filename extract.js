// extract.js
import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

const traverse = traverseModule.default;

const ROOT_DIR = "./src"; // adjust if your code is elsewhere
const OUT_FILE = "./strings-source.csv";

const JSX_ATTRS_ALLOW = new Set([
  "alt",
  "title",
  "aria-label",
  "aria-placeholder",
  "placeholder",
  "label",
]);

let results = [];

/**
 * Clean string (remove whitespace, newlines)
 */
function clean(str) {
  if (!str) return "";
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Push text into results
 */
function push(value, file, line) {
  const txt = clean(value);
  if (!txt) return;
  results.push({ text: txt, file, line });
}

/**
 * Collect strings from AST
 */
function collect(ast, file) {
  traverse(ast, {
    // Direct text in JSX
    JSXText(p) {
      const t = clean(p.node.value || "");
      if (!t) return;
      push(t, file, p.node.loc?.start?.line || 0);
    },

    // Attributes (placeholder, aria-label, etc.)
    JSXAttribute(p) {
      const name = p.node.name?.name;
      if (!JSX_ATTRS_ALLOW.has(name)) return;
      const v = p.node.value;
      if (!v) return;
      let val = "";
      if (v.type === "StringLiteral") {
        val = v.value;
      } else if (
        v.type === "JSXExpressionContainer" &&
        v.expression.type === "StringLiteral"
      ) {
        val = v.expression.value;
      }
      if (!val) return;
      push(val, file, p.node.loc?.start?.line || 0);
    },

    // {"Some text"} or {`Some text`}
    JSXExpressionContainer(p) {
      if (p.node.expression.type === "StringLiteral") {
        push(p.node.expression.value, file, p.node.loc?.start?.line || 0);
      }
      if (
        p.node.expression.type === "TemplateLiteral" &&
        p.node.expression.expressions.length === 0
      ) {
        const raw = p.node.expression.quasis
          .map((q) => q.value.cooked)
          .join("");
        push(raw, file, p.node.loc?.start?.line || 0);
      }
    },

    // All string literals in code
    StringLiteral(p) {
      push(p.node.value, file, p.node.loc?.start?.line || 0);
    },

    // Template strings without variables
    TemplateLiteral(p) {
      if (p.node.expressions.length === 0) {
        const raw = p.node.quasis.map((q) => q.value.cooked).join("");
        push(raw, file, p.node.loc?.start?.line || 0);
      }
    },
  });
}

/**
 * Recursively read files
 */
function readDir(dir) {
  const exts = [".js", ".jsx", ".ts", ".tsx"];
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      readDir(full);
    } else if (exts.includes(path.extname(full))) {
      const code = fs.readFileSync(full, "utf8");
      try {
        const ast = parse(code, {
          sourceType: "module",
          plugins: [
            "jsx",
            "typescript",
            "classProperties",
            "decorators-legacy",
            "dynamicImport",
          ],
        });
        collect(ast, full);
      } catch (err) {
        console.error("Parse error in", full, err.message);
      }
    }
  }
}

/**
 * Write results into CSV
 */
function writeCsv() {
  const rows = [["key", "source_text", "file", "line"]];
  let counter = 1;
  for (const r of results) {
    rows.push([`key_${counter++}`, r.text, r.file, r.line]);
  }
  const csv = rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
  fs.writeFileSync(OUT_FILE, csv, "utf8");
  console.log(`✅ Extracted ${results.length} strings to ${OUT_FILE}`);
}

// Run
readDir(ROOT_DIR);
writeCsv();
