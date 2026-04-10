# AI Syndicate

AI Syndicate is a React and Vite marketing site for an AI visibility agency. The current app includes a landing page, service positioning, and an on-page analyzer that scores website copy for visibility, authority, and conversion signals.

## Tech Stack

- React 19
- Vite 7
- ESLint 9

## Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` previews the production build locally

## Project Notes

- The frontend is implemented in [`src/App.jsx`](./src/App.jsx).
- The analyzer endpoint lives in [`api/analyze.js`](./api/analyze.js).
- Local build output in `dist/`, dependencies in `node_modules/`, and Vercel local state in `.vercel/` are intentionally ignored by Git.
