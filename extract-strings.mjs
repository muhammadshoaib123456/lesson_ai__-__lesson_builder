// import fs from 'node:fs';
// import path from 'node:path';
// import {globby} from 'globby';
// import {parse} from '@babel/parser';
// import traverseModule from '@babel/traverse';
// const traverse = traverseModule.default || traverseModule;

// /* ===== CONFIG ===== */
// const INCLUDE = ['**/*.{tsx,jsx,ts,js}'];
// const IGNORE = [
//   '**/node_modules/**','**/.next/**','**/dist/**','**/build/**','**/out/**',
//   '**/.turbo/**','**/coverage/**','**/*.stories.*','**/*.spec.*','**/*.test.*',
//   '**/scripts/**','**/__tests__/**','**/cypress/**',
//   '**/tailwind.config.*','**/postcss.config.*','**/eslint.config.*'
// ];

// // Only capture UI (JSX text + a few attributes). We DO NOT scan generic string literals in code.
// const MIN_LEN = 3;     // minimum length
// const REQUIRE_LETTERS = true;

// const JSX_ATTRS_ALLOW = new Set([
//   'alt','title','aria-label','aria-placeholder','placeholder','label'
// ]);

// /* ===== HEURISTICS ===== */
// // letters in many scripts
// const LETTER_RE = /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u3040-\u30FF\u4E00-\u9FFF]/;
// const clean = s => s.replace(/\s+/g,' ').trim();
// const hasLetters = s => LETTER_RE.test(s);

// const isColorHex       = s => /^#(?:[0-9a-fA-F]{3,8})$/.test(s);
// const isCssColorFunc   = s => /^rgba?\(|^hsla?\(/i.test(s);
// const looksLikeUrl     = s => /^(https?:|mailto:|tel:)/i.test(s);
// const looksLikePath    = s => /[\\/]/.test(s) || /\.[A-Za-z0-9]{2,4}$/.test(s);
// const looksLikeTailwind= s => /(^|\s)(text|bg|border|rounded|shadow|items|justify|min|max|w|h|grid|flex|gap|space|overflow|object|leading|tracking|z|top|left|right|bottom|opacity|rotate|translate|scale|skew|p|px|py|pl|pr|pt|pb|m|mx|my|ml|mr|mt|mb)-/i.test(s)
//                              || /:(hover|focus|active|disabled|dark)/i.test(s);

// // timing/durations/cache flags
// const isTimingName     = s => /^(ease|easein|easeout|easeinout|linear)$/i.test(s);
// const isDuration       = s => /^\d+(\.\d+)?\s*(ms|s|sec|m|min|mins)$/i.test(s);
// const isCacheDirective = s => /^(no-store|no-cache|private|public)$/i.test(s);

// // codey tokens
// const isCamelCase      = s => /[a-z][A-Z]/.test(s);
// const isAllCapsId      = s => /^[A-Z0-9_]+$/.test(s);
// const isLowerId        = s => /^[a-z][a-z0-9_]*$/.test(s) && !/\s/.test(s);

// // allow short single words commonly used in UI
// const SHORT_ALLOW = new Set(['OK','Yes','No','Save','Edit','New','Send','Open','Close','Next','Back','Done','Retry','Cancel','Delete','View']);

// // single-word policy: must look like a UI word (Titlecase or in allowlist)
// function allowSingleWord(w) {
//   if (SHORT_ALLOW.has(w)) return true;
//   // Titlecase like "Loading", "Filters", "Subjects"
//   if (/^[A-Z][a-z]+$/.test(w)) return true;
//   return false;
// }

// function isHumanUI(text) {
//   const t = clean(text);
//   if (!t) return false;
//   if (REQUIRE_LETTERS && !hasLetters(t)) return false;
//   if (t.length < MIN_LEN) return false;

//   // obvious junk
//   if (isColorHex(t) || isCssColorFunc(t)) return false;
//   if (looksLikeUrl(t) || looksLikePath(t)) return false;
//   if (looksLikeTailwind(t)) return false;
//   if (isTimingName(t) || isDuration(t) || isCacheDirective(t)) return false;
//   if (isCamelCase(t) || isAllCapsId(t) || isLowerId(t)) return false;

