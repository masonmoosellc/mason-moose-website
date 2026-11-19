# Mason Moose LLC — Website

The public website for **Mason Moose LLC**, live at **[masonmoose.com](https://masonmoose.com)**.

Mason Moose LLC is an independent, U.S.-based software company building
professional software and applications for small businesses.

## About this site

A small, static website — plain HTML, CSS and a little JavaScript, with no build step or dependencies.
GitHub Pages serves the `main` branch as is.

- `index.html` — home page
- `privacy.html` — privacy notice
- `assets/css/site.css` — shared styles, including the dark and light themes
- `assets/js/site.js` — theme toggle, scroll reveals and other small effects
- `assets/fonts/` — Inter and Inter Tight, self-hosted (SIL Open Font License, see the `OFL-*.txt` files)
- `assets/img/` — logo, favicons and the social preview image

**Rule:** the site makes no requests to other hosts. Keep fonts, scripts and images self-hosted,
so the privacy notice ("no third-party analytics or tracking") stays true.

## Local preview

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8765/>.

---

© 2026 Mason Moose LLC
