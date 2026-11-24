# Extreme Limit Films

The website for Extreme Limit Films, an FPV drone filming and live broadcast crew in Perth, Western Australia.

Preview: https://mathew-harvey.github.io/ExtremeLimitFilms/

It is a plain static site: one page, one stylesheet and one script. There is no build step and nothing to install. GitHub Pages serves the `main` branch as it is.

## What is where

| Path | What it holds |
| --- | --- |
| `index.html` | The page and all of its copy |
| `404.html` | Shown for an address that doesn't exist. Carries its own styles |
| `assets/css/site.css` | Styles, in the same order as the page |
| `assets/js/site.js` | Hero footage, film player, filter, live replays, enquiry form |
| `assets/img/` | Stills, logo, icons and the social preview image (`og.jpg`) |
| `assets/video/hero/` | The four hero clips, muted, 10 to 15 seconds each |
| `assets/video/previews/` | Six-second loops that play when the pointer is over a film |
| `assets/video/films/` | Muted excerpts of the four films that are only on Facebook |
| `assets/fonts/` | Archivo, under the SIL Open Font Licence (`OFL.txt`) |

Every address in the page is relative, so the site works at the root of a domain and in a folder such as `/ExtremeLimitFilms/`.

## Look at it on your own computer

The player and the videos need a web server, so open a terminal in this folder and run:

```
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Change a film

Each film is one `<li class="film">` in `index.html`. Copy an existing one and change:

- `href`: the public link (YouTube or Facebook). It is used when scripts are off, or when someone opens the film in a new tab.
- `data-yt`: the YouTube video id. The film then plays on the page.
- `data-file` and `data-note`: use these instead of `data-yt` for a film that isn't on YouTube. `data-file` is a video in `assets/video/films/`, and `data-note` is the line shown under the player.
- `data-preview`: optional. A short muted loop in `assets/video/previews/`.
- `data-ratio="9:16"`: add it for a vertical film.
- `data-cat`: `motorsport`, `action` or `landscape`. The filter reads it.
- The still: a 16:9 JPEG, 960 pixels wide, in `assets/img/films/`. Write an `alt` that says what is in the picture.
- The length in `film__time` and the two lines of text.

The film with the class `film--lead` is the large one.

## Change the live replays

The replays are the four links in `<ol id="replays">`. Each needs its YouTube link, its `data-yt` id, a title and one line of detail. The stills on the screen beside the list are the four images in `#live-screen`, in the same order.

## Stills and video

All footage on the page gets the same slight grade from one line of CSS (`--grade` in `site.css`), so files go in ungraded. The clips have no audio track. Keep hero clips under about 4.5 MB and previews under about 600 KB, or the page gets slow on a phone.

## Before it goes live on its own domain

- Take out the `noindex` line in the head of `index.html`. It keeps this preview out of search results.
- Change the `og:image` address to the new domain and add a canonical link.
- The enquiry form opens the visitor's email app. Swap it for a hosted form so enquiries arrive without that step.
- Put the four Facebook-only films on YouTube and replace their `data-file` with `data-yt`, so visitors get the full films with sound.
- Replace the hero clips with cuts from the original footage if it is available. The current clips come from 720p copies.
