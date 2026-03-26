const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'test')));

async function getRandomVerb(mode, tense) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const verbs = await searchVerbs(randomLetter);
    
    if (verbs.length === 0) {
        throw new Error('No verbs found');
    }

    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const conjugations = await getConjugations(randomVerb);

    if (mode && tense) {
        const modeSlug = slugify(mode);
        const tenseSlug = slugify(tense);
        const modeName = Object.keys(conjugations.conjugations).find(m => slugify(m) === modeSlug);
        if (!modeName) throw new Error(`Mode "${mode}" not found`);
        const tenseName = Object.keys(conjugations.conjugations[modeName]).find(t => slugify(t) === tenseSlug);
        if (!tenseName) throw new Error(`Tense "${tense}" not found`);
        return { verb: randomVerb, mode: modeName, tense: tenseName, forms: conjugations.conjugations[modeName][tenseName] };
    }

    if (mode) {
        const modeSlug = slugify(mode);
        const modeName = Object.keys(conjugations.conjugations).find(m => slugify(m) === modeSlug);
        if (!modeName) throw new Error(`Mode "${mode}" not found`);
        return { verb: randomVerb, mode: modeName, tenses: conjugations.conjugations[modeName] };
    }

    return conjugations;
}

/**
 * Normalizes strings for URL matching.
 */
const slugify = (str) => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
};

/**
 * Logic for Verb Conjugation Scraping
 */
async function getConjugations(verb) {
    const url = `https://leconjugueur.lefigaro.fr/php5/index.php?verbe=${encodeURIComponent(verb)}`;

    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const $ = cheerio.load(data);
    const result = {
        verb: verb,
        conjugations: {}
    };

    let currentMode = "";

    $('main h2, main .conjugBloc').each((i, el) => {
        const $el = $(el);

        if ($el.is('h2')) {
            currentMode = $el.text().trim();
            result.conjugations[currentMode] = {};
        } else if ($el.hasClass('conjugBloc') && currentMode !== "") {
            const tenseName = $el.find('.tempsBloc').text().trim();

            if (tenseName) {
                const $temp = $el.clone();
                $temp.find('.tempsBloc').remove();

                const forms = $temp.html()
                    .split('<br>')
                    .map(line => cheerio.load(line).text().trim())
                    .filter(line => line.length > 0);

                if (forms.length > 0) {
                    result.conjugations[currentMode][tenseName] = forms;
                }
            }
        }
    });

    for (const mode in result.conjugations) {
        if (Object.keys(result.conjugations[mode]).length === 0) {
            delete result.conjugations[mode];
        }
    }

    if (Object.keys(result.conjugations).length === 0) {
        throw new Error('Verb not found');
    }

    return result;
}

/**
 * Logic for Search/Suggestions
 * Handles both JSON arrays and HTML responses
 */
async function searchVerbs(query) {
    const url = `https://leconjugueur.lefigaro.fr/php5/cherche.php?verbe=${encodeURIComponent(query)}&lang=fr`;

    const response = await axios.get(url, {
        headers: {
            "accept": "*/*",
            "accept-language": "fr,en;q=0.9,en-US;q=0.8,ar;q=0.7,fa;q=0.6",
            "sec-ch-ua": "\"Chromium\";v=\"146\", \"Not-A.Brand\";v=\"24\", \"Microsoft Edge\";v=\"146\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "Referer": "https://leconjugueur.lefigaro.fr/php5/index.php?verbe=faire",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36"
        }
    });

    const data = response.data;

    // 1. If Axios already parsed it as an Array (happens with 'hii' query)
    if (Array.isArray(data)) {
        return data;
    }

    // 2. If it is a string, we need to parse it
    if (typeof data === 'string') {
        // Try to see if it's a JSON string that Axios missed
        if (data.trim().startsWith('[')) {
            try { return JSON.parse(data); } catch (e) {}
        }

        // Use Regex to extract text between HTML tags (handles <a>links</a>)
        const matches = data.match(/>([^<]+)</g);
        if (matches) {
            return matches.map(m => m.replace(/[><]/g, '').trim()).filter(m => m.length > 0);
        }

        // Fallback: split by line and strip tags
        return data
            .replace(/<\/?[^>]+(>|$)/g, "")
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    return [];
}

// --- ENDPOINTS ---

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        service: 'French Conjugation & Search API',
        version: '1.0.0',
        madeby: '0xs4b',
        endpoints: {
            search: {
                method: 'GET',
                path: '/api/search/:query',
                description: 'Search for verbs by query string'
            },
            conjugate: {
                method: 'GET',
                path: '/api/conjugate/:verb',
                description: 'Get all conjugations for a verb'
            },
            conjugate_mode: {
                method: 'GET',
                path: '/api/conjugate/:verb/:mode',
                description: 'Get conjugations for a specific mode (e.g., Indicatif, Subjonctif)'
            },
            conjugate_tense: {
                method: 'GET',
                path: '/api/conjugate/:verb/:mode/:tense',
                description: 'Get conjugations for a specific mode and tense'
            },
            random: {
                method: 'GET',
                path: '/api/random',
                description: 'Get a random verb with all conjugations'
            },
            random_mode: {
                method: 'GET',
                path: '/api/random/:mode',
                description: 'Get a random verb with conjugations for a specific mode'
            },
            random_tense: {
                method: 'GET',
                path: '/api/random/:mode/:tense',
                description: 'Get a random verb with conjugations for a specific mode and tense'
            },
            health: {
                method: 'GET',
                path: '/health',
                description: 'Check service health status'
            }
        }
    });
});

app.get('/api/search/:query', async (req, res) => {
    try {
        const list = await searchVerbs(req.params.query);
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: "Search failed", details: error.message });
    }
});

app.get('/api/conjugate/:verb', async (req, res) => {
    try {
        const data = await getConjugations(req.params.verb);
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.get('/api/conjugate/:verb/:mode', async (req, res) => {
    const { verb, mode } = req.params;
    const targetModeSlug = slugify(mode);
    try {
        const data = await getConjugations(verb);
        const actualModeName = Object.keys(data.conjugations).find(m => slugify(m) === targetModeSlug);
        if (!actualModeName) return res.status(404).json({ error: `Mode "${mode}" not found.` });
        res.json({ verb, mode: actualModeName, tenses: data.conjugations[actualModeName] });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.get('/api/conjugate/:verb/:mode/:tense', async (req, res) => {
    const { verb, mode, tense } = req.params;
    const targetModeSlug = slugify(mode);
    const targetTenseSlug = slugify(tense);
    try {
        const data = await getConjugations(verb);
        const actualModeName = Object.keys(data.conjugations).find(m => slugify(m) === targetModeSlug);
        if (!actualModeName) return res.status(404).json({ error: `Mode "${mode}" not found.` });
        const modeData = data.conjugations[actualModeName];
        const actualTenseName = Object.keys(modeData).find(t => slugify(t) === targetTenseSlug);
        if (!actualTenseName) return res.status(404).json({ error: `Tense "${tense}" not found.` });
        res.json({ verb, mode: actualModeName, tense: actualTenseName, forms: modeData[actualTenseName] });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.get('/api/random', async (req, res) => {
    try {
        const data = await getRandomVerb();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/random/:mode', async (req, res) => {
    try {
        const data = await getRandomVerb(req.params.mode);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/random/:mode/:tense', async (req, res) => {
    try {
        const data = await getRandomVerb(req.params.mode, req.params.tense);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend active at http://localhost:${PORT}`);
});