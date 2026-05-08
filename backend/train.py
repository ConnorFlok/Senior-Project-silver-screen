"""
train.py — generates all ML artifacts for the CineScope backend.
Run from the silver-screen 6 root directory:
    python3 backend/train.py
"""

import json, re, shutil, string, warnings
from pathlib import Path

import joblib, numpy as np, pandas as pd, scipy.sparse as sp
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_samples
from sklearn.metrics.pairwise import linear_kernel
from sklearn.preprocessing import StandardScaler
from tqdm import tqdm

warnings.filterwarnings('ignore')

# ── Config ────────────────────────────────────────────────────────────────────
DATA_DIR      = Path('/Users/dxg/Downloads')
ARTIFACTS_DIR = Path('backend/artifacts')
TMP_DIR       = Path('backend/artifacts_tmp')
N_CLUSTERS    = 7
TOP_K         = 100
CHUNK_SIZE    = 200
RANDOM_STATE  = 42
MIN_RATINGS   = 5

TMP_DIR.mkdir(parents=True, exist_ok=True)

# ── Helpers ───────────────────────────────────────────────────────────────────
def parse_genres(s):
    if not isinstance(s, str): return []
    return [g.strip() for g in s.split('|') if g.strip() and g.strip() != '(no genres listed)']

def parse_tags(s):
    if not isinstance(s, str): return []
    return [t.strip().lower() for t in s.split('|') if t.strip()]

def extract_year(title):
    m = re.search(r'\((\d{4})\)\s*$', str(title))
    return int(m.group(1)) if m else 0

def clean_title(title):
    title = re.sub(r'\(\d{4}\)\s*$', '', str(title)).strip()
    title = title.lower().translate(str.maketrans('', '', string.punctuation))
    return re.sub(r'\s+', ' ', title).strip()

def tokens_to_str(lst):
    return ' '.join(t.lower().replace(' ', '') for t in lst if t)

# ── Load CSVs ────────────────────────────────────────────────────────────────
print('Loading CSVs...')
movies  = pd.read_csv(DATA_DIR / 'movies.csv')
ratings = pd.read_csv(DATA_DIR / 'ratings.csv')
tags    = pd.read_csv(DATA_DIR / 'tags.csv')
links   = pd.read_csv(DATA_DIR / 'links.csv')
print(f'  movies: {len(movies):,}  ratings: {len(ratings):,}  tags: {len(tags):,}  links: {len(links):,}')

# ── Merge & aggregate ─────────────────────────────────────────────────────────
print('Merging and aggregating...')
rating_stats = (
    ratings.groupby('movieId')['rating']
    .agg(avg_rating='mean', rating_count='count')
    .reset_index()
)

tags_agg = (
    tags.groupby('movieId')['tag']
    .apply(lambda x: ' | '.join(x.astype(str)))
    .reset_index()
)

df = (
    movies
    .merge(links,       on='movieId', how='left')
    .merge(rating_stats,on='movieId', how='left')
    .merge(tags_agg,    on='movieId', how='left')
)
df['avg_rating']   = df['avg_rating'].fillna(0.0).round(4)
df['rating_count'] = df['rating_count'].fillna(0).astype(int)
df = df[df['rating_count'] >= MIN_RATINGS].reset_index(drop=True)

df['genres_list'] = df['genres'].apply(parse_genres)
df['tags_list']   = df['tag'].apply(parse_tags)
df['year']        = df['title'].apply(extract_year).astype(float)
df['clean_title'] = df['title'].apply(clean_title)
df['movie_id']    = df.index

print(f'  {len(df):,} movies after {MIN_RATINGS}+ ratings filter')

# ── Build soup & TF-IDF ───────────────────────────────────────────────────────
print('Building soup text...')
def build_soup(row):
    g = tokens_to_str(row['genres_list'])
    t = tokens_to_str(row['tags_list'])
    n = row['clean_title']
    return ' '.join(p for p in [g, g, t, n] if p)

df['soup_text'] = df.apply(build_soup, axis=1)

print('Fitting TF-IDF...')
tfidf        = TfidfVectorizer(stop_words='english', min_df=2, max_df=0.95)
tfidf_matrix = tfidf.fit_transform(df['soup_text'])
print(f'  matrix: {tfidf_matrix.shape}  vocab: {len(tfidf.vocabulary_):,}')

