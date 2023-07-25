import axios from 'axios';
import fs from 'fs';
import CONFIG from './config';

interface Manga {
    id: string;
    title: string;
}

interface TokenResponse {
    token: string;
    refreshToken: string;
}

async function authenticate(): Promise<TokenResponse> {
    const result = await axios.post(`${CONFIG.MANGA_API}/auth/login`, {
        username: CONFIG.USERNAME,
        password: CONFIG.PASSWORD
    });
    return { token: result.data.token.session, refreshToken: result.data.token.refresh };
}

async function getAllMangaId(token: string, refreshToken: string): Promise<Manga[]> {
    const mangaIds: Manga[] = [];
    let limit = 10;
    let offset = 0;
    let total = 0;

    do {
        const result = await axios.get(`${CONFIG.MANGA_API}/user/follows/manga`, {
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
            console.log(`Fetched title for manga with id ${manga.id}: ${title}`);
            mangaIds.push({ id: manga.id, title });
        }

        offset += limit;
        console.log(`Progress: ${Math.min(offset, total)}/${total}`);
    } while (offset < total);

    return mangaIds;
}

async function getMangaTitleById(id: string, token: string): Promise<string> {
    try {
        const result = await axios.get(`${CONFIG.MANGA_API}/manga/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        let title = result.data.data.attributes.title.en;
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
        return 'Title not found';
    }
}

async function fetchAllTitles(mangas: Manga[]): Promise<Record<string, string>> {
    const titles: Record<string, string> = {};

    for (const manga of mangas) {
        titles[manga.id] = manga.title;
    }

    writeToFile('mangaIdTitles.json', titles);
    return titles;
}

function generateFeedUrls(mangas: Manga[], titles: Record<string, string>): void {
    const feedUrls: {url: string, titles: string[]}[] = []; // Fixed here
    let feedUrlsList = '';
    for (let i = 0; i < mangas.length; i += 10) {
        const mangaSlice = mangas.slice(i, i + 10);
        const queries = mangaSlice.map(manga => `q=manga:${manga.id},tl:${CONFIG.DEFAULT_LANGUAGE}`).join('&');
        const url = `${CONFIG.BASE_URL}${queries}`;
        feedUrls.push({ url, titles: mangaSlice.map(manga => titles[manga.id]) });
        feedUrlsList += url + '\n';
    }
    writeToFile('feedUrls.json', feedUrls);
    writeToFile('feedUrlsList.txt', feedUrlsList, false);
}


function writeToFile(fileName: string, data: any, stringify: boolean = true): void {
    fs.writeFileSync(fileName, stringify ? JSON.stringify(data, null, 2) : data);
}

async function start(): Promise<void> {
    try {
        const { token, refreshToken } = await authenticate();
        const mangas = await getAllMangaId(token, refreshToken);
        const titles = await fetchAllTitles(mangas);
        generateFeedUrls(mangas, titles);
    } catch (error) {
        console.error(error);
    }
}

start();
