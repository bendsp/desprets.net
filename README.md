# desprets.net

My personal portfolio website built with **Next.js**, showcasing my projects, skills and more.

> Live site: [https://desprets.net](https://desprets.net) > ![Homepage Preview](./public/Desprets.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [License](#license)

## Features

- 🚀 Fast, server-side rendered pages with Next.js
- 💅 Optimized styling and layout for responsive design
- 🖋️ Markdown-powered blog for easy content authoring
- 🔗 SEO-friendly metadata and Open Graph tags
- 📝 Contact form integration

## Tech Stack

- **Next.js** – React framework for production
- **TypeScript** – Typed JavaScript
- **tailwindcss** – Utility-first CSS framework
- **next/font** – Automatic font optimization (using Geist)

## Project Structure

```text
┌─ public/          # Static assets (images, favicon, etc.)
├─ src/
│  ├─ app/          # Next.js 13 app directory (pages, layouts)
│  ├─ components/   # Reusable UI components
│  ├─ styles/       # Global and component-specific styles
│  ├─ lib/          # Utility functions and API wrappers
│  └─ types/        # TypeScript type definitions
```

## Images

Static export means no runtime image optimization, so images are pre-generated:

```sh
pnpm img <source> <base-name> [display-width]   # default width 380
pnpm img ~/Downloads/photo.jpg garden-board 420
```

This writes `public/<base-name>-<w>.webp` (1x) and `-<2w>.webp` (2x) and prints
the matching `<Figure>` tag. Use it in any MDX file (no import needed):

```mdx
<Figure src="/garden-board" alt="..." width={420} height={315}>
  Optional caption, links allowed.
</Figure>
```

`<Figure>` handles srcset, lazy-loading, and CLS-safe dimensions. Add `priority`
only for above-the-fold images (skips lazy-loading, hints high fetch priority).

## License

This project is licensed under the [MIT License](LICENSE).
