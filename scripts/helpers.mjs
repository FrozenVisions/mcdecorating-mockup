export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function xml(value) {
  return esc(value);
}

export function fill(html, config) {
  return html
    .replaceAll("{{facebook}}", config.facebook)
    .replaceAll("{{phone}}", config.phoneDisplay)
    .replaceAll("{{phoneTel}}", config.phoneTel)
    .replaceAll("{{email}}", config.email)
    .replaceAll("{{whatsapp}}", config.whatsapp)
    .replaceAll("{{baseUrl}}", config.baseUrl);
}

export function sortJobs(jobs) {
  return jobs.slice().sort((a, b) => {
    const ba = Number(b.beforeAfter) - Number(a.beforeAfter);
    if (ba) return ba;
    const ft = Number(b.featured) - Number(a.featured);
    if (ft) return ft;
    const w = (b.weight || 0) - (a.weight || 0);
    if (w) return w;
    return a.title.localeCompare(b.title, "en-GB");
  });
}

export function picture(job, { lazy = true } = {}) {
  const load = lazy
    ? 'loading="lazy" decoding="async"'
    : 'fetchpriority="high" decoding="async"';
  return `<picture>
    <source srcset="/images/jobs/${esc(job.src)}.webp" type="image/webp">
    <img src="/images/jobs/${esc(job.src)}.jpg" alt="${esc(job.alt)}" width="${job.width}" height="${job.height}" ${load}>
  </picture>`;
}

export function jobFigure(job, { link = "gallery" } = {}) {
  const href = link === "photo" ? `/images/jobs/${job.src}.jpg` : `/our-work/#${job.id}`;
  const badge = job.beforeAfter ? '<span class="badge">Before and after</span>' : "";
  const services = (job.services || []).join(" ");
  return `<figure class="shot" id="${esc(job.id)}" data-ba="${job.beforeAfter ? "true" : "false"}" data-services="${esc(services)}">
    <a class="shot-open" href="${esc(href)}">
      ${picture(job)}
      ${badge}
    </a>
    <figcaption><strong>${esc(job.title)}</strong><span>${esc(job.caption)}</span></figcaption>
  </figure>`;
}