//   const words = t.split(/\s+/).filter(Boolean);
//   if (words.length === 1) return allowSingleWord(words[0]);

//   return true; // phrases/sentences
// }

// /* ===== KEYS & OUTPUT ===== */
// const uniqKey = (() => {
//   const used = new Set();
//   return (text) => {
//     const base = clean(text).slice(0,60).toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'TEXT';
//     let k = base, i = 1;
//     while (used.has(k)) k = `${base}_${++i}`;
//     used.add(k);
//     return k;
//   };
// })();

// const parserOpts = { sourceType: 'module', plugins: ['jsx','typescript','classProperties','decorators-legacy','topLevelAwait','objectRestSpread','dynamicImport'] };
// const items = [];
// const seen = new Set();

// function push(text, file, line) {
//   const t = clean(text);
//   if (!isHumanUI(t) || seen.has(t)) return;
//   seen.add(t);
//   items.push({ key: uniqKey(t), text: t, file: path.relative(process.cwd(), file), line });
// }

// function collect(ast, file) {
//   traverse(ast, {
//     // visible text between tags
//     JSXText(p) {
//       const t = clean(p.node.value || '');
//       if (!t) return;
//       push(t, file, p.node.loc?.start?.line ?? 0);
//     },

//     // visible attributes only
//     JSXAttribute(p) {
//       const name = p.node.name?.name;
//       if (!JSX_ATTRS_ALLOW.has(name)) return;
//       const v = p.node.value;
//       if (!v) return;
//       let val = '';
//       if (v.type === 'StringLiteral') val = v.value;
//       else if (v.type === 'JSXExpressionContainer' && v.expression.type === 'StringLiteral') val = v.expression.value;
//       if (!val) return;
//       push(val, file, p.node.loc?.start?.line ?? 0);
//     }

//     // IMPORTANT: we intentionally DO NOT traverse generic StringLiteral/TemplateLiteral
//     // in code to avoid pulling technical strings.
//   });
// }

// (async function main() {
//   const files = await globby(INCLUDE, { ignore: IGNORE });
//   for (const f of files) {
//     const code = fs.readFileSync(f, 'utf8');
//     let ast;
//     try { ast = parse(code, { ...parserOpts, sourceFilename: f }); }
//     catch { continue; }
//     collect(ast, f);
//   }

//   const dict = Object.fromEntries(items.map(it => [it.key, it.text]));

//   fs.writeFileSync('./strings-source.json', JSON.stringify({
//     meta: { total: items.length, generatedAt: new Date().toISOString() },
//     messages: dict,
//     refs: items
//   }, null, 2));

//   const rows = ['KEY,TEXT,FILE,LINE',
//     ...items.map(it => `"${it.key.replace(/"/g,'""')}","${it.text.replace(/"/g,'""')}","${it.file.replace(/"/g,'""')}",${it.line}`)
//   ];
//   fs.writeFileSync('./strings-source.csv', rows.join('\n'), 'utf8');

//   console.log(`✓ Kept ${items.length} strict UI strings`);
//   console.log('→ strings-source.json');
//   console.log('→ strings-source.csv');
// })();









































import fs from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default || traverseModule;

/* ==========================================================
 * UI STRING EXTRACTOR (JSX/TSX + literals in JS/TS objects & defaults)
 *
 * Captures ONLY human-facing UI copy – headings, paragraphs, quotes,
 * author names, labels, button/link text – plus selected UI-relevant attributes
 * (alt, title, placeholder, label) for i18n.
 *
 * Also captures:
 *  - Link text (Next.js <Link>, react-router <Link>, <a href>, custom *Link)
 *  - Plain string literals in JS/TS object shapes (quote, author, title…)
 *  - Default values in function param object patterns (e.g., { title = "..." })
 *  - Template literals: expressions are stripped; static text is kept
 *
 * Output:
 *  - strings-source.json: { meta, messages, refs[] }
 *  - strings-source.csv:  KEY,TEXT,FILE,LINE,TAG,ATTR
 * ========================================================== */

