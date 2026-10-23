import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { areas } from "../content/areas.mjs";
import { services } from "../content/services.mjs";
import { renderPage } from "./layout.mjs";
import {
  crumbNode,
  esc,
  fill,
  jobFigure,
  pageHero,
  picture,
  quoteBand,
  quoteForm,
  sortJobs,
  xml
} from "./helpers.mjs";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "site.config.json"), "utf8"));
const jobs = sortJobs(JSON.parse(readFileSync(join(root, "data/jobs.json"), "utf8")));
const posts = JSON.parse(readFileSync(join(root, "data/posts.json"), "utf8"))
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));
const byId = Object.fromEntries(jobs.map((job) => [job.id, job]));
const bySlug = Object.fromEntries(services.map((service) => [service.slug, service]));
const areaBySlug = Object.fromEntries(areas.map((area) => [area.slug, area]));
const sitemap = [];

function writeFile(rel, contents) {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function writePage(urlPath, html, { lastmod = config.siteUpdated, priority = "0.6", images = [] } = {}) {
  const rel = urlPath === "/" ? "index.html" : `${urlPath.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  writeFile(rel, html);
  sitemap.push({ loc: config.baseUrl + urlPath, lastmod, priority, images });
}

function prettyDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${day} ${months[month - 1]} ${year}`;
}

function shots(list, link = "gallery") {
  if (!list.length) return "";
  return `<div class="shots">${list.map((job) => jobFigure(job, { link })).join("")}</div>`;
}

function serviceLinks(slugs) {
  return `<ul>${slugs.map((slug) => `<li><a href="/services/${slug}/">${esc(bySlug[slug].name)}</a></li>`).join("")}</ul>`;
}

const reviews = [
  ["Communication great from initial contact, completed the entire house within the agreed time and done a great job highly recommend!", "Sinead McGloin"],
  ["Excellent service! From initial inquiry to completing the job Martin was a pleasure to deal with. Professional service and high quality!", "Tommy Garvey"],
  ["Can not recommend Marty enough for painting and decorating he done my hall stairs landing living room and kitchen, very professional job, lovely man, give him a shout if your needing painting done", "Emma O'Sullivan"]
];

const cardImage = {
  "interior-painting": "stair-panel-black-rail",
  wallpapering: "hallway-marble",
  "ceiling-wall-repairs": "dining-ceiling-prep"
};

const hero = byId["hallway-marble"];
const homeJobs = jobs.filter((job) => job.beforeAfter && job.featured).slice(0, 6);
const homeMain = `<div class="hero">
  <picture class="hero-media">
    <source srcset="/images/jobs/${hero.src}.webp" type="image/webp">
    <img src="/images/jobs/${hero.src}.jpg" alt="${esc(hero.alt)}" width="${hero.width}" height="${hero.height}" fetchpriority="high" decoding="async">
  </picture>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="wrap hero-copy">
    <h1>Painters and decorators in Omagh, County Tyrone</h1>
    <p>MC Decorating is Martin Kelly. He paints and wallpapers houses and small businesses across County Tyrone and County Fermanagh, and he takes work on either side of the border, north or south, when the job suits.</p>
    <div class="chips"><span>100% recommended on Facebook</span><span>1,795 Facebook followers</span><span>Free, fair quotes</span><span>Small jobs and whole houses</span><span>North or south of the border</span></div>
    <p class="hero-actions"><a class="btn" href="/get-a-quote/">Get a free quote</a> <a class="btn alt" href="tel:${esc(config.phoneTel)}">Call ${esc(config.phoneDisplay)}</a></p>
  </div>
</div>
<section>
  <div class="wrap">
    <h2>What Martin does</h2>
    <p class="section-intro">From one room to a whole property, inside or out. The photographs are recent jobs. They are houses, not a shop display.</p>
    <div class="grid">
      ${services.map((service) => {
        const image = cardImage[service.slug] ? byId[cardImage[service.slug]] : null;
        return `<a class="card card-link" href="/services/${service.slug}/">${image ? picture(image) : ""}<div><h3>${esc(service.name)}</h3><p>${esc(service.lede)}</p><p>More about ${esc(service.name.toLowerCase())}</p></div></a>`;
      }).join("")}
    </div>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2>Recent before and after jobs</h2>
    <p class="section-intro">These are the transformations. The full set, including the finished rooms, is on <a href="/our-work/">our work</a>.</p>
    ${shots(homeJobs)}
  </div>
</section>
<section>
  <div class="wrap">
    <h2>What customers say</h2>
    <div class="grid">
      ${reviews.map(([quote, name]) => `<blockquote><p>“${esc(quote)}”</p><cite>${esc(name)}</cite></blockquote>`).join("")}
    </div>
    <p>100% recommended on Facebook by customers, with 1,795 people following the work. <a href="${esc(config.facebook)}" rel="noopener noreferrer">Read more recommendations on Facebook</a>.</p>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2>Why people call MC Decorating</h2>
    <div class="grid">
      <div class="card"><h3>Clean, professional finish</h3><p>No cut corners. Clean lines, and the preparation done before the colour goes on.</p></div>
      <div class="card"><h3>All jobs welcome</h3><p>A single room or a whole house. Small jobs and big ones get the same care.</p></div>
      <div class="card"><h3>Free, fair quotes</h3><p>No pressure and no set menu of prices. You get a quote for the job you actually have.</p></div>
    </div>
  </div>
</section>
<section id="areas">
  <div class="wrap">
    <h2>Areas we cover</h2>
    <p class="section-intro">Based in Omagh, working across Tyrone and Fermanagh. He also crosses the border, north or south, including into Donegal, when the job suits. The towns below have their own pages. Villages between them are covered too.</p>
    <div class="towns">
      <div><h3>County Tyrone</h3><ul>${areas.filter((area) => area.group === "tyrone").map((area) => `<li><a href="/areas/${area.slug}/">${esc(area.name)}</a></li>`).join("")}</ul></div>
      <div><h3>County Fermanagh</h3><ul>${areas.filter((area) => area.group === "fermanagh").map((area) => `<li><a href="/areas/${area.slug}/">${esc(area.name)}</a></li>`).join("")}</ul></div>
    </div>
    <p><a href="/areas/">See all the areas, and the villages in between</a></p>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2>Advice for local homeowners</h2>
    <div class="post-list">
      ${posts.map((post) => `<article class="post-card"><p class="meta"><time datetime="${esc(post.date)}">${prettyDate(post.date)}</time></p><h3><a href="/blog/${post.slug}/">${esc(post.title)}</a></h3><p>${esc(post.description)}</p></article>`).join("")}
    </div>
  </div>
</section>
<section class="band" id="quote">
  <div class="wrap">
    <h2>Get your free quote</h2>
    <p>Tell Martin about the job and he will come back to you. Prefer to talk? Call <a href="tel:${esc(config.phoneTel)}">${esc(config.phoneDisplay)}</a>, <a href="${esc(config.whatsapp)}">message on WhatsApp</a> or email <a href="mailto:${esc(config.email)}">${esc(config.email)}</a>.</p>
    <div class="quote-panel">${quoteForm(config, "home")}</div>
  </div>
</section>`;

writePage("/", renderPage({
  config, areas, services, posts,
  path: "/",
  title: "Painters and Decorators in Omagh | MC Decorating",
  description: "Painter and decorator in Omagh, Co. Tyrone. Interior and exterior painting, wallpapering and repairs across Tyrone and Fermanagh. Free quotes: 07907 588 541.",
  image: `/images/jobs/${hero.src}.jpg`,
  main: homeMain
}), { priority: "1.0", images: [hero, ...homeJobs] });

const servicesMain = `${pageHero({
  crumbs: [{ name: "Home", href: "/" }, { name: "Services", href: "/services/" }],
  title: "Painting and decorating services",
  lede: "Five kinds of work, all quoted properly and all finished by the same person. Choose the one that matches the job, or say it is more than one.",
  config
})}
<section><div class="wrap"><div class="grid">
${services.map((service) => `<a class="card card-link" href="/services/${service.slug}/"><div><h2>${esc(service.name)}</h2><p>${esc(service.lede)}</p></div></a>`).join("")}
</div></div></section>`;

writePage("/services/", renderPage({
  config, areas, services, posts,
  path: "/services/",
  title: "Painting and Decorating Services | MC Decorating",
  description: "Interior painting, exterior painting, wallpapering, ceiling and wall repairs, and commercial decorating from MC Decorating in Omagh.",
  main: servicesMain,
  extraLd: [crumbNode([{ name: "Home", href: "/" }, { name: "Services", href: "/services/" }], config)]
}), { priority: "0.8" });

for (const service of services) {
  const related = sortJobs(jobs).filter((job) => job.services.includes(service.slug)).slice(0, 4);
  const path = `/services/${service.slug}/`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services/" },
    { name: service.name, href: path }
  ];
  const imageJob = service.image ? byId[service.image] : related[0];
  const main = `${pageHero({ crumbs, title: service.h1, lede: service.lede, config })}
<section><div class="wrap">
  <div class="prose">${fill(service.html, config)}</div>
  ${related.length ? `<h2>Recent ${esc(service.name.toLowerCase())}</h2><p>These photographs show the work. They are not labelled by town.</p>${shots(related)}` : ""}
  <p>Looking for a decorator in a particular town? See the <a href="/areas/">areas we cover</a>, or go straight to a <a href="/get-a-quote/">free quote</a>.</p>
  ${quoteBand(config)}
</div></section>`;
  writePage(path, renderPage({
    config, areas, services, posts,
    path,
    title: service.title,
    description: service.description,
    image: imageJob ? `/images/jobs/${imageJob.src}.jpg` : "/logo.png",
    main,
    extraLd: [
      crumbNode(crumbs, config),
      {
        "@type": "Service",
        name: service.name,
        serviceType: service.name,
        url: config.baseUrl + path,
        description: service.description,
        provider: { "@id": `${config.baseUrl}/#business` },
        areaServed: ["County Tyrone", "County Fermanagh"]
      }
    ]
  }), { priority: "0.7", images: related });
}