export function crumbHtml(items) {
  const lis = items.map((item, index) => {
    const last = index === items.length - 1;
    if (last) return `<li><span aria-current="page">${esc(item.name)}</span></li>`;
    return `<li><a href="${esc(item.href)}">${esc(item.name)}</a></li>`;
  }).join("");
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${lis}</ol></nav>`;
}

export function pageHero({ crumbs, title, lede, config, actions = true }) {
  const buttons = actions
    ? `<p class="hero-actions"><a class="btn" href="/get-a-quote/">Get a free quote</a> <a class="btn alt" href="tel:${esc(config.phoneTel)}">Call ${esc(config.phoneDisplay)}</a></p>`
    : "";
  return `<div class="page-hero"><div class="wrap">${crumbs ? crumbHtml(crumbs) : ""}<h1>${esc(title)}</h1><p class="lede">${esc(lede)}</p>${buttons}</div></div>`;
}

export function quoteBand(config) {
  return `<aside class="quote-band">
    <div>
      <h2>Get a free quote</h2>
      <p>Tell Martin the job, the town and roughly when you would like it done. There is no obligation. Call ${esc(config.phoneDisplay)} if you would rather talk it through.</p>
    </div>
    <div class="quote-band-actions">
      <a class="btn" href="/get-a-quote/">Get a free quote</a>
      <a class="btn alt" href="tel:${esc(config.phoneTel)}">Call ${esc(config.phoneDisplay)}</a>
    </div>
  </aside>`;
}

export function quoteForm(config, idPrefix) {
  const next = `${config.baseUrl}${idPrefix === "home" ? "/?quote=sent#quote" : "/get-a-quote/?quote=sent"}`;
  const field = (name, label, control) => `<div class="field"><label for="${idPrefix}-${name}">${label}</label>${control}</div>`;
  return `<form class="quote-form" id="${idPrefix}-quote-form" action="${esc(config.formAction)}" method="POST">
    <input type="hidden" name="_cc" value="${esc(config.formCc)}">
    <input type="hidden" name="_subject" value="${esc(config.formSubject)}">
    <input type="hidden" name="_template" value="table">
    <input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="_next" value="${esc(next)}">
    <p class="hp" aria-hidden="true"><label for="${idPrefix}-company">Company</label><input id="${idPrefix}-company" type="text" name="_honey" tabindex="-1" autocomplete="off"></p>
    <div class="form-row two">
      ${field("name", "Your name", `<input id="${idPrefix}-name" required name="name" autocomplete="name">`)}
      ${field("phone", "Phone number", `<input id="${idPrefix}-phone" required type="tel" name="phone" autocomplete="tel" inputmode="tel">`)}
    </div>
    ${field("email", "Email, if you have one", `<input id="${idPrefix}-email" type="email" name="email" autocomplete="email">`)}
    <div class="form-row two">
      ${field("service", "Job type", `<select id="${idPrefix}-service" required name="service"><option value="" selected disabled>Choose a job</option><option>Interior painting</option><option>Exterior painting</option><option>Wallpapering</option><option>Ceiling and wall repairs</option><option>Commercial decorating</option><option>More than one of these</option><option>Something else</option></select>`)}
      ${field("town", "Town", `<input id="${idPrefix}-town" required name="town" autocomplete="address-level2" placeholder="For example Omagh, Enniskillen, Strabane">`)}
    </div>
    ${field("timescale", "Rough timescale", `<select id="${idPrefix}-timescale" required name="timescale"><option value="" selected disabled>When would you like it done?</option><option>As soon as you can</option><option>Within a month</option><option>In the next 1 to 3 months</option><option>Just planning ahead</option><option>Not sure yet</option></select>`)}
    ${field("message", "Message, optional", `<textarea id="${idPrefix}-message" name="message" rows="5" placeholder="Rooms, whether paper needs to come off, and anything that should be made good first"></textarea>`)}
    <p class="quote-error note" role="alert" hidden></p>
    <button class="btn" type="submit">Request my quote</button>
    <p class="fine">This sends your request by email so Martin can reply about the quote. He uses these details for that, and nothing else.</p>
  </form>
  <div class="quote-thanks card" hidden>
    <h3>Thanks, your request has been sent</h3>
    <p>Martin will be in touch shortly to arrange your free quote. If it is urgent, call ${esc(config.phoneDisplay)}.</p>
  </div>`;
}

export function businessNode(config, areas) {
  return {
    "@type": ["HousePainter", "LocalBusiness"],
    "@id": `${config.baseUrl}/#business`,
    name: config.name,
    url: `${config.baseUrl}/`,
    telephone: config.phoneTel,
    email: config.email,
    image: [`${config.baseUrl}/logo.png`, `${config.baseUrl}/images/jobs/hallway-marble.jpg`],
    logo: `${config.baseUrl}/logo.png`,
    founder: { "@type": "Person", name: config.founder },
    address: {
      "@type": "PostalAddress",
      addressLocality: config.addressLocality,
      addressRegion: config.addressRegion,
      addressCountry: config.addressCountry
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.geo.latitude,
      longitude: config.geo.longitude
    },
    areaServed: [
      ...areas.map((area) => ({ "@type": "City", name: area.schemaName || area.name })),
      { "@type": "AdministrativeArea", name: "County Tyrone", addressCountry: "GB" },
      { "@type": "AdministrativeArea", name: "County Fermanagh", addressCountry: "GB" },
      { "@type": "AdministrativeArea", name: "County Donegal", addressCountry: "IE" }
    ],
    sameAs: [config.facebook],
    description: "Painter and decorator based in Omagh, working across County Tyrone and County Fermanagh, and across the border when the job suits."
  };
}

export function crumbNode(items, config) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: config.baseUrl + item.href
    }))
  };
}

export function ldScript(nodes) {
  const payload = { "@context": "https://schema.org", "@graph": nodes };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>`;
}

export const ICONS = {
  facebook: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V14h2.7v8z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.2z"/></svg>'
};
