# The Movie Database

A frontend-only React application for discovering movies and TV series through TMDB.

## Development

Install dependencies and start the Vite development server:

```sh
npm install
npm start
```

Vite prints the local URL in the terminal (usually <http://localhost:5173>).

## Production

Create and preview a production build:

```sh
npm run build
npm run preview
```

The production files are written to `dist/`. Configure the static host to serve
`index.html` for application routes so React Router can handle direct links.

## Deploying to Vercel

The Vercel project uses the Vite framework preset, `npm run build` as the build
command, and `dist` as the output directory. `vercel.json` rewrites client-side
routes to `index.html`. The app has no custom backend or backend environment
variables.