const galleryMain = `${pageHero({
  crumbs: [{ name: "Home", href: "/" }, { name: "Our work", href: "/our-work/" }],
  title: "Our work",
  lede: "Recent decorating by Martin Kelly. Before and after photographs are first. None of these pictures are labelled with a town.",
  config
})}
<section><div class="wrap">
  <div class="filters" role="toolbar" aria-label="Filter photographs">
    <button type="button" aria-pressed="true" data-filter="all">All</button>
    <button type="button" aria-pressed="false" data-filter="before-after">Before and after</button>
    <button type="button" aria-pressed="false" data-filter="wallpapering">Wallpapering</button>
    <button type="button" aria-pressed="false" data-filter="interior-painting">Interior painting</button>
    <button type="button" aria-pressed="false" data-filter="ceiling-wall-repairs">Repairs</button>
  </div>
  <p id="gallery-status" class="meta" aria-live="polite">Showing ${jobs.length} jobs</p>
  <div class="shots" id="gallery-grid" data-rendered="${esc(jobs.map((job) => job.id).join(","))}">
    ${jobs.map((job) => jobFigure(job, { link: "photo" })).join("")}
  </div>
  <p>More finishes go up on <a href="${esc(config.facebook)}" rel="noopener noreferrer">Facebook</a> as they are photographed. Exterior jobs are not in this set yet.</p>
  ${quoteBand(config)}
</div></section>`;

