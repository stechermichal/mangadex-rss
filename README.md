# MangaDex-RSS

## Introduction

The MangaDex-RSS tool exists to simplify the process of creating RSS feed for your followed manga via the MangaDex API and [mdrss-ts](https://github.com/kindlyfire/mdrss-ts).
Basically, you will get a bunch of URLs you can just paste into your RSS reader and get notified when a new chapter of any of your followed manga is released.

## How it works

The tool follows these steps to generate your RSS feeds:

1. It authenticates with the MangaDex API using your username and password.
2. It fetches the list of manga series you are following.
3. It generates the RSS feed URLs for these series.
4. It saves these URLs to a file, which you can then import into your RSS reader.

You will end up with 3 new files in the folder: `feedUrls.json`, `mangaTitles.json` and `feedUrlsList.txt`. The first two exist mostly just so you can check that the list looks about right and everything went well. The contents of `feedUrlsList.txt` you can just copy paste into your RSS reader.

## How to use

### Prerequisites

You need Node.js installed on your system. You can check whether you have these installed by typing `node -v` into your terminal/console. If it is installed, this command should display the installed versions. If not, you will need to install Node.js from [here](https://nodejs.org/).

### Setup for Windows
1. Open the start menu and search for `Command Prompt` and open it.
2. You then need to navigate to the location you want to use for this. You can use the command `chdir` to see where you are, use `cd ..` to go up a folder and `cd <folder name>` to go into a folder.
3. Once you are in the folder you want to use, you need to clone the repository. You can do this by typing `git clone https://github.com/stechermichal/mangadex-rss.git`.
4. You can then use the normal file explorer to navigate to the folder and open the `config.json` file. You should be able to use Notepad, if you don't have any other text editor installed.
5. You need to change the inside of the single quotes for USERNAME and PASSWORD and enter your MangaDex username and password. When you save the file, it should look something like this:
```
export default {
    BASE_URL: 'https://mdrss.tijlvdb.me/feed?',
    MANGA_API: 'https://api.mangadex.org',
    DEFAULT_LANGUAGE: 'en',
    USERNAME: 'AvidMangaReader',
    PASSWORD: 'dfF42Dfio334j',
};

```
6. You can then go ahead and run the `run.bat` file. This will open a command prompt window and run the tool.
7. You can find the URLs in `feedUrlsList.txt`, you can go ahead and paste them into your RSS reader.

### Setup for Linux

1. `git clone https://github.com/stechermichal/mangadex-rss.git`  
2. Open `config.json` and set your MangaDex username and password in the `USERNAME` and `PASSWORD` fields.
3. You can either just do the next part yourself by running `npx tsc` and then `node dist/index.js` or you can run the `run.sh` file. You do need to set up permissions for the file first, by running `chmod +x run.sh`. 
4. You can find the URLs in `feedUrlsList.txt`, you can go ahead and paste them into your RSS reader.
