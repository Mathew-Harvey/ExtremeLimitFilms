# Extreme Limit Films

The website for Extreme Limit Films, an FPV drone filming and live broadcast crew in Perth, Western Australia.

Preview: https://mathew-harvey.github.io/ExtremeLimitFilms/

It is a plain static site: one page, one stylesheet and one script. There is no build step and nothing to install. GitHub Pages serves the `main` branch as it is.

Netlify is connected to this repository as well. `netlify.toml` stops it publishing the `main` branch, so the older site at the Netlify address stays up until launch. Netlify still builds a preview for each pull request.

## What is where

| Path | What it holds |
| --- | --- |
| `index.html` | The page and all of its copy |
| `404.html` | Shown for an address that doesn't exist. Carries its own styles |
| `assets/css/site.css` | Styles, in the same order as the page |
| `assets/js/site.js` | Hero footage, film player, filter, live replays, enquiry form |
| `assets/img/` | Stills, logo, icons and the social preview image (`og.jpg`) |
| `assets/img/clients/` | The client logos, redrawn in white for the dark page |
| `assets/img/services/` | The pictures on the four service cards, a wide and a tall crop of each |
| `assets/img/gear/` | The aircraft photos, in black and white |
| `assets/img/crew/` | The three behind-the-scenes pictures under the live screen, in black and white |
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

## Change a service card

The four services under Capabilities are the four `<li class="svc">` in `<ul class="svcs">`, in the order the client gave: event coverage, live streaming, real estate, on-the-ground videography. Each card has a title, a picture, a tag on the picture, one or two sentences and one link. The link covers the whole card, so a click anywhere on the card follows it.

- The picture is two JPEGs in `assets/img/services/`, both cut from our own footage and left ungraded. The wide one (4:3, 960 by 720) is on the `<img>` and shows on phones and tablets. The tall one (4:5, 800 by 1000) is on the `<source>` and shows in the desktop row. Keep the subject out of the bottom fifth, because the title sits there.
- The tag (`svc__tag`) says where the picture was taken.
- The link can go to a section (`#films`, `#live`), or to the contact form with `data-enquiry="Real estate"`, which puts those words in the email subject. To play a film instead, give it the film's public address and `data-open-film` with that film's `data-film` name, as the on-the-ground card does.
- The real estate picture is a stand-in (Matagarup Bridge at dusk) because we have no footage of a property yet. When the client sends some, replace the two files and the tag, and delete the `todo` line under the text.

The layout is built for four cards: one row on a desktop, two by two on a tablet, stacked on a phone.

## Change the licences and the aircraft

"What we hold" is the first list in the Licences and aircraft section, one `<div>` per licence. "What the terms mean" is the second. Each of its links goes to CASA's own page, opens in a new tab and has the class `ext`, which adds the small arrow.

Each aircraft is one `<li>` in `<ul class="gear">`: a black-and-white 4:3 JPEG in `assets/img/gear/` (720 by 540), a name and one or two plain sentences for people who don't fly FPV. The photos are our own, taken from the old site and from behind-the-scenes clips. No makes or models are named until the client confirms them.

## Change the client logos

Each logo is one `<li>` in `<ul class="logos">` in `index.html`, in the order the client gave. The files are in `assets/img/clients/`.

- A logo is white artwork on a clear background: an SVG, or a PNG about two and a half times its drawn size.
- The `width` and `height` on each `<img>` set the size it is drawn at. They were chosen by eye so the set looks even: a wide wordmark is about 150 pixels wide, a badge about 70 pixels tall.
- The `alt` is the organisation's name.
- Each logo sits inside a link to the organisation's own site, which opens in a new tab. Keep the hidden words after the image ("website (opens in a new tab)"), which screen readers read out. Bindoon Burnouts links to its page on the Pro Burnout Series site, because the event has no website of its own.
- The board is laid out for thirteen logos so that no row has an empty tile: seven and six on a desktop, five, four and four on a tablet, and pairs on a phone with the last one full width. Add or remove a logo and the spans under `.logos` in `site.css` need changing to match.

The logos were made from each organisation's own published logo. Where an organisation sends its own white version, use that instead.

## Lines waiting on the client

Anything with the class `todo` is a placeholder and shows in grey italics. Today that is 2023 and 2025 in the history, the "Other licences" row under Licences and aircraft, and the note on the real estate card, whose picture is a stand-in. Replace the text and take the class off, or delete the line once the real thing is in.

## The logo in the header

The header shows the mark (`logo-mark.png`) beside the brush lettering (`logo-wordmark.png`). The lettering was cut from `logo-full.png`, which the footer uses whole. If the client sends the original artwork, export the three files again at the same sizes.

## Stills and video

All footage on the page gets the same slight grade from one line of CSS (`--grade` in `site.css`), so files go in ungraded. Photos of the crew and the aircraft are the exception: they go in as black and white. The clips have no audio track. Keep hero clips under about 4.5 MB and previews under about 600 KB, or the page gets slow on a phone.

## Before it goes live on its own domain

- Delete `netlify.toml` if the site will be hosted on Netlify. Until then it stops Netlify publishing the `main` branch.
- Take out the `noindex` line in the head of `index.html`. It keeps this preview out of search results.
- Change the `og:image` address to the new domain and add a canonical link.
- Fill in the lines marked `todo` (see above).
- Check that each organisation in the Clients section is happy for its logo to be shown, and open each logo's link to see that it still works.
- Replace the stand-in picture on the real estate card with footage of a property.
- The enquiry form opens the visitor's email app. Swap it for a hosted form so enquiries arrive without that step.
- Put the four Facebook-only films on YouTube and replace their `data-file` with `data-yt`, so visitors get the full films with sound.
- Replace the hero clips with cuts from the original footage if it is available. The current clips come from 720p copies.