writePage("/our-work/", renderPage({
  config, areas, services, posts,
  path: "/our-work/",
  title: "Our Work | Painting and Wallpapering | MC Decorating",
  description: "Photographs of recent painting, wallpapering and repair jobs by MC Decorating, including before and after pictures of kitchens, halls, bedrooms and cloakrooms.",
  image: `/images/jobs/${homeJobs[0].src}.jpg`,
  main: galleryMain,
  dialog: true,
  scripts: ["/js/gallery.js"],
  extraLd: [
    crumbNode([{ name: "Home", href: "/" }, { name: "Our work", href: "/our-work/" }], config),
    {
      "@type": "ImageGallery",
      name: "MC Decorating recent work",
      url: `${config.baseUrl}/our-work/`,
      image: jobs.map((job) => `${config.baseUrl}/images/jobs/${job.src}.jpg`)
    }
  ]
}), { priority: "0.8", images: jobs });

const areasMain = `${pageHero({
  crumbs: [{ name: "Home", href: "/" }, { name: "Areas we cover", href: "/areas/" }],
  title: "Areas we cover",
  lede: "Omagh is home. The pages below are the main towns in Tyrone and Fermanagh within reach. Plenty of villages in between are covered without a page of their own.",
  config
})}
<section><div class="wrap">
  <div class="prose">
    <p>Martin is based in Omagh and works across County Tyrone and County Fermanagh. On his Facebook page he describes the business as Tyrone and Fermanagh, north or south. In practice that means he also takes jobs across the border, including into County Donegal, when the travel suits the work. It does not mean a standing round of the whole of Ireland.</p>
    <p>If your town is not listed, you can still ask. Beragh, Sixmilecross, Seskinore, Trillick, Drumquin, Ballygawley, Ederney, Tempo, Derrygonnelly, Maguiresbridge and Lifford all sit on roads he already drives. Name the place on the quote form.</p>
  </div>
  <div class="grid">
    ${areas.map((area) => `<a class="card card-link" href="/areas/${area.slug}/"><div><h2>${esc(area.name)}</h2><p class="meta">${esc(area.county)}</p><p>${esc(area.lede)}</p></div></a>`).join("")}
  </div>
  <h2>Where Omagh sits</h2>
  <iframe loading="lazy" title="Map of Omagh, County Tyrone" src="https://www.google.com/maps?q=Omagh,+County+Tyrone&amp;output=embed"></iframe>
  ${quoteBand(config)}
</div></section>`;

