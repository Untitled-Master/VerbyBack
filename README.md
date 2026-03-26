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
| GET | `/api/random` | Get a random verb with all conjugations |
| GET | `/api/random/:mode` | Get a random verb filtered by mode |
| GET | `/api/random/:mode/:tense` | Get a random verb filtered by mode and tense |

## Modes & Tenses

Common modes: `Indicatif`, `Conditionnel`, `Impersonnel`, `Infinitif`, `Participe`, `Subjonctif`, `Impératif`

Example tenses per mode:
- **Indicatif**: Présent, Passé simple, Imparfait, Futur simple, Plus-que-parfait, Passé antérieur, Futur antérieur, Passé composé
- **Conditionnel**: Présent, Passé
- **Subjonctif**: Présent, Passé
- **Impératif**: Présent, Passé
- **Infinitif**: Présent, Passé
- **Participe**: Présent, Passé
- **Impersonnel**: Infinitif, Participe

## Examples

```bash
# Health check
curl http://localhost:3000/health

# Search for verbs starting with "parl"
curl http://localhost:3000/api/search/parl

# Get all conjugations for "manger"
curl http://localhost:3000/api/conjugate/manger

# Get only the Indicatif mode for "avoir"
curl http://localhost:3000/api/conjugate/avoir/indicatif

# Get Present tense in Subjonctif for "être"
curl http://localhost:3000/api/conjugate/etre/subjonctif/present

# Get a random verb
curl http://localhost:3000/api/random

# Get a random verb with only Subjonctif conjugations
curl http://localhost:3000/api/random/subjonctif

# Get a random verb with only Present tense in Subjonctif
curl http://localhost:3000/api/random/subjonctif/present
```

## Testing

Open `test/index.html` in a browser or serve it alongside the API.

Made by **0xs4b**
