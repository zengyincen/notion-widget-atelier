<p align="center">
  <a href="https://widget.imnotfound.eu.org/"><img src="./favicon.svg" width="88" height="88" alt="Widget Atelier icon" /></a>
</p>

<h1 align="center">Notion Widget Atelier</h1>

<p align="center">
  Turn your Notion into a space that feels truly yours.
  <br />
  Pick a widget, customize it live, and embed a permanent URL. Dynamic state is hosted and synced for you.
</p>

<p align="center">
  <a href="https://widget.imnotfound.eu.org/"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fnwb.imnotfound.eu.org%2Fmetrics%2Fbadge%2Fvisitors&amp;style=flat-square" alt="Website visitors" /></a>
  <a href="https://widget.imnotfound.eu.org/"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fnwb.imnotfound.eu.org%2Fmetrics%2Fbadge%2Fusers&amp;style=flat-square" alt="Widget users" /></a>
  <a href="https://github.com/zengyincen/notion-widget-atelier"><img src="https://komarev.com/ghpvc/?username=zengyincen&amp;repo=notion-widget-atelier&amp;label=README%20views&amp;color=blue&amp;style=flat-square" alt="README views" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/zengyincen/notion-widget-atelier?style=flat-square" alt="MIT License" /></a>
  <a href="https://github.com/zengyincen/notion-widget-atelier/stargazers"><img src="https://img.shields.io/github/stars/zengyincen/notion-widget-atelier?style=flat-square" alt="GitHub Stars" /></a>
  <a href="https://github.com/zengyincen/notion-widget-atelier/commits/main"><img src="https://img.shields.io/github/last-commit/zengyincen/notion-widget-atelier?style=flat-square" alt="Last commit" /></a>
</p>

<p align="center">
  <a href="./README.md">简体中文</a>
  ·
  <a href="https://widget.imnotfound.eu.org/"><strong>Pick my first widget</strong></a>
  ·
  <a href="https://widget.imnotfound.eu.org/?category=feature-pet">Adopt a desktop pet</a>
  ·
  <a href="./docs/NOTION-DATABASE.zh-CN.md">Connect public Notion data</a>
</p>

<p align="center"><a href="https://widget.imnotfound.eu.org/"><img src="./assets/readme-banner.svg" width="100%" alt="Widget Atelier hero banner" /></a></p>

## What is Widget Atelier?

Widget Atelier (formerly Notion Widget Box) is a free, open-source service for Notion users. Browse a searchable catalog, preview a widget, adjust its content and visual system, then paste the generated URL into a Notion `/embed` block.

You get:

- **98 widget engines** covering time, calendars, productivity, progress, heatmaps, pets, music, art, weather, public data and more.
- **1,764 theme and layout combinations** from six visual themes and three responsive layouts.
- **633 fonts**, with 53 Chinese-first open-source fonts plus international families.
- **No account and no deployment** for end users. Configuration travels with the embed URL.
- **Cloudflare-hosted dynamic state** for individually isolated pets and public Notion data aggregation.

## Embed a widget in three steps

