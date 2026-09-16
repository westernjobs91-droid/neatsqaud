# Neat Squad — Cleaning Company Website

A fast, SEO-focused static website for Neat Squad, a house/office/exterior cleaning
company serving the Greater Toronto Area. Built with [Eleventy](https://www.11ty.dev/)
(static site generator, zero client-side framework) for speed and search performance.

## Structure

- 5 service pages (`/services/<slug>/`) generated from `src/_data/services.json`
- 10 GTA city pages (`/service-areas/<slug>/`) generated from `src/_data/locations.json`
- Home, About, Gallery, FAQ, Contact, Blog (3 starter posts), Privacy Policy, Terms
- JSON-LD structured data (LocalBusiness, Service, FAQPage, BreadcrumbList, BlogPosting)
  on every relevant page, an auto-generated `sitemap.xml`, and `robots.txt`
- No client-side JS framework, no web fonts — just semantic HTML, one CSS file, and a
  small vanilla JS file for the mobile nav and the quote form — kept intentionally light
  for strong Core Web Vitals scores.

## Local development

```bash
npm install
npm run serve   # local dev server with live reload at http://localhost:8080
npm run build   # outputs the production site to _site/
```

## Before you launch — replace these placeholders

1. **Contact info & address** — `src/_data/site.js` (`phone`, `phoneHref`, `email`, `address`).
   These feed the header, footer, contact page, and the LocalBusiness schema.
2. **Domain** — `src/_data/site.js` (`site.url`) and the `Sitemap:` line in `src/robots.txt`.
3. **Social links** — `src/_data/site.js` (`social.facebook` / `instagram` / `google`).
4. **Real photos** — `src/gallery.njk` has placeholder before/after panels (`.ba-visual`
   blocks); swap in real project photos as soon as you have them — this matters a lot for
   a cleaning business, more than almost anything else on the site.
5. **Testimonials** — the two sample testimonial cards on the homepage (`src/index.njk`)
   are explicitly marked as placeholders. Replace them with real customer quotes once you
   have some; don't leave placeholder-flagged content live for long.
6. **Trust claims** (insurance, bonding, background checks, WSIB, certifications, years
   in business) were deliberately left **out** of the copy since this is a new business
   and none of that was confirmed. Once any of these are actually true, add them — they
   are strong conversion boosters — but only state what's real; fabricated trust signals
   can get a site penalized by Google and burn customer trust if discovered.
7. **Social image** — `src/images/og-image.svg` is an SVG placeholder for social share
   previews. Many platforms (e.g. iMessage, some Facebook/LinkedIn crawlers) don't render
   SVG previews — export a 1200×630 PNG/JPG version for full compatibility.
8. **Quote form env vars** — the contact form posts to the Vercel serverless function at
   `api/contact.js`, which emails the lead via [Resend](https://resend.com). In your Vercel
   project's Settings → Environment Variables, set:
   - `RESEND_API_KEY` — from a free Resend account (no domain verification needed to start;
     it uses Resend's shared `onboarding@resend.dev` sender out of the box)
   - `CONTACT_TO_EMAIL` — the inbox that should receive quote requests
   Until both are set, the form will show a friendly "please call or email us" message
   instead of failing silently.

## Deployment (Vercel)

1. Push this repo to GitHub (already done if you're reading this from the repo) and import
   it in the [Vercel dashboard](https://vercel.com/new), or run `vercel` from the project
   root with the Vercel CLI.
2. `vercel.json` already sets the build command (`npm run build`) and output directory
   (`_site`) — no manual config needed. The `api/contact.js` serverless function is picked
   up automatically.
3. Add the two environment variables above in the Vercel project settings, then redeploy
   (env var changes don't apply to already-built deployments).
4. Once you have a real domain, add it in Vercel's Domains tab, then update `site.url` in
   `src/_data/site.js` and the `Sitemap:` line in `src/robots.txt` to match.

## SEO notes

- Every page has a unique, keyword-targeted title/meta description.
- Service and location pages cross-link to each other for internal linking strength.
- After launch: submit `sitemap.xml` in Google Search Console, set up a Google Business
  Profile for local map-pack rankings (this matters as much as the website itself for
  "near me" searches), and start collecting real Google reviews.
