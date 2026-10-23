# MC Decorating

Website for MC Decorating, Martin Kelly's painting and decorating business in Omagh, County Tyrone. It is a static site for GitHub Pages. The aim is to get local people to ask for a quote, not to sell from a shop.

The live hostname, until the final domain is chosen, is `mcdecorating.wholelottasites.co.uk`. Do not change `CNAME` until that domain is actually pointed here.

## Contact details in use

These are the only contact details on the site. They live in `site.config.json`.

- Phone: 07907 588 541
- Email: martink.kelly@yahoo.co.uk
- WhatsApp: https://wa.me/447907588541
- Facebook: https://www.facebook.com/p/MC-Decorating-61573444553395/

The quote form posts to FormSubmit at `chris@wholelottasites.co.uk` and copies `martink.kelly@yahoo.co.uk`. That is the existing delivery setup. Do not point it at a new address unless you mean to.

## Change the domain

`site.config.json` is the only place the public site address is set.

1. Set `baseUrl` to the new origin, with `https://` and no trailing slash. For example `https://mcdecoratingomagh.co.uk`.
2. Run `node scripts/build.mjs`.

That rewrites canonical URLs, Open Graph tags, the sitemap, both feeds, the business schema, and the form's return address. It does not change `CNAME`. Change `CNAME` only when DNS for the new hostname is ready.

## Add a gallery job

The gallery page reads `data/jobs.json`. Appending a job there updates the gallery in the browser without editing HTML. Homepage, service pages and area pages pick up new photographs when you rebuild.

1. Optimise the photo. This needs `sharp` (`npm install --no-save sharp`), then:

   ```
   node scripts/optimise-image.mjs path/to/photo.jpg kitchen-units-june
   ```

   That writes `images/jobs/kitchen-units-june.webp` and `.jpg`, strips camera location data, and prints a JSON stub.
2. Fill in `title`, `alt` and `caption`. Describe what is actually in the picture. Do not name a town unless you know the job was there.
3. Set `services` to one or more of `interior-painting`, `exterior-painting`, `wallpapering`, `ceiling-wall-repairs`, `commercial-decorating`.
4. Set `beforeAfter` to `true` for a collage, and `featured` to `true` if it should lead the gallery. Higher `weight` sorts earlier within that group.
5. Append the object to `data/jobs.json`.
6. Run `node scripts/build.mjs` so the homepage, service pages, area pages and sitemap include it.
7. Commit the image files, `data/jobs.json`, and the rebuilt HTML.

## Add an advice article

1. Write `content/posts/your-slug.html`. This is the article body only: paragraphs, headings and lists, no header or footer.
2. Add an object to `data/posts.json` with `slug`, `title`, `description`, `date` (`YYYY-MM-DD`), and optional `image` (a job `src` from the gallery, or leave it out).
3. Run `node scripts/build.mjs`.

That creates `/blog/your-slug/`, updates the advice index, `feed.xml`, `atom.xml` and `sitemap.xml`.

Do not invent prices, testimonials, review counts, years in business, accreditations or customer names. The cost article may quote published UK guides only when it says clearly that they are not Martin's prices.

## Build and check

```
node scripts/build.mjs
node scripts/check.mjs
```

`check` confirms internal links, one heading per page, the FormSubmit action, the noindex tag, the restrictive `robots.txt`, `CNAME`, gallery images, and that the sitemap matches real pages.

Generated HTML is what GitHub Pages serves. Source copy for towns, services and articles lives in `content/`. The gallery data lives in `data/jobs.json`.

## Launch checklist

Indexing is off on purpose. Leave it off until the final domain is the one visitors and Google should see.

When that domain is chosen (`mcdecoratingomagh.co.uk`, `mcdecoratingni.co.uk`, or another):

1. Point DNS at GitHub Pages for the new hostname.
2. Replace the contents of `CNAME` with that hostname and nothing else. Do this only once DNS is ready.
3. In `site.config.json`, set `baseUrl` to `https://` plus that hostname, with no trailing slash.
4. Set `"noindex": false`.
5. Set `"robotsDisallowAll": false`.
6. Run `node scripts/build.mjs`.
7. Confirm a page's source:
   - canonical and `og:url` use the new domain
   - the robots meta tag says `index, follow`
   - the quote form `_next` field uses the new domain
8. Confirm `robots.txt` is now:

   ```
   User-agent: *
   Allow: /

   Sitemap: https://YOUR-DOMAIN/sitemap.xml
   ```

9. Send a test through the quote form and confirm it arrives for Martin (and at the FormSubmit inbox named in `formAction`).
10. On a phone, use the call button and the WhatsApp button.
11. In Google Search Console and Bing Webmaster Tools, add the property and submit `sitemap.xml`.

Until those flags are flipped, every page keeps `<meta name="robots" content="noindex, nofollow">` and `robots.txt` disallows all crawlers. The sitemap is still published so it is ready.

## What this site deliberately does not say

- No new testimonials. The three Facebook recommendations already on the old pages (Sinead McGloin, Tommy Garvey, Emma O'Sullivan) are unchanged. Facebook comments are not used as reviews.
- No star ratings or review counts. The lines "100% recommended on Facebook" and "1,795 Facebook followers" are the wording already published on the site. A logged-out look at the Facebook page in October 2026 showed "1.7K followers", which agrees roughly but was not used to invent a new precise number.
- No prices for Martin's work. The cost article cites Checkatrade and Screwfix UK guides and says they are not local quotes.
- No years in business, qualifications, or insurance claims.
- No opening hours. Facebook showed "Always open", which was not treated as real hours.
- No street address. He is not a shop. The map is of Omagh, the town he is based in.
- No exterior photographs yet. The gallery says so. Add them through `data/jobs.json` when they exist.

## Notes from the build

- An older Facebook post mentioned `painteromagh.co.uk`. That address is not used here and was not checked as a live site.
- Facebook photograph dates in the source material were approximate, so they are not printed on the gallery.
- Where an email photograph and a Facebook capture showed the same view, the sharper email file was kept. Before-and-after collages from Facebook were added when they were not already in the email set.
- The kitchen pictures show painted walls and a splashback that is multicoloured in the earlier photo and white in the finished photo. The oak units look unchanged. The captions describe that. They do not claim a separate tiling service.
- Oak slat panelling is described as part of the finished loft room he published, alongside the wallpaper.
- Drive times on the town pages are approximate.
- County Donegal stays in the area list because the previous site said so and because his Facebook introduction says he works north or south of the border. There is no Donegal town page.