/* ===== CONFIG ===== */
const INCLUDE = ['**/*.{tsx,jsx,ts,js}'];
const IGNORE = [
  '**/node_modules/**','**/.next/**','**/dist/**','**/build/**','**/out/**',
  '**/.turbo/**','**/coverage/**','**/*.stories.*','**/*.spec.*','**/*.test.*',
  '**/scripts/**','**/__tests__/**','**/cypress/**',
  '**/tailwind.config.*','**/postcss.config.*','**/eslint.config.*',
  '**/*.d.ts'
];

const MIN_LEN = 2;
const REQUIRE_LETTERS = true; // require at least one alphabetic/unicode letter

// Semantic HTML tags most likely to contain translatable copy
const TAGS_ALLOW_TEXT = new Set([
  'h1','h2','h3','h4','h5','h6',
  'p','span','small','strong','em','mark',
  'blockquote','q','cite','figcaption','caption',
  'li','dd','dt','summary',
  'label','button','a',
  'legend','textarea',
  'th','td',
  'dialog','details'
]);

// Common UI components whose children are human-facing (extend as needed)
const COMPONENTS_ALLOW_TEXT = new Set([
  'heading','title','text','paragraph','subtitle','caption','label',
  'button','btn',
  // links / navigation variants
  'link','navlink','routerlink','next.link','nextlink',
  'menulabel','menuitem','dropdownmenuitem','breadcrumbitem',
  // dialogs/cards
  'dialogtitle','dialogdescription','cardtitle','carddescription',
  // misc
  'tooltip','toast','alert','badge','chip','tag',
  // shadcn-style names in lowercase
  'accordiontrigger','accordioncontent','tabscontent'
]);

// Disallowed containers (never extract inside)
// IMPORTANT: do NOT include "link" here, or Next.js <Link> gets blocked
const TAGS_BLOCK = new Set([
  'svg','path','g','circle','rect','image','img','script','style','noscript','meta','head'
]);

// Allowed attributes (visible UI only — ARIA removed)
const JSX_ATTRS_ALLOW = new Set([
  'alt','title','placeholder','label'
]);

// Allowed JS/TS object property names to capture literals from
const PROP_NAMES_ALLOW = new Set([
  // content & typographic
  'title','subtitle','heading','subheading','headline','tagline','kicker',
  'caption','summary','description','content','text','body','label',
  'helperText','errorText',

  // testimonials / quotes
  'quote','author','aurhter','attribution','source',

  // CTA / buttons / nav
  'cta','ctaLabel','ctaText','button','buttonText','okText','cancelText',
  'submitText','confirmText','linkText',

  // forms
  'placeholder','emptyText','noDataText','loadingText','successText','failureText',
]);

// Attributes that OPT-OUT / OPT-IN per element
const ATTR_EXPLICIT_KEY = 'data-i18n-key';    // explicit key for this node
const ATTR_OPTOUT      = 'data-i18n-ignore';  // don't extract from this node
const ATTR_OPTIN       = 'data-i18n';         // force include children text

// Regex helpers (supports many language blocks)
const LETTER_RE = /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u3040-\u30FF\u4E00-\u9FFF]/;
const clean = s => s.replace(/\s+/g,' ').trim();
const hasLetters = s => LETTER_RE.test(s);

const looksLikeCode = s => /^[A-Za-z0-9_-]+$/.test(s) && !/\s/.test(s);
const looksLikeUrl  = s => /^(https?:|mailto:|tel:)/i.test(s);
const looksLikePath = s => /[\\/]/.test(s) || /\.[A-Za-z0-9]{2,4}$/.test(s);

// Short allowlist for very common UI one-word labels
const SHORT_ALLOW = new Set(['OK','Yes','No','Save','Edit','New','Send','Open','Close','Next','Back','Done','Retry','Cancel','Delete','View','Login','Signup']);

