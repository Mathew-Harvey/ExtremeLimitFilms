/* Extreme Limit Films: page behaviour. Plain JavaScript, no dependencies.
   Everything here is an enhancement. With scripts off, the page still reads
   top to bottom and every film link opens on YouTube or Facebook. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const EMAIL = 'extremelimitfilms@outlook.com';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

  /* The hero footage stops while a dialog is open or the hero is off screen. */
  let reel = { hold() {}, release() {} };

  /* ---------- Header and phone contact bar ---------- */

  const header = $('#site-header');
  const quick = $('#quick');
  const heroEl = $('.hero');
  const enquire = $('#enquire');
  let ticking = false;

  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > 24);
    if (quick && heroEl && enquire) {
      const pastHero = y > heroEl.offsetHeight * 0.6;
      const formOnScreen = enquire.getBoundingClientRect().top < window.innerHeight - 120;
      quick.classList.toggle('is-on', pastHero && !formOnScreen);
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Dialogs: phone menu and film player ---------- */

  const menu = $('#menu');
  const player = $('#player');
  const frame = $('#player-frame');
  const dialogsWork = !!(player && typeof player.showModal === 'function');

  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => reel.release());
    // A click on the dialog itself is a click outside its content.
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    $$('[data-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
  });

  const menuBtn = $('.site-header .menu-btn');
  if (menuBtn && menu && dialogsWork) {
    menuBtn.addEventListener('click', () => { reel.hold(); menu.showModal(); });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => menu.close()));
  }

  const openPlayer = (film) => {
    frame.replaceChildren();
    player.style.setProperty('--ratio', film.vertical ? '0.5625' : '1.7778');
    player.style.setProperty('--player-max', film.vertical ? '520px' : (film.max ? film.max + 'px' : '1180px'));
    $('#player-title').textContent = film.title;
    $('#player-meta').textContent = film.meta;
    $('#player-note').textContent = film.note || '';
    const link = $('#player-link');
    link.href = film.href;
    link.textContent = film.yt ? 'Watch on YouTube' : 'Full film on Facebook';

    if (film.yt) {
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(film.yt) + '?autoplay=1&rel=0&playsinline=1';
      f.title = film.title;
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.appendChild(f);
    } else {
      const v = document.createElement('video');
      v.controls = true;
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = 'auto';
      if (film.poster) v.poster = film.poster;
      v.src = film.file;
      frame.appendChild(v);
    }
    reel.hold();
    player.showModal();
  };
  if (player) player.addEventListener('close', () => frame.replaceChildren());

  const filmFrom = (a) => {
    const img = $('img', a);
    return {
      title: $('.film__title', a).textContent,
      meta: $('.film__meta', a).textContent,
      yt: a.dataset.yt,
      file: a.dataset.file,
      note: a.dataset.note,
      max: a.dataset.max,
      vertical: a.dataset.ratio === '9:16',
      href: a.href,
      poster: img ? (img.currentSrc || img.src) : '',
    };
  };

  if (dialogsWork) {
    $$('.film__link').forEach((a) => a.addEventListener('click', (e) => {
      if (!plainClick(e)) return;
      e.preventDefault();
      openPlayer(filmFrom(a));
    }));
    const heroFilm = $('[data-open-film]');
    if (heroFilm) heroFilm.addEventListener('click', () => {
      const a = $('.film__link[data-film="' + heroFilm.dataset.openFilm + '"]');
      if (a) openPlayer(filmFrom(a));
    });
  }

  /* ---------- Hero: four clips, one after the other ---------- */

  const reelEl = $('.reel');
  if (heroEl && reelEl) {
    const slides = $$('.hero__slide', heroEl);
    const picks = $$('.pick', reelEl);
    const pauseBtn = $('.reel__pause', reelEl);
    const nowTitle = $('[data-now-title]', reelEl);
    const nowMeta = $('[data-now-meta]', reelEl);
    const filmBtn = $('[data-open-film]', reelEl);
    const STILL_MS = 8000;

    let current = 0;
    let paused = reduceMotion || saveData;   // what the pause button shows
    let offScreen = false;
    let holds = 0;
    let stillTimer = 0;
    let raf = 0;

    const videoOf = (i) => $('video', slides[i]);
    const setBar = (i, v) => { $('.pick__bar i', picks[i]).style.transform = 'scaleX(' + v + ')'; };
    const blocked = () => paused || offScreen || holds > 0;

    // Slides two to four start as their small thumbnail and swap to the full still when needed.
    const sharpen = (i) => {
      const img = $('img', slides[i]);
      if (!img || !img.dataset.full) return;
      const full = new Image();
      const src = img.dataset.full;
      delete img.dataset.full;
      full.onload = () => { img.src = src; };
      full.src = src;
    };
    const ready = (i) => {
      const v = videoOf(i);
      if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; }
      return v;
    };

    const stopClock = () => {
      cancelAnimationFrame(raf);
      clearTimeout(stillTimer);
      raf = 0;
      stillTimer = 0;
    };
    const tick = () => {
      const v = videoOf(current);
      if (v.duration) {
        setBar(current, Math.min(1, v.currentTime / v.duration));
        // Fetch the next clip shortly before this one ends, so the cut is clean.
        if (v.duration - v.currentTime < 4) ready((current + 1) % slides.length);
      }
      raf = requestAnimationFrame(tick);
    };
    const halt = () => { stopClock(); videoOf(current).pause(); };
    const run = () => {
      stopClock();
      if (blocked()) return;
      const attempt = ready(current).play();
      if (attempt && attempt.catch) attempt.catch((err) => {
        if (!err || err.name === 'AbortError') return;
        if (err.name === 'NotAllowedError') setPaused(true);          // the browser wants a tap first
        else if (!blocked()) stillTimer = setTimeout(next, STILL_MS);  // no video: move through the stills
      });
      raf = requestAnimationFrame(tick);
    };

    const show = (i) => {
      halt();
      slides[current].classList.remove('is-on');
      current = i;
      slides[i].classList.add('is-on');
      sharpen(i);
      sharpen((i + 1) % slides.length);
      picks.forEach((p, n) => {
        p.classList.toggle('is-on', n === i);
        p.setAttribute('aria-pressed', String(n === i));
        setBar(n, 0);
      });
      const d = picks[i].dataset;
      nowTitle.textContent = d.title;
      nowMeta.textContent = d.meta;
      filmBtn.dataset.openFilm = d.film;
      filmBtn.setAttribute('aria-label', 'Play the film ' + d.title);
      try { videoOf(i).currentTime = 0; } catch (e) { /* not loaded yet */ }
      run();
    };
    const next = () => show((current + 1) % slides.length);

    const setPaused = (value) => {
      paused = value;
      reelEl.classList.toggle('is-paused', paused);
      pauseBtn.setAttribute('aria-label', paused ? 'Play the footage' : 'Pause the footage');
      if (paused) halt(); else run();
    };

    slides.forEach((slide, i) => {
      const v = videoOf(i);
      v.addEventListener('playing', () => v.classList.add('is-ready'));
      v.addEventListener('ended', () => { if (i === current && !blocked()) next(); });
      v.addEventListener('error', () => {
        if (i === current && !blocked()) { clearTimeout(stillTimer); stillTimer = setTimeout(next, STILL_MS); }
      });
    });
    picks.forEach((p, i) => p.addEventListener('click', () => show(i)));
    pauseBtn.addEventListener('click', () => setPaused(!paused));

    reel = {
      hold() { holds += 1; halt(); },
      release() { holds = Math.max(0, holds - 1); run(); },
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        offScreen = !entries[0].isIntersecting;
        if (offScreen) halt(); else run();
      }, { threshold: 0.15 }).observe($('.hero__stage', heroEl));
    }

    setPaused(paused);
    window.addEventListener('load', () => sharpen(1), { once: true });
  }

  /* ---------- Films: filter and hover previews ---------- */

  const grid = $('#film-grid');
  const filterBtns = $$('.filter button');
  const filterStatus = $('#filter-status');
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    const want = btn.dataset.filter;
    let shown = 0;
    grid.dataset.filter = want;
    filterBtns.forEach((b) => {
      b.classList.toggle('is-on', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    $$('.film', grid).forEach((li) => {
      const match = want === 'all' || li.dataset.cat === want;
      li.hidden = !match;
      if (match) shown += 1;
    });
    filterStatus.textContent = 'Showing ' + shown + (shown === 1 ? ' film' : ' films');
  }));

  if (canHover && !reduceMotion && !saveData) {
    $$('.film__link[data-preview]').forEach((a) => {
      const media = $('.film__media', a);
      let video = null;
      let wait = 0;
      const start = () => {
        clearTimeout(wait);
        wait = setTimeout(() => {
          if (!video) {
            video = document.createElement('video');
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';
            video.tabIndex = -1;
            video.setAttribute('aria-hidden', 'true');
            video.src = a.dataset.preview;
            video.addEventListener('playing', () => media.classList.add('is-previewing'));
            media.appendChild(video);
          }
          const attempt = video.play();
          if (attempt && attempt.catch) attempt.catch(() => {});
        }, 140);
      };
      const stop = () => {
        clearTimeout(wait);
        media.classList.remove('is-previewing');
        if (video) video.pause();
      };
      a.addEventListener('pointerenter', start);
      a.addEventListener('pointerleave', stop);
      a.addEventListener('focus', start);
      a.addEventListener('blur', stop);
    });
  }

  /* ---------- Live broadcast: the screen follows the replay list ---------- */

  const replays = $$('#replays a');
  const screen = $('#live-screen');
  if (screen && replays.length) {
    const firstStill = $('img', screen);
    const stills = [firstStill];   // the others are fetched when a replay is first pointed at
    const cap = $('#live-cap');
    let active = 0;
    const replayFrom = (a) => ({
      title: $('b', a).textContent,
      meta: $('span', a).textContent,
      yt: a.dataset.yt,
      href: a.href,
    });
    const reveal = () => stills.forEach((img, n) => { if (img) img.classList.toggle('is-on', n === active); });
    const still = (i) => {
      if (!stills[i]) {
        const img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.addEventListener('load', () => { if (active === i) reveal(); });
        img.src = replays[i].dataset.still;
        firstStill.after(img);
        stills[i] = img;
      }
      return stills[i];
    };
    const point = (i) => {
      active = i;
      const title = $('b', replays[i]).textContent;
      replays.forEach((a, n) => a.classList.toggle('is-on', n === i));
      cap.textContent = title;
      screen.setAttribute('aria-label', 'Play the replay: ' + title);
      // Keep the current still up until the new one has arrived.
      const img = still(i);
      if (img.complete && img.naturalWidth) reveal();
    };
    replays.forEach((a, i) => {
      a.addEventListener('pointerenter', () => point(i));
      a.addEventListener('focus', () => point(i));
      a.addEventListener('click', (e) => {
        if (!dialogsWork || !plainClick(e)) return;
        e.preventDefault();
        point(i);
        openPlayer(replayFrom(a));
      });
    });
    // With a mouse, fetch all four once the pointer reaches the list, so each swap is instant.
    const list = $('#replays');
    if (canHover && list) list.addEventListener('pointerenter', () => replays.forEach((a, i) => still(i)), { once: true });
    screen.addEventListener('click', () => {
      const a = replays[active];
      if (dialogsWork) openPlayer(replayFrom(a)); else window.location.href = a.href;
    });
  }

  /* ---------- Enquiry form ---------- */

  const form = $('#enquiry-form');
  if (form) {
    // Links such as "Plan a broadcast" arrive with the project type already chosen.
    $$('[data-enquiry]').forEach((a) => a.addEventListener('click', () => {
      const pick = $$('input[name="type"]', form).find((input) => input.value === a.dataset.enquiry);
      if (pick) pick.checked = true;
    }));

    const status = $('#enquiry-status');
    const text = $('#enquiry-text');
    const retry = $('#enquiry-mailto');
    const copyBtn = $('#enquiry-copy');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const value = (name) => (data.get(name) || '').toString().trim();
      const type = value('type');
      const lines = [
        ['Name', value('name')],
        ['Email', value('email')],
        ['Phone', value('phone')],
        ['Organisation or event', value('organisation')],
        ['Project type', type],
        ['Date or dates', value('dates')],
        ['Venue or town', value('location')],
        ['What we need', data.getAll('need').join(', ')],
      ].filter((line) => line[1]).map((line) => line[0] + ': ' + line[1]);
      const message = value('message');
      if (message) lines.push('', message);

      const body = lines.join('\n');
      const subject = 'Website enquiry' + (type ? ': ' + type : '');
      const href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      text.value = body;
      retry.href = href;
      status.hidden = false;
      window.location.href = href;
    });

    copyBtn.addEventListener('click', () => {
      const done = () => {
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy the text'; }, 2000);
      };
      const fallback = () => { text.select(); document.execCommand('copy'); done(); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text.value).then(done, fallback);
      } else {
        fallback();
      }
    });
  }
})();