title_to_index    = {row['title']: i for i, row in df.iterrows()}
index_to_movie_id = {i: int(row['movie_id']) for i, row in df.iterrows()}

# ── Cosine top-K index ────────────────────────────────────────────────────────
n = tfidf_matrix.shape[0]
cosine_topk_index = {}
print(f'Building cosine top-{TOP_K} index for {n:,} movies...')
for start in tqdm(range(0, n, CHUNK_SIZE), desc='Cosine chunks'):
    end  = min(start + CHUNK_SIZE, n)
    sims = linear_kernel(tfidf_matrix[start:end], tfidf_matrix)
    k    = min(n, TOP_K + 1)
    for local_i, row_sims in enumerate(sims):
        global_i = start + local_i
        top_idx  = np.argpartition(row_sims, -k)[-k:]
        top_idx  = top_idx[np.argsort(row_sims[top_idx])[::-1]]
        cosine_topk_index[global_i] = [
            (int(j), float(row_sims[j]))
            for j in top_idx if j != global_i
        ][:TOP_K]

# ── K-Means clustering ────────────────────────────────────────────────────────
print('Building combined feature matrix + fitting KMeans...')
num_feats  = df[['avg_rating', 'rating_count', 'year']].fillna(0).values
scaler     = StandardScaler()
num_scaled = scaler.fit_transform(num_feats)
X          = sp.hstack([tfidf_matrix, sp.csr_matrix(num_scaled)])

kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=RANDOM_STATE, n_init=10)
kmeans.fit(X)
df['cluster'] = kmeans.labels_
print(f'  KMeans done — {N_CLUSTERS} clusters')

# ── Silhouette scores ─────────────────────────────────────────────────────────
print('Computing silhouette scores...')
MAX_SIL = 5000
n_movies = X.shape[0]
if n_movies <= MAX_SIL:
    sil_scores = silhouette_samples(X.toarray(), kmeans.labels_)
    df['silhouette'] = sil_scores
else:
    rng        = np.random.RandomState(RANDOM_STATE)
    sample_idx = rng.choice(n_movies, MAX_SIL, replace=False)
    sil_scores = silhouette_samples(X[sample_idx].toarray(), kmeans.labels_[sample_idx])
    df['silhouette'] = 0.0
    df.loc[sample_idx, 'silhouette'] = sil_scores
print(f'  mean silhouette: {df["silhouette"].mean():.4f}')

# ── Save artifacts ────────────────────────────────────────────────────────────
print('Saving artifacts...')
joblib.dump(tfidf,  TMP_DIR / 'tfidf_vectorizer.pkl')
sp.save_npz(str(TMP_DIR / 'tfidf_matrix.npz'), tfidf_matrix)
joblib.dump(kmeans, TMP_DIR / 'kmeans.pkl')
joblib.dump(scaler, TMP_DIR / 'scaler.pkl')

with open(TMP_DIR / 'cosine_topk_index.json', 'w') as f:
    json.dump({str(k): v for k, v in cosine_topk_index.items()}, f)

with open(TMP_DIR / 'title_to_index.json', 'w') as f:
    json.dump(title_to_index, f, ensure_ascii=False)

with open(TMP_DIR / 'index_to_movie_id.json', 'w') as f:
    json.dump({str(k): v for k, v in index_to_movie_id.items()}, f)

df[['movie_id', 'movieId', 'title', 'cluster', 'silhouette']].to_parquet(
    TMP_DIR / 'movie_ml.parquet', index=False)

meta_cols = ['movie_id','movieId','title','clean_title','year','genres_list',
             'tags_list','avg_rating','rating_count','imdbId','tmdbId',
             'cluster','silhouette','soup_text']
df[[c for c in meta_cols if c in df.columns]].to_parquet(
    TMP_DIR / 'movies_metadata.parquet', index=False)

# Atomic swap
if ARTIFACTS_DIR.exists():
    shutil.rmtree(ARTIFACTS_DIR)
TMP_DIR.rename(ARTIFACTS_DIR)

print(f'\n✅ Artifacts saved to {ARTIFACTS_DIR.resolve()}')
for f in sorted(ARTIFACTS_DIR.iterdir()):
    print(f'   {f.name:<40} {f.stat().st_size/1024:>9.1f} KB')