1. Open the [online catalog](https://widget.imnotfound.eu.org/) and search or filter for a widget.
2. Customize content, colors, fonts, themes, layout, locale, time zone and size in the live preview.
3. Copy the URL, type `/embed` in Notion, paste it, and confirm **Embed link**.

No Notion Integration Token is required for ordinary widgets. Public-data connectors only read pages that you explicitly publish and do not access private pages.

## Featured capabilities

### Dynamic desktop pets

Preview a cat, dog, rabbit or soft companion before naming it. Each adoption receives a random ID, so pets with the same display name never share state. Food, water and comfort decay over time; expressions, emojis and small status messages react to the mood. Feeding and watering each have a two-hour cooldown, while petting can trigger a happy animation repeatedly.

### Progress bars and heatmaps

Use manual values, Notion formulas or the public database connector. Publish a Notion database page, map its columns, and generate a URL for a progress bar or calendar heatmap. We do not request an Integration Token. Do not publish sensitive data: a public Notion page can be viewed by anyone who has its link.

### Music and visual widgets

The catalog includes a native audio player, vinyl and cassette players, ambient mixer, LRC lyrics, poetry, scenic quotes, generative art, color palettes and ASCII art. Use audio sources you are allowed to embed and expect browsers to require a first manual play.

## Widget categories

| Category | Examples |
| --- | --- |
| Time and dates | Digital, analog, flip and word clocks, calendars, Google Calendar, countdowns and world clocks |
| Focus and productivity | Pomodoro, Pomodoro todo, recurring tasks, flashcards, habits, streaks and priority matrix |
| Progress and data | Progress bars, milestones, KPI cards, charts, calendar heatmaps and public Notion aggregation |
| Music and art | Audio, vinyl, cassette, ambient, lyrics, poetry, quotes and generative art |
| Dynamic and lifestyle | Desktop pets, virtual plants, focus garden, mood orbit, moon phase and savings goals |
| Information and culture | Weather, news, tarot, prayer times, almanac, zodiac, solar terms and daily cards |
| Tools and links | Whiteboard, feedback form, color palette, ASCII, calculator, QR, navigation and social links |

## Customization

| Area | Controls |
| --- | --- |
| Visual | Six themes, background, card, text, accent, border, shadow and transparency |
| Typography | Chinese-first black, serif, handwritten, display, pixel and mono families, plus 500+ international fonts |
| Structure | Compact, standard and wide layouts, scale, padding, radius and alignment |
| Localization | Language, region, city, time zone and date/time format |
| Content | Titles, text, images, links, audio, playlists, lyrics, targets and data sources |
| Motion | Animation, speed, random seed, auto-rotation and refresh behavior |

## Market and product comparison

Widget Atelier is independent and is not affiliated with Notion, Indify, Apption, Plus AI, Widgetly, NotionBox, Widgets For Notion or Wotion. The [Notion widgets guide](https://widget.imnotfound.eu.org/guides/notion-widgets.html) explains the public positioning of these products and the trade-offs between a directory, a widget builder, application snapshots and business metrics.

## Privacy and security

- We do not ask users for a Notion Integration Token, Cloudflare key or GitHub credential.
- Standard configuration is stored in the generated URL; some local interactions use browser `localStorage`.
- Dynamic pets use a random pet ID and a dedicated Cloudflare Durable Object state shard.
- Public Notion connectors accept only `notion.so` / `notion.site` links that you intentionally publish.
- Visitor and widget-use badges use anonymized, deduplicated Cloudflare metrics; raw IP addresses are not stored.
- Notion is a trademark of its respective owner. Widget Atelier is not an official Notion product.

## Documentation

- [Notion widgets guide and provider comparison](https://widget.imnotfound.eu.org/guides/notion-widgets.html)
- [Market research](./docs/MARKET-RESEARCH.zh-CN.md)
- [Reference coverage](./docs/REFERENCE-COVERAGE.zh-CN.md)
- [Public Notion database guide](./docs/NOTION-DATABASE.zh-CN.md)
- [Cloudflare Worker operations](./worker/README.md)
- [Pricing for AI agents](./pricing.md)

## Run locally

```bash
git clone https://github.com/zengyincen/notion-widget-atelier.git
cd notion-widget-atelier
python3 -m http.server 4173
```

Open `http://localhost:4173/`. The Cloudflare Worker is documented in [`worker/README.md`](./worker/README.md).

## Contributing and license

Pull requests for new widgets, themes, fonts, accessibility fixes and documentation are welcome. The project is released under the [MIT License](./LICENSE).

Inspired by the open Notion widget ecosystem, including [ShoroukAziz/notion_widgets](https://github.com/ShoroukAziz/notion_widgets) and [RylanBot/awesome-notion-widgets](https://github.com/RylanBot/awesome-notion-widgets). The component registry, renderer, player and visual system are independent implementations.

<p align="center">Like the workshop? Give it a ⭐ and tell us which widget you want next.</p>
