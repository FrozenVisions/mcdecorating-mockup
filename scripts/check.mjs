import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { sortJobs } from "./helpers.mjs";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "site.config.json"), "utf8"));
const jobs = JSON.parse(readFileSync(join(root, "data/jobs.json"), "utf8"));
const posts = JSON.parse(readFileSync(join(root, "data/posts.json"), "utf8"));
const errors = [];

function fail(message) {
  errors.push(message);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === "content" || name === "scripts") continue;
    const file = join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const banned = /\b(mock-?up|demo|preview)\b/i;
const retiredHost = "mcdecorating.wholelottasites.co.uk";

for (const file of files) {
  if (!/\.(html|css|js|json|md|xml|txt)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  if (banned.test(text)) fail(`${file.replace(root, "")} contains mock, demo or preview wording`);
  if (/\.(html|xml|txt)$/.test(file) && text.includes(retiredHost)) {
    fail(`${file.replace(root, "")} still uses ${retiredHost}`);
  }
}

const idMap = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const rel = file.replace(root, "");
  const robotsMeta = config.noindex ? "noindex, nofollow" : "index, follow";
  if (!html.includes(`name="robots" content="${robotsMeta}"`)) {
    fail(`${rel} robots meta is not ${robotsMeta}`);
  }
  if (!config.noindex && html.includes("noindex")) fail(`${rel} still contains noindex`);
  if (!html.includes(`href="${config.baseUrl}`) && !html.includes(`content="${config.baseUrl}`)) {
    const canonical = html.match(/rel="canonical" href="([^"]+)"/);
    if (!canonical || !canonical[1].startsWith(config.baseUrl)) fail(`${rel} canonical is not on the configured domain`);
  }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(`${rel} should have exactly one h1`);
  if (!html.includes('href="#content"')) fail(`${rel} is missing a skip link`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail(`${rel} has a duplicate id ${id}`);
    seen.add(id);
  }
  idMap.set(rel, seen);

  const refs = [...html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)].map((match) => match[1]);
  for (const ref of refs) {
    if (ref.startsWith("tel:")) {
      if (!ref.includes(config.phoneTel)) fail(`${rel} has an unexpected telephone link ${ref}`);
      continue;
    }
    if (ref.startsWith("mailto:")) {
      if (!ref.includes(config.email)) fail(`${rel} has an unexpected email link ${ref}`);
      continue;
    }
    if (ref.startsWith("https://wa.me/")) {
      if (!ref.startsWith(config.whatsapp)) fail(`${rel} has an unexpected WhatsApp link ${ref}`);
      continue;
    }
    if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) continue;
    const [pathPart, hash] = ref.split("#");
    if (!pathPart) {
      if (hash && !seen.has(hash)) fail(`${rel} links to missing #${hash}`);
      continue;
    }
    const local = pathPart.startsWith("/") ? pathPart.slice(1) : null;
    if (local === null) {
      fail(`${rel} has a non-root relative link ${ref}`);
      continue;
    }
    const candidates = local === ""
      ? [join(root, "index.html")]
      : [join(root, local), join(root, local, "index.html"), join(root, `${local}.html`)];
    const target = candidates.find((candidate) => {
      try { return statSync(candidate).isFile(); } catch { return false; }
    });
    if (!target) fail(`${rel} links to missing ${ref}`);
    else if (hash) {
      const key = target.replace(root, "");
      const targetIds = idMap.get(key) || new Set([...readFileSync(target, "utf8").matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
      if (!targetIds.has(hash)) fail(`${rel} links to missing ${ref}`);
    }
  }
}

const robots = readFileSync(join(root, "robots.txt"), "utf8");
const expectedRobots = config.robotsDisallowAll
  ? "User-agent: *\nDisallow: /\n"
  : `User-agent: *\nAllow: /\n\nSitemap: ${config.baseUrl}/sitemap.xml\n`;
