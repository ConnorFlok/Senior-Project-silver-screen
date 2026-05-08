import { useRef, useMemo } from 'react';
import { SectionHead, DecoRule } from '../components/Shared';
import { PosterCard } from '../components/PosterCard';
import { MovieRow } from '../components/MovieRow';

export function NowPlayingTab({ watchlist, onToggleWl, onSelect, onSwitchTab, moviePool, liveReady }) {
  const carRef = useRef(null);
  const pool   = moviePool || [];

  // ── Section splits ────────────────────────────────────────────────────────
  const liveMovies = useMemo(() => pool.filter(m => m._source === 'tmdb-live'), [pool]);
  const mlMovies   = useMemo(() => pool.filter(m => m._source !== 'tmdb-live'), [pool]);

  // "Now Showing" = interleaved mix: up to 3 live releases + 3 curated classics
  const nowShowing = useMemo(() => {
    const live = liveMovies.slice(0, 3);

    // Pick top-rated ML classics with genre diversity (one per genre bucket)
    const seenGenres = new Set();
    const picks = [];
    const candidates = [...mlMovies]
      .filter(m => m.vote_average >= 7.5 && m.vote_count > 100)
      .sort((a, b) => b.vote_average * Math.log1p(b.vote_count) - a.vote_average * Math.log1p(a.vote_count));
    for (const m of candidates) {
      if (picks.length >= 3) break;
      const genre = m.genres[0] || 'Drama';
      if (!seenGenres.has(genre)) { seenGenres.add(genre); picks.push(m); }
    }

    // Interleave: live, classic, live, classic, ...
    const mixed = [];
    const maxLen = Math.max(live.length, picks.length);
    for (let i = 0; i < maxLen; i++) {
      if (live[i])  mixed.push({ ...live[i],  _slot: 'live' });
      if (picks[i]) mixed.push({ ...picks[i], _slot: 'pick' });
    }
    return mixed.slice(0, 6);
  }, [liveMovies, mlMovies]);

  // "Coming Attractions" = next 6 ML movies not already in nowShowing
  const nowShowingIds = useMemo(() => new Set(nowShowing.map(m => m.id)), [nowShowing]);
  const coming = useMemo(() => mlMovies.filter(m => !nowShowingIds.has(m.id)).slice(0, 6), [mlMovies, nowShowingIds]);

  // "Box Office" carousel = top 12 by vote_average (mix of both sources)
  const boxOffice = useMemo(() => {
    const rated = pool.filter(m => m.vote_average > 0);
    const sorted = [...rated].sort((a, b) => b.vote_average - a.vote_average).slice(0, 12);
    return sorted.length >= 6 ? sorted : pool.slice(0, 12);
  }, [pool]);

  const LIVE_TAGS = ['In Cinemas Now','New Release','Opening Week'];
  const PICK_TAGS = ['Staff Pick','From the Archives','Classic Cut'];
  let liveIdx = 0, pickIdx = 0;
  const nowTags = nowShowing.map(m =>
    m._slot === 'live' ? LIVE_TAGS[liveIdx++] || 'New Release'
                       : PICK_TAGS[pickIdx++] || 'Staff Pick'
  );

  return (
    <div className="tab-panel active" id="panel-nowplaying">

      {/* Vertical marquee sidebar */}
      <div className="left-marquee">
        <div className="marquee-frame">
          <div className="bulb-rail br-t"/><div className="bulb-rail br-b"/>
          <div className="bulb-rail br-l"/><div className="bulb-rail br-r"/>
          <div className="marquee-inner">
            <div className="mqk">NOW</div>
            <div className="mqb">SHOWING</div>
            <div className="mqm">Tonight Only</div>
          </div>
        </div>
      </div>

      <div className="panel-inner with-left-marquee">

        {/* Hero */}
        <div className="marquee-hero">
          <div className="mh-top">Feature Presentation</div>
          <h1 className="mh-title">Now <span className="spark">Playing</span> Tonight</h1>
          <p className="mh-sub">
            New releases from cinemas worldwide, plus 87,000 classics from our archives — curated just for you, darling.
          </p>
          <div className="mh-actions">
            <button className="btn-gold" onClick={() => onSwitchTab('quiz')}>Find My Picture ✦</button>
            <button className="btn-ghost" onClick={() => onSwitchTab('search')}>Browse the Catalogue</button>
          </div>
        </div>

        {/* Now Showing — mixed new releases + curated picks */}
        <SectionHead gem="✦" title="Now Showing — Tonight's Programme" />
        {!liveReady && liveMovies.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <div style={{ fontSize:'24px', animation:'reelSpin 1s linear infinite', display:'inline-block' }}>🎬</div>
            <p style={{ marginTop:'8px', fontSize:'14px' }}>Checking tonight's programme…</p>
          </div>
        ) : (
          <div className="now-grid">
            {nowShowing.map((m, i) => (
              <PosterCard key={m.id} movie={m} tag={nowTags[i] || 'Technicolor Pick'}
                watchlist={watchlist} onToggleWl={onToggleWl} onSelect={onSelect} />
            ))}
          </div>
        )}

        <DecoRule />

        {/* Coming Attractions — top MovieLens classics */}
        <SectionHead gem="◇" title="Coming Attractions" />
        <p className="section-note">"A few delicious previews — before the lights go all the way down."</p>
        {coming.map((m, i) => (
          <MovieRow key={m.id} movie={m} rank={i + 1}
            watchlist={watchlist} onToggleWl={onToggleWl} onSelect={onSelect} />
        ))}

        <DecoRule><span>★</span><span>◆</span><span>★</span></DecoRule>

        {/* Box Office Favorites carousel */}
        <SectionHead gem="★" title="Box Office Favorites" />
        <p className="section-note">"Crowd-pleasers with a touch of sparkle — step right up."</p>
        <div className="carousel-wrap">
          <button className="car-arrow left"
            onClick={() => carRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}>‹</button>
          <div className="carousel-track" ref={carRef}>
            {boxOffice.map(m => (
              <PosterCard key={m.id} movie={m} small
                watchlist={watchlist} onToggleWl={onToggleWl} onSelect={onSelect} />
            ))}
          </div>
          <button className="car-arrow right"
            onClick={() => carRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}>›</button>
        </div>

      </div>
    </div>
  );
}
