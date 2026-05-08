# 🎬 The Silver Screen Concierge

A golden-age Hollywood movie recommendation app powered by the **TMDB API** and built with **React + Vite**.

---

## Features

| Tab | What it does |
|---|---|
| 🎟️ Now Playing | Live now-playing, popular, and top-rated movies from TMDB |
| 🔍 Search | Debounced live title search with trending grid |
| 🎭 Actors | Search any actor by name and browse their full filmography |
| 🎬 Quiz | 4-step preference quiz that recommends matched movies |
| 🎲 Random | Spin the reel for random genre-filtered picks |
| ★ My Marquee | Personal watchlist with seen/unseen tracking and star ratings |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your TMDB API key

Create a `.env` file in the project root (already provided with the included key):

```
VITE_TMDB_API_KEY=your_key_here
```

You can get a free API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy the contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## Project Structure

```
src/
├── App.jsx                  ← Root component, global state, tab routing
├── main.jsx                 ← React entry point
│
├── data/
│   └── constants.js         ← Colour palettes, tab labels, quiz genre options
│
├── utils/
│   ├── tmdb.js              ← All TMDB API functions + data normalizer
│   ├── posters.js           ← Real TMDB poster URLs + SVG fallback generator
│   ├── scoring.js           ← TMDB similar/recommended + quiz scorer
│   └── actors.js            ← (stub — actors fetched live via tmdb.js)
│
├── styles/
│   └── main.css             ← Full CSS — design tokens, all component styles
│
├── components/
│   ├── Shared.jsx           ← SectionHead, DecoRule, GenreChip, WlButton
│   ├── MovieRow.jsx         ← Horizontal list row for recommendations
│   ├── PosterCard.jsx       ← Vertical poster card (grid + carousel variant)
│   └── DetailView.jsx       ← Full movie detail + async recommendations rail
│
└── tabs/
    ├── NowPlayingTab.jsx
    ├── SearchTab.jsx
    ├── ActorsTab.jsx
    ├── QuizTab.jsx
    ├── RandomTab.jsx
    └── WatchlistTab.jsx
```

---

## API Usage

All TMDB calls are in `src/utils/tmdb.js`. The key functions:

```js
getPopularMovies()              // /movie/popular
getNowPlayingMovies()           // /movie/now_playing
getTopRatedMovies()             // /movie/top_rated
getTrendingMovies()             // /trending/movie/week
searchMovies(query)             // /search/movie
fetchMovieDetails(id)           // /movie/{id} + credits + keywords (parallel)
getSimilarMovies(id)            // /movie/{id}/similar
getRecommendedMovies(id)        // /movie/{id}/recommendations
searchPeople(query)             // /search/person
getPersonMovieCredits(personId) // /person/{id}/movie_credits
```

---

## Watchlist Persistence

Watchlist data is stored in `localStorage` under the key `ssc_wl`. It persists across sessions. Format:

```json
{
  "123": { "seen": false, "rating": 0, "addedAt": 1700000000000 },
  "456": { "seen": true,  "rating": 4, "addedAt": 1700000001000 }
}
```

---

## Design

- **Fonts:** Playfair Display · Cormorant Garamond · IM Fell English · Pacifico
- **Palette:** Midnight navy, antique gold, velvet ruby, teal, cobalt, orchid
- **Aesthetic:** Golden Age Hollywood — Art Deco geometry, film grain overlay, marquee bulb lights, animated neon header strip