if (robots !== expectedRobots) fail("robots.txt does not match site.config.json");
const cname = readFileSync(join(root, "CNAME"), "utf8").trim();
const expectedHost = new URL(config.baseUrl).hostname;
if (cname !== expectedHost) fail(`CNAME is ${cname}, expected ${expectedHost}`);

const serviceSlugs = new Set(["interior-painting", "exterior-painting", "wallpapering", "ceiling-wall-repairs", "commercial-decorating"]);
const jobIds = new Set();
for (const job of jobs) {
  if (jobIds.has(job.id)) fail(`duplicate job id ${job.id}`);
  jobIds.add(job.id);
  for (const key of ["title", "alt", "caption", "src", "width", "height"]) {
    if (!job[key]) fail(`job ${job.id} is missing ${key}`);
  }
  if (!job.services?.length) fail(`job ${job.id} has no service`);
  for (const service of job.services) {
    if (!serviceSlugs.has(service)) fail(`job ${job.id} has unknown service ${service}`);
  }
  for (const ext of ["webp", "jpg"]) {
    try { statSync(join(root, "images/jobs", `${job.src}.${ext}`)); }
    catch { fail(`missing images/jobs/${job.src}.${ext}`); }
  }
}

for (const post of posts) {
  try { statSync(join(root, "content/posts", `${post.slug}.html`)); }
  catch { fail(`missing content for ${post.slug}`); }
  try { statSync(join(root, "blog", post.slug, "index.html")); }
  catch { fail(`missing built post ${post.slug}`); }
}

const quotePages = ["index.html", "get-a-quote/index.html"].map((rel) => readFileSync(join(root, rel), "utf8"));
for (const html of quotePages) {
  if (!html.includes(`action="${config.formAction}"`)) fail("quote form action changed");
  if (!html.includes(`name="_cc" value="${config.formCc}"`)) fail("quote form cc changed");
  if (!html.includes(`name="_next" value="${config.baseUrl}`)) fail("quote form _next is not on the configured domain");
  if (!html.includes('name="_captcha" value="false"')) fail("quote form captcha flag changed");
  if (!html.includes('name="timescale"')) fail("quote form is missing timescale");
  if (!html.includes('name="town"')) fail("quote form is missing town");
  if (!html.includes('name="service"')) fail("quote form is missing job type");
  if (!html.includes('name="message"')) fail("quote form is missing message");
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (locs.length !== 28) fail(`expected 28 sitemap urls, found ${locs.length}`);
for (const loc of locs) {
  if (!loc.startsWith(config.baseUrl)) fail(`sitemap loc off-domain ${loc}`);
  const path = loc.slice(config.baseUrl.length);
  const rel = path === "/" ? "index.html" : `${path.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  try { statSync(join(root, rel)); }
  catch { fail(`sitemap loc missing file ${rel}`); }
}
if (!readFileSync(join(root, "feed.xml"), "utf8").includes("<item>")) fail("RSS feed has no items");
if (!readFileSync(join(root, "atom.xml"), "utf8").includes("<entry>")) fail("Atom feed has no entries");
if ((readFileSync(join(root, "feed.xml"), "utf8").match(/<item>/g) || []).length !== posts.length) fail("RSS item count does not match posts");

const gallery = readFileSync(join(root, "our-work/index.html"), "utf8");
if (!gallery.includes('src="/js/gallery.js"')) fail("gallery page is missing gallery.js");
if (!readFileSync(join(root, "js/gallery.js"), "utf8").includes('fetch("/data/jobs.json")')) fail("gallery script does not fetch jobs.json");
const rendered = gallery.match(/data-rendered="([^"]+)"/);
const expected = sortJobs(jobs).map((job) => job.id).join(",");
if (!rendered || rendered[1] !== expected) fail("gallery order does not match the jobs.json sort");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Checked ${htmlFiles.length} HTML files, ${locs.length} sitemap URLs, ${jobs.length} jobs.`);