// ---------- utilities ----------
function allowSingleWord(w) {
  if (SHORT_ALLOW.has(w)) return true;
  if (/^[A-Z][a-z]+$/.test(w)) return true;      // Proper noun (Home, About)
  if (/^[A-Z]{2,10}$/.test(w)) return true;      // Acronyms: FAQ, API, SSO, ETA
  return false;
}

// Join only the static parts of a template literal; drop ${...} expressions
function tmplToText(tmpl) {
  return (tmpl.quasis || []).map(q => q.value.cooked ?? '').join('').trim();
}

function getJSXName(node /* JSXOpeningElement | JSXElement parent */) {
  const n = node?.openingElement?.name || node?.name || node;
  if (!n) return null;
  if (n.type === 'JSXIdentifier') return n.name.toLowerCase();
  if (n.type === 'JSXMemberExpression') {
    return `${n.object.name}.${n.property.name}`.toLowerCase(); // e.g., Next.Link -> next.link
  }
  if (n.type === 'Identifier') return n.name.toLowerCase();
  return null;
}

function hasAttr(el, attrName) {
  if (!el || !el.attributes) return false;
  return el.attributes.some(a => a.type === 'JSXAttribute' && a.name?.name === attrName);
}
function getAttrString(el, attrName) {
  if (!el || !el.attributes) return undefined;
  const a = el.attributes.find(a => a.type === 'JSXAttribute' && a.name?.name === attrName);
  if (!a) return undefined;
  if (!a.value) return '';
  if (a.value.type === 'StringLiteral') return a.value.value;
  if (a.value.type === 'JSXExpressionContainer' && a.value.expression.type === 'StringLiteral') return a.value.expression.value;
  return undefined;
}

// Heuristic: treat as link container if it looks like a link-like component or has href/to props
function isLikelyLink(openingElement) {
  const name = getJSXName(openingElement) || '';
  const isLinkyName =
    name.includes('link') || name.includes('navlink') || name.includes('routerlink') || name === 'a';
  const hasHref = hasAttr(openingElement, 'href') || hasAttr(openingElement, 'to');
  return isLinkyName || hasHref;
}

// Is this element a place where we want to extract text?
function isAllowedContainer(openingElement) {
  const name = getJSXName(openingElement);
  if (!name) return false;
  if (TAGS_BLOCK.has(name)) return false;
  if (TAGS_ALLOW_TEXT.has(name)) return true;
  if (COMPONENTS_ALLOW_TEXT.has(name)) return true;
  if (isLikelyLink(openingElement)) return true; // <Link> (Next, RR) or <a href>
  return false;
}

// Detect whether text is human-facing UI
function isHumanUI(text, ctx) {
  const t = clean(text);
  if (!t) return false;
  if (REQUIRE_LETTERS && !hasLetters(t)) return false;
  if (t.length < MIN_LEN) return false;

  const parent = (ctx?.parentTag || '').toLowerCase();
  const isNavContext =
    parent === 'a' || parent === 'li' || parent === 'button' || parent.includes('link');

  // Always skip literal URLs/paths
  if (looksLikeUrl(t) || looksLikePath(t)) return false;

  // In nav contexts (a/link/li/button), accept any non-empty text.
  if (isNavContext) return true;

  // Otherwise, be stricter.
  if (looksLikeCode(t)) return false;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length === 1) return allowSingleWord(words[0]);

  if (ctx?.parentTag && TAGS_BLOCK.has(ctx.parentTag)) return false;
  return true;
}

// ---------- key gen ----------
const USE_HASH_KEYS = false;
function hash32(str){
  let h = 2166136261 >>> 0;
  for (let i=0;i<str.length;i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h>>>0).toString(36);
}
const uniqKey = (() => {
  const used = new Set();
  return (text, file, line) => {
    const baseSlug = clean(text).slice(0,60)
      .toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'TEXT';
    const base = USE_HASH_KEYS ? `${baseSlug}_${hash32(file+':'+line+':'+text)}` : baseSlug;
    let k = base, i = 1;
    while (used.has(k)) k = `${base}_${++i}`;
    used.add(k);
    return k;
  };
})();

