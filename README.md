# Alex Rivera — Student Portfolio

A modern, fully responsive personal portfolio website built with **plain HTML5, CSS3, and vanilla JavaScript** — no frameworks, no build step.

## Features

- Responsive design (desktop, tablet, mobile) with a blue / white / light-gray palette
- Dark mode toggle (remembers your choice)
- Fixed navigation bar with scroll-spy active states + mobile menu
- Sections: Home (hero), About (with timeline), Hobbies gallery, PCTO activities, Civic Education, Portfolio, Contact
- Animated statistics counters and smooth scroll-reveal animations
- **Content management** (no code editing needed): add / edit / delete items behind an admin login
- **Drag-and-drop uploads** for images and PDF files
- Search (PCTO & Civic) and category filtering (Portfolio)
- Image lightbox, downloadable CV, contact form with validation
- Accessible (semantic HTML, ARIA, keyboard support, skip link) and SEO-friendly (meta tags, Open Graph, JSON-LD)

## Folder Structure

```
.
├── index.html          # Page structure & all sections
├── css/
│   └── styles.css      # Design tokens, layout, components, themes
├── js/
│   ├── data.js         # Default example content + localStorage layer
│   └── app.js          # All interactivity (nav, theme, auth, CRUD, uploads)
├── public/
│   └── assets/profile.png   # Hero profile photo
└── package.json        # Dev server script (live-server)
```

## Running Locally

```bash
pnpm install
pnpm dev        # serves at http://localhost:3000
```

Or simply open `index.html` in a browser (some features like module loading work best via a local server).

## Managing Content (No Coding Required)

1. Click **Admin** in the navbar.
2. Enter the demo password: `admin123`
3. "Add" buttons and edit/delete controls appear on every section.
4. Use the **drag-and-drop** zones to upload images and PDFs, or paste an image URL.
5. Changes save automatically to your browser (`localStorage`).

> **Note:** Because this is a static site (your chosen stack), content and uploads are stored in *your browser only* — they persist across refreshes on this device but are not shared with other visitors or devices.

## Customization Guide

| What | Where |
|------|-------|
| Your name / brand | `index.html` (navbar `.brand`, hero `<h1>`, footer) |
| Page title & SEO meta | `index.html` `<head>` |
| Profile photo | Replace `public/assets/profile.png` |
| Colors & fonts | `css/styles.css` → `:root` design tokens |
| Default example content | `js/data.js` → `DEFAULT_DATA` |
| Admin password | `js/app.js` → `ADMIN_PASSWORD` |
| Stats numbers | `index.html` → `#statsGrid` `data-count` attributes |
| Skills / timeline | `index.html` → About section |

### Changing the color theme

Edit the CSS variables in `css/styles.css`:

```css
:root {
  --primary: #2563eb;   /* main brand blue */
  --background: #f8fafc; /* light gray page bg */
  /* ...dark mode lives under [data-theme="dark"] */
}
```

## Resetting Content

Open your browser console and run:

```js
localStorage.removeItem("portfolio_content_v1"); location.reload();
```

This restores the original example content.
