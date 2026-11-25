# Howard Huang — Portfolio

Product design portfolio for **Howard Huang (黃翔晧)**, a product designer who builds what he designs.
Live at **[hhuang.ca](https://hhuang.ca)**.

## Case studies

| Project | What it is |
|---|---|
| [Propr](https://hhuang.ca/propr.html) | A sports projection model, designed and built end to end. Live components rebuilt as self-playing demos. |
| [Spotify signup](https://hhuang.ca/spotify.html) | Onboarding redesign that puts a personal playlist before the account. |
| [NPO Connect](https://hhuang.ca/npo-connect.html) | One workspace for nonprofit operations, shaped by interviews and usability testing. |
| [Orbit](https://hhuang.ca/orbit.html) | Brand and launch motion for one of the first Web3 insights communities. 600+ members. |

Each case study follows the same story: the problem, how it was framed, what shipped and what happened after.

## Design

- **Theme:** Jiufen at dusk. Rice-paper white, teak ink, lantern red and lantern gold, with a night mode for Jiufen after dark.
- **Type:** Instrument Serif for display, Archivo for everything else, Noto Serif TC for the Chinese name.
- **Details:** a hand-drawn street scene, a lantern cursor, a typewriter greeting that switches between Mandarin and English, and section shortcuts on every case study.
- Built following the [unslop](https://x.com/heydamir) approach: quiet chrome, one rich moment per screen.

## Structure

```
index.html            Home: greeting, case studies, other work
about.html            About: timeline, education, tools
propr.html            Case study pages
spotify.html
npo-connect.html
orbit.html
assets/
  paper.css           Site styles (day and night themes)
  case.css            Case study components
  main.js             Cursor, typewriter, theme switch, section dock
  propr-demos.*       Propr demo components
  propr-auto.js       Plays the Propr demos automatically
  fonts/              Self-hosted web fonts
  work/               Covers, screens and videos
  work/players/       Player headshots for the Propr demo (jalen-brunson.png, ...)
  work/books/         Sportsbook logos
CNAME                 Custom domain (hhuang.ca)
```

## Running locally

Plain HTML, CSS and JavaScript. No build step.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying

GitHub Pages serves the `main` branch from the repository root. Push to `main` and the site updates in a minute or two.

## Contact

[Howardh0620@gmail.com](mailto:Howardh0620@gmail.com) · [LinkedIn](https://www.linkedin.com/in/howard-huang0620/)

© 2026 Howard Huang
