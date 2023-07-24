const axios = require('axios');
const fs = require('fs');

const baseUrl = 'https://mdrss.tijlvdb.me/feed?';
const language = 'en'; // Change this to the language you want

async function authenticate() {
    const result = await axios.post('https://api.mangadex.org/auth/login', {
        username: 'temp',
        password: 'temp'
    });
    return { token: result.data.token.session, refreshToken: result.data.token.refresh }; // Return as an object
}

async function getAllMangaId(token: string, refreshToken: string) {
    const mangaIds = [];
    let limit = 100;
    let offset = 0;
    let total = 0;

    do {
        const result = await axios.get('https://api.mangadex.org/user/follows/manga', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                limit,
                offset,
            }
        });

        total = result.data.total;
        for (const manga of result.data.data) {
            const title = await getMangaTitleById(manga.id, token);
            mangaIds.push({ id: manga.id, title });
        }

        offset += limit;
        console.log(`Progress: ${offset}/${total}`);

    } while (offset < total);

    fs.writeFileSync('mangaIds.json', JSON.stringify(mangaIds, null, 2));
    return mangaIds.map(manga => manga.id);
}

async function getMangaTitleById(id: string, token: string) {
    try {
        const result = await axios.get(`https://api.mangadex.org/manga/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Get the title from the manga attributes
        let title = result.data.data.attributes.title.en;

        // If English title is not available, use the first available title
        if (!title) {
            const titles = result.data.data.attributes.title;
            for (let lang in titles) {
                if (titles[lang]) {
                    title = titles[lang];
                    break;
                }
            }
        }

        return title;
    } catch (error) {
        console.error(`Error occurred while fetching title for manga with id ${id}:`, error);
    }
}

async function fetchAllTitles(token: string, ids: string[]) {
    const titles: { [id: string]: string } = {};

    for (const id of ids) {
        const title = await getMangaTitleById(id, token);
        titles[id] = title;
        console.log(`Fetched title for manga with id ${id}: ${title}`);
    }

    fs.writeFileSync('mangaIdTitles.json', JSON.stringify(titles, null, 2));
    return titles;
}

async function generateFeedUrls(ids: string[], titles: { [id: string]: string }) {
    const feedUrls = [];
    for (let i = 0; i < ids.length; i += 10) {
        const mangaIds = ids.slice(i, i + 10);
        const queries = mangaIds.map((id: string) => `q=manga:${id},tl:${language}`).join('&');
        const url = `${baseUrl}${queries}`;
        feedUrls.push({ url, titles: mangaIds.map(id => titles[id]) });
    }
    fs.writeFileSync('feedUrls.json', JSON.stringify(feedUrls, null, 2));
}

authenticate()
    .then(({ token, refreshToken }) => {
        return getAllMangaId(token, refreshToken).then((ids) => {
            return fetchAllTitles(token, ids).then((titles) => {
                generateFeedUrls(ids, titles);
            });
        });
    })
    .catch(console.error);
