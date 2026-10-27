# Howard Huang — portfolio

Two front doors onto the same work. Static HTML, no build step, no dependencies.
Open `index.html`, or drop the folder on any static host (GitHub Pages, Netlify, Vercel, S3).

| Page | What it is |
|---|---|
| `index.html` | **Default.** Statement, selected work, contact. |
| `about.html` | The personal page — bio, what I do outside design, experience, education, photos. |
| `npo-connect.html` | Full UX case study for NPO Connect. |
| `spotify.html` | Spotify Userflow Redesign case study — the same content as the Batcave's Spotify case (`SP_*` objects in `batcave.html`), laid out for the standard site. Spotify-today screenshots are optional: save them as `assets/work/spotify-orig-1.png … -6.png` and the comparison toggles appear on their own. |
| `batcave.html` | The explorable pixel-art Batcave experience. |

The two modes link to each other: a **Batcave** button sits in the header and footer of the
standard site, and a **← Standard view** link sits at the bottom of the cave.

## Structure

```
.
├── index.html              standard site (default landing page)
├── about.html              personal page
├── npo-connect.html        case study
├── spotify.html            case study (same content as the Batcave's Spotify case)
├── batcave.html            interactive experience
└── assets/
    ├── site.css            styles for every page except the batcave
    ├── site.js             bat transition, bat cursor, hover-to-play covers, footer bats
    ├── fonts/              self-hosted woff2 (Archivo, JetBrains Mono,
    │                       Instrument Serif, Chakra Petch, DM Mono)
    ├── images/             batcave scene artwork (7 scenes)
    ├── logos/              company logo chips
    ├── work/               project + experience imagery
    ├── audio/              cave ambience, theme, UI click (batcave only)
    └── ui/                 bezel, cursors, bat mark
```

`batcave-standalone.html` (~12 MB) is the cave with every asset embedded in one file — handy
for emailing or running off a USB stick. It is **not** in the repo build; it would roughly
triple the repo for a duplicate of a page that already works.

## The standard site

**Colour** — warm charcoal, not cold blue-black: Gotham under sodium light. One accent,
`--signal` (`#F2B705`), reserved strictly for interactive things and the single typographic
moment in the hero. Everything else is warm neutral.

**Type** — Instrument Serif carries the voice (hero, section headings, project titles, the
creed), Archivo the body, JetBrains Mono the meta. All self-hosted from `assets/fonts/`, so
there is no third-party request and the pages render correctly offline and over `file://`.

**Signature** — the bat logo traced into ASCII line art (`.ascii`), sitting above the creed
near the foot of both pages. Plus a sodium streetlamp that follows the cursor (`.spotlight`),
disabled on touch and under `prefers-reduced-motion`.

**Voice** — first person, lowercase nav, short paragraphs. `about.html` is where the
personality lives; `index.html` gets out of the way of the work.

### Editing content

All copy is plain HTML in `index.html` — there is no data object to learn.

- A project is one `<article class="work-item">`: thumbnail, index, title, year, one sentence,
  `<ul class="tags">`, then either a `.go` link to a case study or a `.wip` status.
- A job or a school is one `<div class="tl-row">` in `about.html`: org, role, dates.
- Links are still placeholders — search for `data-link=` in `index.html` and `about.html` and
  drop in the real URLs for LinkedIn, GitHub and your résumé.
- The ASCII bat is generated from `assets/ui/bat.png`; it is plain text inside
  `<pre class="ascii">`, so you can edit it by hand.

### Adding a case study

Copy `npo-connect.html`, change the content, and point the project's `.go` link at it. The
section pattern is:

```html
<section class="case-sec">
  <span class="tag">Research</span>
  <h2>Heading</h2>
  <p>…</p>
  <p class="pull">A finding worth isolating.</p>
  <figure><img src="…"><figcaption>…</figcaption></figure>
  <figure class="duo"><img><img><figcaption>…</figcaption></figure>
</section>
```

## Interactions (assets/site.js)

- **Bat transition** — any link with `data-bat` (the Batcave buttons, and "← Standard view" in the cave)
  spins a bat over the screen before navigating; the next page opens on black and spins it back out.
  The second half needs a real web server (GitHub Pages is fine) — it is skipped over `file://`.
- **Cursor** — the Batcave's bat logo, turning into the cowl over anything clickable.
- **Project covers** — a still at rest, the prototype flow video on hover (`.cover-swap`).
- **Footer bats** — scatter from the cursor, drag to move, double-click to reset.

## The batcave

A still of the cave with an ambient FX layer over it — monitor flicker, scanlines, rack LEDs,
armory strip lights, the waterfall and splash, drifting bats and their red eyes. All of it is
configured in the `SCENE_FX` object.

| What | Where |
|---|---|
| Colours | CSS variables at the top of `<style>` |
| Ambient FX | the `SCENE_FX` object, per scene |
| Area outlines | the `<svg class="zones">` block in the overview scene |
| Drill-in markers | the `<g class="zone">` groups in each area scene |
| Audio levels | the `LVL` object in the audio module |
| Alfred's dialogue | the `DIALOGUE` object |

FX and hotspot coordinates are percentages of each artwork, measured against the source
images, so they stay aligned at any window size. Artwork is exported at 2× native size with
nearest-neighbour scaling so the browser scales *down* rather than up — if you replace any of
it, run the same 2× nearest step first.

The cave is capped by `--stage-max` (default `1400px`) and centred. Raise it toward `1920px`
for a bigger picture, lower it toward `1200px` for maximum crispness.

## Notes

- Both sites are responsive down to 360px with no horizontal scroll.
- The bat mark is a CSS `mask-image` embedded as a data URI, so it takes `currentColor` and
  still works when the page is opened over `file://` (an external mask file is blocked by CORS
  there).
- Batcave audio starts on the START press — browsers block autoplay before a user gesture.

## Licensing

The Batman theme music, the bat logo and the cowl silhouette are third-party copyrighted
works — fine for a local demo or coursework, a risk on a public site. Swap them for licensed
or original assets before publishing. The cowl source also carries a stock watermark.