// ---------- accumulation state ----------
const refs = [];                           // all occurrences (no loss)
const dedupe = new Map();                  // dedupeKey -> key
const keyToText = new Map();               // key -> text (for messages)

// ---------- push ----------
function push(text, file, line, parentTag, attrName, explicitKey) {
  const t = clean(text);
  const ctx = { parentTag };
  const optIn = !!explicitKey || !!attrName?.startsWith?.('data-i18n');
  if (!optIn && (!isHumanUI(t, ctx))) return;

  const dedupeKey = `${t}__${attrName||'node'}__${parentTag||''}`;
  let key = dedupe.get(dedupeKey);

  if (!key) {
    key = explicitKey || uniqKey(t, file, line);
    dedupe.set(dedupeKey, key);
    if (!keyToText.has(key)) keyToText.set(key, t);
  }

  refs.push({
    key, text: t,
    file: path.relative(process.cwd(), file),
    line, tag: parentTag || '', attr: attrName || ''
  });
}

// ---------- traversal ----------
const parserOpts = {
  sourceType: 'module',
  plugins: [
    'jsx','typescript','classProperties','decorators-legacy',
    'topLevelAwait','objectRestSpread','dynamicImport'
  ]
};

function collect(ast, file) {
  traverse(ast, {
    // ===== JSX elements & children =====
    JSXElement(path) {
      const el = path.node.openingElement;
      const parentTag = getJSXName(el);

      if (hasAttr(el, ATTR_OPTOUT)) return;

      const allowed = isAllowedContainer(el);
      const optedIn = hasAttr(el, ATTR_OPTIN);
      const explicitKey = getAttrString(el, ATTR_EXPLICIT_KEY);

      if (allowed || optedIn) {
        for (const ch of path.node.children) {
          if (ch.type === 'JSXText') {
            const v = clean(ch.value || '');
            if (!v) continue;
            push(v, file, ch.loc?.start?.line || 0, parentTag, null, explicitKey);
          }
          if (ch.type === 'JSXExpressionContainer') {
            const ex = ch.expression;
            if (!ex) continue;

            // Plain string literal inside expression: {"Hello"}
            if (ex.type === 'StringLiteral') {
              const v = ex.value;
              if (v) push(v, file, ch.loc?.start?.line || 0, parentTag, null, explicitKey);
            }

            // Template literal: {"Hello ${name}"} -> keep only static parts
            if (ex.type === 'TemplateLiteral') {
              const v = tmplToText(ex);
              if (v) push(v, file, ch.loc?.start?.line || 0, parentTag, null, explicitKey);
            }
          }
        }
      }
    },

    // ===== JSX attributes =====
    JSXAttribute(p) {
      const name = p.node.name?.name;
      const parentEl = p.parent;

      if (hasAttr(parentEl, ATTR_OPTOUT)) return;
      if (name === ATTR_EXPLICIT_KEY) return;
      if (!JSX_ATTRS_ALLOW.has(name)) return;

      const v = p.node.value;
      if (!v) return;
      let val = '';
      if (v.type === 'StringLiteral') {
        val = v.value;
      } else if (v.type === 'JSXExpressionContainer') {
        const ex = v.expression;
        if (ex.type === 'StringLiteral') val = ex.value;
        if (ex.type === 'TemplateLiteral') {
          val = tmplToText(ex);
        }
      }
      if (!val) return;

      const parentTag = getJSXName(parentEl);
      const explicitKey = getAttrString(parentEl, ATTR_EXPLICIT_KEY);
      push(val, file, p.node.loc?.start?.line || 0, parentTag, name, explicitKey);
    },

    // ===== JS/TS object literals =====
    ObjectProperty(p) {
      // key can be Identifier or StringLiteral
      let keyName = null;
      if (p.node.key.type === 'Identifier') keyName = p.node.key.name;
      if (p.node.key.type === 'StringLiteral') keyName = p.node.key.value;
      if (!keyName || !PROP_NAMES_ALLOW.has(keyName)) return;

      const val = p.node.value;
      let str = '';
      if (val.type === 'StringLiteral') {
        str = val.value;
      } else if (val.type === 'TemplateLiteral') {
        // keep only static quasis, drop expressions
        str = tmplToText(val);
      } else if (val.type === 'AssignmentPattern') {
        // { title = "..." } default inside object pattern property
        if (val.right?.type === 'StringLiteral') str = val.right.value;
        else if (val.right?.type === 'TemplateLiteral') str = tmplToText(val.right);
      }
      if (!str) return;

      push(str, file, p.node.loc?.start?.line || 0, 'prop', keyName, null);
    },

    // ===== Function params defaults (e.g., function Comp({ title = "..." })) =====
    Function(path) {
      for (const param of path.node.params) {
        if (param.type === 'ObjectPattern') {
          for (const prop of param.properties || []) {
            if (prop.type !== 'ObjectProperty') continue;

            let keyName = null;
            if (prop.key.type === 'Identifier') keyName = prop.key.name;
            if (prop.key.type === 'StringLiteral') keyName = prop.key.value;
            if (!keyName || !PROP_NAMES_ALLOW.has(keyName)) continue;

            const v = prop.value;
            if (v && v.type === 'AssignmentPattern') {
              if (v.right?.type === 'StringLiteral') {
                push(v.right.value, file, v.right.loc?.start?.line || 0, 'param', keyName, null);
              } else if (v.right?.type === 'TemplateLiteral') {
                const txt = tmplToText(v.right);
                if (txt) push(txt, file, v.right.loc?.start?.line || 0, 'param', keyName, null);
              }
            }
          }
        }
      }
    }
  });
}

