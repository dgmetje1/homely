# homely: a View Transitions playground

A small Angular 22 app for browsing flats and houses to rent or buy. It exists to show what the
[View Transition API](https://developer.mozilla.org/docs/Web/API/View_Transition_API) can do
together with the Angular router.

```bash
pnpm install
pnpm start      # http://localhost:4200
pnpm test
pnpm photos     # re-download the listing photos into public/photos (only missing ones)
```

Photos come from [Unsplash](https://unsplash.com/license) and are bundled in `public/photos`
as 4:3 WebP files in two widths (800 and 1600px). The app makes no third-party image requests.

## Deployment

`.github/workflows/deploy.yml` tests and builds every push and pull request. Pushes to `main`
also deploy to GitHub Pages at https://dgmetje1.github.io/homely/. One-time setup: in the
repository's **Settings → Pages**, set **Source** to **GitHub Actions**.

The build uses the Pages base path as its `<base href>` and copies `index.html` to `404.html`,
so deep links such as `/homely/listing/<id>` work on reload.

Best viewed in a Chromium-based browser (types and `view-transition-class` need Chrome 125+).
Other browsers get the same app without the animations.

## What to try

| Interaction | What animates | Where |
| --- | --- | --- |
| Open a listing | Card photo, title and price fly into the detail page | `withViewTransitions()` in `app.config.ts` |
| Back | The same elements fly back; scroll position is restored *before* the snapshot | `view-transitions/transition-scroller.ts` |
| Category chips, Rent/Buy, sort, search | Cards re-flow; the active chip/pill glides | filters are query params, so each change is a navigation |
| Gallery thumbnail | Thumbnail and hero swap places | `PhotoGallery.show()` via `ViewTransitions.run()` |
| Explore ⇄ Saved | Page slides in tab order, shared cards morph | `tab-forward` / `tab-back` types |
| Bookmark on the Saved page | Removed card shrinks away, the rest close the gap | `Favorites.toggle()` |
| Theme button | Circular reveal from the button | `ThemeService.toggle()` |
| "Similar homes" card | Detail-to-detail morph | `detail-swap` type |
| Grid / list switch | Every card morphs between a grid tile and a list row | `layout` type, `?view=list` |
| Hero photo or "Show all photos" | Photo grows into a full-screen viewer | lightbox route, `lightbox-open` / `lightbox-close` |
| Lightbox ← → (keys, buttons, swipe, thumbnails) | Directional slide, thumbnail ring glides | `photo-next` / `photo-prev`, direction passed as navigation `state` |

## How it fits together

- **Router transitions.** `withViewTransitions({ onViewTransitionCreated })` runs every navigation
  through `document.startViewTransition()`. The callback classifies the navigation with
  `transitionTypes()` (`view-transitions/transition-types.ts`) and adds the result to
  `transition.types`.
- **CSS picks the choreography.** `src/styles.css` styles each kind of navigation with
  `:active-view-transition-type(...)`, and styles groups of elements with `view-transition-class`
  (`.card`, `.photo`, `.text`).
- **Non-router transitions.** `ViewTransitions.run(update, types)` wraps signal updates. With
  zoneless change detection nothing re-renders inside the update callback on its own, so it calls
  `ApplicationRef.tick()` to flush the DOM before the browser captures the new state.
- **Unique names.** Names are derived from listing ids (`card-<id>`, `photo-<id>`, …). Gallery
  names follow the *photo*, not the slot, so swapping photos is just a layout change.
- **Scroll restoration.** `TransitionScroller` scrolls right after the transition's
  `updateCallbackDone`. By then the new view has rendered, and the browser hasn't captured it
  yet, so morphs land where elements end up.
- **Reduced motion.** `prefers-reduced-motion` disables every view-transition animation.

## Project structure

Each component keeps its template and styles in separate files, and the code is split by route
and by feature:

```
src/app/
  layout/site-header/        header: search, tabs, theme toggle
  pages/
    explore/                 lazy route; explore-toolbar/ + explore-state.ts (URL parsing)
    listing-detail/          lazy route; photo-gallery/, booking-panel/, amenity-list/,
                             similar-listings/ (@defer on viewport, own chunk)
    lightbox/                lazy route: /listing/:id/photos/:index
    saved/                   lazy route
  ui/                        icon/, listing-card/, segmented-nav/, sharp-photos.ts, format.ts
  listings/                  model, data, photo ids, queries, favourites
  view-transitions/          transition types, scroller, ViewTransitions.run()
```
