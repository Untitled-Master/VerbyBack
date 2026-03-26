# VerbyBack

French Conjugation & Search API

## Setup

```bash
npm install
```

## Run

```bash
node index.js
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Check service health |
| GET | `/api/search/:query` | Search for verbs |
| GET | `/api/conjugate/:verb` | Get all conjugations for a verb |
| GET | `/api/conjugate/:verb/:mode` | Get conjugations for a specific mode |
| GET | `/api/conjugate/:verb/:mode/:tense` | Get conjugations for a specific mode and tense |

## Examples

```bash
# Search for verbs starting with "parl"
curl http://localhost:3000/api/search/parl

# Get all conjugations for "manger"
curl http://localhost:3000/api/conjugate/manger

# Get only the Indicatif mode for "avoir"
curl http://localhost:3000/api/conjugate/avoir/indicatif
```

Made by **0xs4b**