// ---------- run ----------
(async function main() {
  const files = await globby(INCLUDE, { ignore: IGNORE });
  for (const f of files) {
    const code = fs.readFileSync(f, 'utf8');
    let ast;
    try {
      ast = parse(code, { ...parserOpts, sourceFilename: f });
    } catch {
      continue;
    }
    collect(ast, f);
  }

  // Build messages from keyToText; refs already include all occurrences
  const messages = Object.fromEntries([...keyToText.entries()]);
  const nowIso = new Date().toISOString();

  fs.writeFileSync('./strings-source.json', JSON.stringify({
    meta: { total: refs.length, unique: Object.keys(messages).length, generatedAt: nowIso },
    messages,
    refs
  }, null, 2));

  const rows = [
    'KEY,TEXT,FILE,LINE,TAG,ATTR',
    ...refs.map(it =>
      `"${it.key.replace(/"/g,'""')}","${it.text.replace(/"/g,'""')}","${it.file.replace(/"/g,'""')}",${it.line},${it.tag||''},${it.attr||''}`
    )
  ];
  fs.writeFileSync('./strings-source.csv', rows.join('\n'), 'utf8');

  console.log(`✓ Kept ${refs.length} UI string occurrences (${Object.keys(messages).length} unique)`);
  console.log('→ strings-source.json');
  console.log('→ strings-source.csv');
})().catch(e => { console.error(e); process.exit(1); });

/* ===================
 * HOW TO OPT-OUT / IN
 * ===================
 *  <Button data-i18n-ignore>Ping</Button>             // will not be extracted
 *  <p data-i18n>Raw text anywhere will be kept</p>     // force include
 *  <h2 data-i18n-key="HOME_HERO_TITLE">Welcome</h2>    // force key
 *
 * Extend:
 *  - Add component/tag names to COMPONENTS_ALLOW_TEXT or TAGS_ALLOW_TEXT.
 *  - Add JS/TS property names to PROP_NAMES_ALLOW (e.g., 'heroTitle', 'linkText').
 *  - Link heuristics already capture: Next.js <Link>, react-router <Link>, <a href>, components with 'href'/'to'.
 */