writePage("/areas/", renderPage({
  config, areas, services, posts,
  path: "/areas/",
  title: "Areas We Cover | Tyrone and Fermanagh | MC Decorating",
  description: "Painter and decorator covering Omagh and towns across County Tyrone and County Fermanagh, plus cross-border work when the job suits. Free quotes.",
  main: areasMain,
  extraLd: [crumbNode([{ name: "Home", href: "/" }, { name: "Areas we cover", href: "/areas/" }], config)]
}), { priority: "0.8" });

const featuredBeforeAfter = jobs.filter((job) => job.beforeAfter && job.featured);
areas.forEach((area, index) => {
  const path = `/areas/${area.slug}/`;
  const start = (index * 3) % featuredBeforeAfter.length;
  const picked = [0, 1, 2].map((step) => featuredBeforeAfter[(start + step) % featuredBeforeAfter.length]);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Areas we cover", href: "/areas/" },
    { name: area.name, href: path }
  ];
  const neighbours = area.neighbours.map((slug) => areaBySlug[slug]);
  const main = `${pageHero({ crumbs, title: area.h1, lede: area.lede, config })}
<section><div class="wrap">
  <div class="prose">${fill(area.html, config)}
    <h2>Services that come up in ${esc(area.name)}</h2>
    ${serviceLinks(area.services)}
    <h2>Nearby</h2>
    <ul>${neighbours.map((neighbour) => `<li><a href="/areas/${neighbour.slug}/">${esc(neighbour.name)}</a>, ${esc(neighbour.county)}</li>`).join("")}</ul>
    <p><a href="/areas/">All areas we cover</a></p>
  </div>
  <h2>Recent jobs</h2>
  <p>A few before and after photographs from the gallery. They show the kind of decorating Martin does. They are not labelled as ${esc(area.name)} jobs.</p>
  ${shots(picked)}
  ${quoteBand(config)}
</div></section>`;
  writePage(path, renderPage({
    config, areas, services, posts,
    path,
    title: area.title,
    description: area.description,
    image: `/images/jobs/${picked[0].src}.jpg`,
    main,
    extraLd: [crumbNode(crumbs, config)]
  }), { priority: "0.7", images: picked });
});

