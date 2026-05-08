import { useState, useMemo, useEffect } from 'react';
import { SectionHead, DecoRule } from '../components/Shared';
import { getMoviePoster } from '../utils/posters';

// ── Post composer ─────────────────────────────────────────────────────────────
function Composer({ initialMovie = null, moviePool = [], onSave, onClose }) {
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [query,   setQuery]   = useState(initialMovie?.title || '');
  const [movie,   setMovie]   = useState(initialMovie || null);
  const [showDrop, setShowDrop] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim() || movie) return [];
    const q = query.toLowerCase();
    return moviePool.filter(m => m.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query, movie, moviePool]);

  function pickMovie(m) {
    setMovie(m);
    setQuery(m.title);
    setShowDrop(false);
  }

  function clearMovie() {
    setMovie(null);
    setQuery('');
  }

  function submit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    onSave({
      id:         `post_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title:      title.trim(),
      body:       body.trim(),
      movieId:    movie?.id   ?? null,
      movieTitle: movie?.title ?? null,
      movieYear:  movie?.year  ?? null,
      movieGenres:movie?.genres ?? [],
      createdAt:  Date.now(),
    });
  }

  return (
    <div className="blog-composer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="blog-composer" onSubmit={submit}>
        <div className="bc-head">
          <span className="bc-gem">✍️</span>
          <h2 className="bc-title">New Review</h2>
          <button type="button" className="bc-close" onClick={onClose}>✕</button>
        </div>

        {/* Movie association */}
        <div className="bc-field">
          <label className="bc-label">Picture (optional)</label>
          {movie ? (
            <div className="bc-movie-badge">
              <span className="bc-film">🎞</span>
              <span className="bc-movie-name">{movie.title}</span>
              {movie.year > 0 && <span className="bc-movie-year">{movie.year}</span>}
              <button type="button" className="bc-clear" onClick={clearMovie}>✕</button>
            </div>
          ) : (
            <div className="bc-movie-search">
              <input
                className="bc-input"
                placeholder="Search for a picture..."
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              />
              {showDrop && suggestions.length > 0 && (
                <ul className="bc-dropdown">
                  {suggestions.map(m => (
                    <li key={m.id} className="bc-drop-item" onMouseDown={() => pickMovie(m)}>
                      <span className="bc-drop-title">{m.title}</span>
                      {m.year > 0 && <span className="bc-drop-year">{m.year}</span>}
                      {m.genres[0] && <span className="bc-drop-genre">{m.genres[0]}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Post title */}
        <div className="bc-field">
          <label className="bc-label">Headline (optional)</label>
          <input
            className="bc-input"
            placeholder='e.g. "A masterpiece of shadow and light..."'
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>

        {/* Body */}
        <div className="bc-field">
          <label className="bc-label">Your Review <span className="bc-req">*</span></label>
          <textarea
            className="bc-textarea"
            placeholder="The house lights dim, the curtain rises..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div className="bc-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-gold" disabled={!body.trim()}>Publish ✦</button>
        </div>
      </form>
    </div>
  );
}

// ── Single post card ──────────────────────────────────────────────────────────
function PostCard({ post, onDelete, onMovieClick }) {
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <article className="blog-post-card">
      {post.movieTitle && (
        <div
          className="bpc-movie-tag"
          onClick={() => post.movieId && onMovieClick?.(post.movieId)}
          style={{ cursor: post.movieId ? 'pointer' : 'default' }}
        >
          <span className="bpc-film">🎞</span>
          <span>{post.movieTitle}</span>
          {post.movieYear > 0 && <span className="bpc-year">{post.movieYear}</span>}
          {post.movieGenres?.[0] && <span className="bpc-genre">{post.movieGenres[0]}</span>}
        </div>
      )}
      {post.title && <h3 className="bpc-title">"{post.title}"</h3>}
      <p className="bpc-body">{post.body}</p>
      <div className="bpc-footer">
        <span className="bpc-date">{date}</span>
        <button className="bpc-delete" onClick={() => onDelete(post.id)} title="Delete post">✕</button>
      </div>
    </article>
  );
}

// ── Blog tab ──────────────────────────────────────────────────────────────────
export function BlogTab({ posts, onSavePost, onDeletePost, onMovieClick, moviePool, composeMovie, onComposeClear }) {
  const [composing, setComposing]   = useState(!!composeMovie);
  const [composerMovie, setComposerMovie] = useState(composeMovie || null);
  const [filterMovie, setFilterMovie] = useState(null);

  useEffect(() => {
    if (composeMovie) {
      setComposerMovie(composeMovie);
      setComposing(true);
      onComposeClear?.();
    }
  }, [composeMovie]);

  // collect unique movies that have posts
  const movieFilters = useMemo(() => {
    const seen = new Map();
    for (const p of posts) {
      if (p.movieId && !seen.has(p.movieId)) {
        seen.set(p.movieId, { id: p.movieId, title: p.movieTitle, year: p.movieYear });
      }
    }
    return [...seen.values()];
  }, [posts]);

  const visible = filterMovie
    ? posts.filter(p => p.movieId === filterMovie)
    : posts;

  function handleSave(post) {
    onSavePost(post);
    setComposing(false);
    setComposerMovie(null);
  }

  function handleClose() {
    setComposing(false);
    setComposerMovie(null);
  }

  return (
    <div className="tab-panel active" id="panel-blog">
      <div className="panel-inner">

        <div className="blog-hero">
          <div className="blog-hero-top">✦ THE CRITICS' CORNER ✦</div>
          <h1 className="blog-hero-title">Silver Screen <span className="spark">Press Room</span></h1>
          <p className="blog-hero-sub">Your reviews, reflections, and reel opinions — darling.</p>
          <button className="btn-gold blog-compose-btn" onClick={() => setComposing(true)}>
            ✍️ Write a Review
          </button>
        </div>

        {/* Filter bar */}
        {movieFilters.length > 0 && (
          <>
            <SectionHead gem="◇" title="Filter by Picture" />
            <div className="blog-filter-bar">
              <button
                className={`blog-filter-chip${!filterMovie ? ' active' : ''}`}
                onClick={() => setFilterMovie(null)}
              >All</button>
              {movieFilters.map(m => (
                <button
                  key={m.id}
                  className={`blog-filter-chip${filterMovie === m.id ? ' active' : ''}`}
                  onClick={() => setFilterMovie(filterMovie === m.id ? null : m.id)}
                >
                  {m.title}{m.year > 0 ? ` (${m.year})` : ''}
                </button>
              ))}
            </div>
          </>
        )}

        <SectionHead gem="✦" title={`${visible.length} ${visible.length === 1 ? 'Review' : 'Reviews'}`} />

        {visible.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty-icon">📰</div>
            <p>No reviews yet — be the first critic on the block.</p>
            <button className="btn-gold" onClick={() => setComposing(true)}>Write the First Review</button>
          </div>
        ) : (
          <div className="blog-feed">
            {visible.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={onDeletePost}
                onMovieClick={onMovieClick}
              />
            ))}
          </div>
        )}

        <DecoRule />
      </div>

      {composing && (
        <Composer
          initialMovie={composerMovie}
          moviePool={moviePool}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
