import axios from 'axios';
import fs from 'fs';
import CONFIG from './config';

interface Manga {
    id: string;
    title: string;
}

interface TokenResponse {
    token: string; // The actual token we'll use for subsequent requests
    refreshToken: string; // A refresh token in case our token expires
}

// Function to authenticate the user and get the tokens.
async function authenticate(): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', CONFIG.USERNAME);
    formData.append('password', CONFIG.PASSWORD);
    formData.append('client_id', CONFIG.CLIENT_ID);
    formData.append('client_secret', CONFIG.CLIENT_SECRET);

    const result = await axios.post(`https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token`, formData.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return {
        token: result.data.access_token,
        refreshToken: result.data.refresh_token
    };
}

// Function to fetch all Manga IDs and their titles that the user is following. The titles are ultimately not needed for anything,
// but it's a nice overview and an easy way to see if something went wrong.
async function getAllMangaId(token: string, refreshToken: string): Promise<Manga[]> {
    const mangaIds: Manga[] = [];
    let limit = 10;
    let offset = 0;
    let total = 0;

    do {
        const result = await axios.get(`${CONFIG.MANGA_API}/user/follows/manga`, {
            headers: {
                Authorization: `Bearer ${token}` // Include token in the headers
            },
            params: {
                limit,
                offset,
            }
        });

        total = result.data.total;

        // Iterate over each manga in the response, fetch the title for the manga, add manga to our array
        for (const manga of result.data.data) {
            const title = await getMangaTitleById(manga.id, token);
            console.log(`Fetched title for manga with id ${manga.id}: ${title}`);
            mangaIds.push({ id: manga.id, title });
        }

        // Increase the offset by the limit for the next iteration
        offset += limit;

        // Log progress for clarity
        console.log(`Progress: ${Math.min(offset, total)}/${total}`);
    } while (offset < total);

    return mangaIds;
}

// Function to fetch a manga's title by its ID
async function getMangaTitleById(id: string, token: string): Promise<string> {
    try {
        const result = await axios.get(`${CONFIG.MANGA_API}/manga/${id}`, {
            headers: {
                Authorization: `Bearer ${token}` // Include token in the headers
            }
        });

        // Try to get the English title first
        let title = result.data.data.attributes.title.en;

        // If no English title was found
        if (!title) {
            // Check for title in other languages
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

// Function to fetch all manga titles from the given array of manga
async function fetchAllTitles(mangas: Manga[]): Promise<Record<string, string>> {
    const titles: Record<string, string> = {};

    for (const manga of mangas) {
        titles[manga.id] = manga.title;
    }

    writeToFile('mangaIdTitles.json', titles);
    return titles;
}

// Function to generate feed URLs for each batch of 10 manga and write them to a JSON file and a text file
function generateFeedUrls(mangas: Manga[], titles: Record<string, string>): void {
    const feedUrls: { url: string, titles: string[] }[] = [];
    let feedUrlsList = ''; // String to store feed URLs line by line

    // Iterate over the array of manga in batches of 10, because that's the max mdrss supports
    for (let i = 0; i < mangas.length; i += 10) {
        const mangaSlice = mangas.slice(i, i + 10);
        const queries = mangaSlice.map(manga => `q=manga:${manga.id},tl:${CONFIG.DEFAULT_LANGUAGE}`).join('&');

        // Create the full URL with the base URL and the queries
        const url = `${CONFIG.BASE_URL}${queries}`;

        // Add this URL and the corresponding titles to our array
        feedUrls.push({ url, titles: mangaSlice.map(manga => titles[manga.id]) });

        // Add this URL to our list of URLs, followed by a newline
        // We are doing this to have a file that's easy to copy paste all at once for RSS feeds that support pasting multiple URLs that way
        feedUrlsList += url + '\n';
    }
    writeToFile('feedUrls.json', feedUrls);
    writeToFile('feedUrlsList.txt', feedUrlsList, false);
}

function writeToFile(fileName: string, data: any, stringify: boolean = true): void {
    fs.writeFileSync(fileName, stringify ? JSON.stringify(data, null, 2) : data);
}

// Authenticate, get tokens, fetch all followed manga IDs and titles, collect the titles, generate feed URLs, write to files
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