const quoteCrumbs = [{ name: "Home", href: "/" }, { name: "Get a free quote", href: "/get-a-quote/" }];
const quoteMain = `${pageHero({
  crumbs: quoteCrumbs,
  title: "Get a free quote",
  lede: "Tell Martin the job, the town and roughly when you would like it done. He will come back to you. There is no obligation.",
  config,
  actions: false
})}
<section><div class="wrap">
  <div class="prose">
    <p>Call <a href="tel:${esc(config.phoneTel)}">${esc(config.phoneDisplay)}</a>, <a href="${esc(config.whatsapp)}">WhatsApp</a> or email <a href="mailto:${esc(config.email)}">${esc(config.email)}</a> if that is easier than the form. If you have photos of the room, WhatsApp is the useful one.</p>
    <p>He covers Omagh and the towns on the <a href="/areas/">areas</a> pages, plus villages in between, and cross-border work when it suits.</p>
  </div>
  <div class="quote-panel" id="quote">${quoteForm(config, "quote")}</div>
</div></section>`;

writePage("/get-a-quote/", renderPage({
  config, areas, services, posts,
  path: "/get-a-quote/",
  title: "Get a Free Quote | MC Decorating Omagh",
  description: "Ask Martin Kelly for a free painting or decorating quote in Omagh, Tyrone or Fermanagh. Call 07907 588 541 or send the form.",
  main: quoteMain,
  extraLd: [
    crumbNode(quoteCrumbs, config),
    { "@type": "ContactPage", name: "Get a free quote", url: `${config.baseUrl}/get-a-quote/` }
  ]
}), { priority: "0.9" });

const blogCrumbs = [{ name: "Home", href: "/" }, { name: "Advice", href: "/blog/" }];
const blogMain = `${pageHero({
  crumbs: blogCrumbs,
  title: "Advice for homeowners",
  lede: "Practical notes on painting, wallpaper and the weather in Tyrone and Fermanagh. Prices mentioned in the cost article are published UK guides, not quotes from Martin.",
  config
})}
<section><div class="wrap"><div class="post-list">
${posts.map((post) => `<article class="post-card"><p class="meta"><time datetime="${esc(post.date)}">${prettyDate(post.date)}</time></p><h2><a href="/blog/${post.slug}/">${esc(post.title)}</a></h2><p>${esc(post.description)}</p><p><a href="/blog/${post.slug}/">Read the article</a></p></article>`).join("")}
</div></div></section>`;

writePage("/blog/", renderPage({
  config, areas, services, posts,
  path: "/blog/",
  title: "Painting and Decorating Advice | MC Decorating",
  description: "Advice for homeowners in Tyrone and Fermanagh on painting costs, exterior paint for damp weather, and preparing walls for wallpaper.",
  main: blogMain,
  extraLd: [crumbNode(blogCrumbs, config)]
}), { priority: "0.6" });

for (const post of posts) {
  const path = `/blog/${post.slug}/`;
  const body = fill(readFileSync(join(root, "content/posts", `${post.slug}.html`), "utf8"), config);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Advice", href: "/blog/" },
    { name: post.title, href: path }
  ];
  const others = posts.filter((item) => item.slug !== post.slug);
  const main = `${pageHero({
    crumbs,
    title: post.title,
    lede: post.description,
    config
  })}
<article><div class="wrap prose">
  <p class="meta"><time datetime="${esc(post.date)}">${prettyDate(post.date)}</time></p>
  ${body}
  <h2>More advice</h2>
  <ul>${others.map((item) => `<li><a href="/blog/${item.slug}/">${esc(item.title)}</a></li>`).join("")}</ul>
</div></article>
<section><div class="wrap">${quoteBand(config)}</div></section>`;
  const image = post.image ? `/images/jobs/${byId[post.image].src}.jpg` : "/logo.png";
  writePage(path, renderPage({
    config, areas, services, posts,
    path,
    title: `${post.title} | MC Decorating`,
    description: post.description,
    image,
    ogType: "article",
    main,
    extraLd: [
      crumbNode(crumbs, config),
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        mainEntityOfPage: config.baseUrl + path,
        author: { "@type": "Organization", name: config.name, url: `${config.baseUrl}/` },
        publisher: { "@id": `${config.baseUrl}/#business` },
        image: config.baseUrl + image
      }
    ]
  }), { lastmod: post.date, priority: "0.5", images: post.image ? [byId[post.image]] : [] });
}

