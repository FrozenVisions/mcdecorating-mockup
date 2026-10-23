import { esc, ldScript, businessNode, ICONS } from "./helpers.mjs";

function social(config) {
  return `<span class="soc"><a href="${esc(config.facebook)}" aria-label="MC Decorating on Facebook" rel="noopener noreferrer" target="_blank">${ICONS.facebook}</a><a href="${esc(config.whatsapp)}" aria-label="Message MC Decorating on WhatsApp" rel="noopener noreferrer">${ICONS.whatsapp}</a></span>`;
}

function current(path, href) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href);
}

export function renderPage({
  config,
  areas,
  services,
  posts,
  path,
  title,
  description,
  image = "/logo.png",
  main,
  extraLd = [],
  crumbs = null,
  ogType = "website",
  scripts = [],
  dialog = false
}) {
  const canonical = config.baseUrl + (path === "/404.html" ? "/404.html" : path);
  const imageUrl = image.startsWith("http") ? image : config.baseUrl + image;
  const robots = config.noindex ? "noindex, nofollow" : "index, follow";
  const serviceLinks = services.map((service) => {
    const href = `/services/${service.slug}/`;
    return `<a href="${href}"${current(path, href) ? ' aria-current="page"' : ""}>${esc(service.name)}</a>`;
  }).join("");
  const servicesCurrent = path.startsWith("/services/");
  const graph = [businessNode(config, areas), ...extraLd];
  const scriptTags = ['<script src="/js/nav.js"></script>', '<script src="/js/quote-form.js"></script>', ...scripts.map((src) => `<script src="${src}"></script>`)].join("");
  const lightbox = dialog
    ? `<dialog id="lightbox" aria-label="Photograph"><div class="lightbox-card"><div class="lightbox-top"><button type="button" class="lightbox-close">Close</button></div><img id="lightbox-img" alt=""><p id="lightbox-cap"></p></div></dialog>`
    : "";

  const areaGroups = [
    ["County Tyrone", areas.filter((area) => area.group === "tyrone")],
    ["County Fermanagh", areas.filter((area) => area.group === "fermanagh")]
  ];

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#1d2433">
<meta name="robots" content="${robots}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(imageUrl)}">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="MC Decorating">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(imageUrl)}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="alternate" type="application/rss+xml" title="MC Decorating advice" href="${esc(config.baseUrl)}/feed.xml">
<link rel="alternate" type="application/atom+xml" title="MC Decorating advice" href="${esc(config.baseUrl)}/atom.xml">
<link rel="stylesheet" href="/style.css">
${ldScript(graph)}
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header>
  <div class="wrap nav">
    <a class="logo" href="/"><img src="/logo.png" alt="MC Decorating" width="284" height="96"></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <div class="nav-cluster" id="site-nav">
      <nav aria-label="Primary">
        <details class="nav-drop">
          <summary${servicesCurrent ? ' aria-current="page"' : ""}>Services</summary>
          <div class="nav-panel">
            <a href="/services/"${path === "/services/" ? ' aria-current="page"' : ""}>All services</a>
            ${serviceLinks}
          </div>
        </details>
        <a href="/our-work/"${current(path, "/our-work/") ? ' aria-current="page"' : ""}>Our work</a>
        <a href="/areas/"${current(path, "/areas/") ? ' aria-current="page"' : ""}>Areas</a>
        <a href="/blog/"${current(path, "/blog/") ? ' aria-current="page"' : ""}>Advice</a>
      </nav>
      <div class="hdr-r">
        ${social(config)}
        <a class="btn call-link" href="tel:${esc(config.phoneTel)}">Call ${esc(config.phoneDisplay)}</a>
        <a class="btn" href="/get-a-quote/"${path === "/get-a-quote/" ? ' aria-current="page"' : ""}>Get a free quote</a>
      </div>
    </div>
  </div>
</header>
<main id="content">
${main}
</main>
<footer>
  <div class="wrap footer-grid">
    <div>
      <h2>MC Decorating</h2>
      <p>Martin Kelly, painter and decorator, based in Omagh. County Tyrone, County Fermanagh, and across the border, north or south, when the job suits.</p>
      <p>Call <a href="tel:${esc(config.phoneTel)}">${esc(config.phoneDisplay)}</a><br>Email <a href="mailto:${esc(config.email)}">${esc(config.email)}</a></p>
      <p class="follow">${social(config)} <a href="${esc(config.facebook)}" rel="noopener noreferrer" target="_blank">Facebook</a> · <a href="${esc(config.whatsapp)}">WhatsApp</a></p>
    </div>
    <div>
      <h2>Services</h2>
      <ul>
        <li><a href="/services/">All services</a></li>
        ${services.map((service) => `<li><a href="/services/${service.slug}/">${esc(service.name)}</a></li>`).join("")}
        <li><a href="/our-work/">Our work</a></li>
        <li><a href="/get-a-quote/">Get a free quote</a></li>
      </ul>
    </div>
    ${areaGroups.map(([label, list]) => `<nav aria-label="${esc(label)}"><h2>${esc(label)}</h2><ul>${list.map((area) => `<li><a href="/areas/${area.slug}/">${esc(area.name)}</a></li>`).join("")}</ul></nav>`).join("")}
    <div>
      <h2>Advice</h2>
      <ul>
        <li><a href="/blog/">All advice</a></li>
        ${posts.slice(0, 5).map((post) => `<li><a href="/blog/${post.slug}/">${esc(post.title)}</a></li>`).join("")}
        <li><a href="/areas/">Areas we cover</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>MC Decorating · Omagh, Co. Tyrone · <a href="/get-a-quote/">Contact</a></p>
    <p>Website by <a href="https://wholelottasites.co.uk" rel="noopener noreferrer">WholeLottaSites</a></p>
  </div>
</footer>
<div class="dock" role="region" aria-label="Contact">
  <a class="btn" href="tel:${esc(config.phoneTel)}">Call</a>
  <a class="btn wa" href="${esc(config.whatsapp)}">WhatsApp</a>
</div>
${lightbox}
${scriptTags}
</body>
</html>
`;
}
