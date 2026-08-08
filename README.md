<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f07d2891-28df-41b5-a578-66feff327b73

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Optional for SEO: set `PUBLIC_GOOGLE_SITE_VERIFICATION` in `.env.local` with your Google Search Console token
4. Run the app:
   `npm run dev`

## SEO Autopilot

Use this command to run the full SEO automation pipeline:

`npm run seo:autopilot`

This will:
- build the Astro site
- run page-level SEO guard checks (title, description, H1, word count, duplicate metadata)
- run source-level metadata checks
- validate sitemap generation and robots sitemap reference