const notFound = renderPage({
  config, areas, services, posts,
  path: "/404.html",
  title: "Page not found | MC Decorating",
  description: "That page is not on the MC Decorating site. Go back to the homepage, the services, or ask for a quote.",
  main: `${pageHero({
    crumbs: [{ name: "Home", href: "/" }, { name: "Page not found", href: "/404.html" }],
    title: "That page is not here",
    lede: "The link may be out of date. The painting and decorating pages are all linked below.",
    config
  })}
  <section><div class="wrap prose">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/services/">Services</a></li>
      <li><a href="/our-work/">Our work</a></li>
      <li><a href="/areas/">Areas we cover</a></li>
      <li><a href="/blog/">Advice</a></li>
      <li><a href="/get-a-quote/">Get a free quote</a></li>
    </ul>
  </div></section>`
});
writeFile("404.html", notFound);

const urlset = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemap.map((page) => `  <url>
    <loc>${xml(page.loc)}</loc>
    <lastmod>${xml(page.lastmod)}</lastmod>
${page.images.map((job) => `    <image:image>
      <image:loc>${xml(`${config.baseUrl}/images/jobs/${job.src}.jpg`)}</image:loc>
      <image:title>${xml(job.title)}</image:title>
      <image:caption>${xml(job.caption)}</image:caption>
    </image:image>`).join("\n")}
  </url>`).join("\n")}
</urlset>
`;
writeFile("sitemap.xml", urlset);

function postHtml(post) {
  return fill(readFileSync(join(root, "content/posts", `${post.slug}.html`), "utf8"), config);
}

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>MC Decorating advice</title>
  <link>${xml(`${config.baseUrl}/blog/`)}</link>
  <atom:link href="${xml(`${config.baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
  <description>Practical painting and decorating advice for homeowners in Tyrone and Fermanagh, from MC Decorating in Omagh.</description>
  <language>en-GB</language>
  <lastBuildDate>${new Date(`${config.siteUpdated}T09:00:00Z`).toUTCString()}</lastBuildDate>
${posts.map((post) => `  <item>
    <title>${xml(post.title)}</title>
    <link>${xml(`${config.baseUrl}/blog/${post.slug}/`)}</link>
    <guid isPermaLink="true">${xml(`${config.baseUrl}/blog/${post.slug}/`)}</guid>
    <pubDate>${new Date(`${post.date}T09:00:00Z`).toUTCString()}</pubDate>
    <description>${xml(post.description)}</description>
    <content:encoded><![CDATA[${postHtml(post)}]]></content:encoded>
  </item>`).join("\n")}
</channel>
</rss>
`;
writeFile("feed.xml", rss);

const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>MC Decorating advice</title>
  <link href="${xml(`${config.baseUrl}/blog/`)}"/>
  <link rel="self" href="${xml(`${config.baseUrl}/atom.xml`)}"/>
  <updated>${config.siteUpdated}T09:00:00Z</updated>
  <id>${xml(`${config.baseUrl}/blog/`)}</id>
  <author><name>MC Decorating</name></author>
${posts.map((post) => `  <entry>
    <title>${xml(post.title)}</title>
    <link href="${xml(`${config.baseUrl}/blog/${post.slug}/`)}"/>
    <id>${xml(`${config.baseUrl}/blog/${post.slug}/`)}</id>
    <updated>${post.date}T09:00:00Z</updated>
    <summary>${xml(post.description)}</summary>
    <content type="html"><![CDATA[${postHtml(post)}]]></content>
  </entry>`).join("\n")}
</feed>
`;
writeFile("atom.xml", atom);

const robots = config.robotsDisallowAll
  ? "User-agent: *\nDisallow: /\n"
  : `User-agent: *\nAllow: /\n\nSitemap: ${config.baseUrl}/sitemap.xml\n`;
writeFile("robots.txt", robots);

console.log(`Built ${sitemap.length} pages, ${jobs.length} gallery jobs, ${posts.length} posts.`);
