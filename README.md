# MangaDex-RSS

## Table of Contents

- [Introduction](#introduction)
- [How It Works](#how-it-works)
- [How to Use](#how-to-use)
  - [Prerequisites](#prerequisites)
  - [Setup for Windows](#setup-for-windows)
  - [Setup for Linux](#setup-for-linux)
- [Known Issues](#known-issues)

## Introduction

The MangaDex-RSS tool exists to simplify the process of creating RSS feed for your followed manga via the MangaDex API and [mdrss-ts](https://github.com/kindlyfire/mdrss-ts).
Basically, you will get a bunch of URLs you can just paste into your RSS reader and get notified when a new chapter of any of your followed manga is released.

Anyone can do this, you don't need much computer knowledge. Takes 5-20 minutes to follow along with this guide.

There are 2 things that you should be aware of before getting started:
1. With the current API login process it requires you to request an API Client in Mangadex settings. That is not difficult, but you need to wait a day or two for it to get approved, though that might become automated in the future.
The process of doing this is described later

2. It takes your current followed manga, it can't account for changes. If you decide to drop a manga or pick up a new one, you will need to either run it again or add/remove that one manually from your RSS reader.
Personally I have like 200 manga that I follow and I don't change it all that often. I usually run run the tool again like every few months when I feel like I've probably followed/unfollowed a few things.

## How it works

The tool follows these steps to generate your RSS feeds:

1. It authenticates with the MangaDex API using your username, password and API client you set up in Mangadex settings.
2. It fetches the list of manga series you are following.
3. It generates the RSS feed URLs for these series.
4. It saves these URLs to a file, which you can then import into your RSS reader.

You will end up with 3 new files in the folder: `feedUrls.json`, `mangaTitles.json` and `feedUrlsList.txt`. The first two exist mostly just so you can check that the list looks about right and everything went well. The contents of `feedUrlsList.txt` you can just copy paste into your RSS reader.

## How to use

### Prerequisites

1. Have API Client set up in settings. This is an easy process, but requires staff to approve it which may take like a day.
- Log in to Mangadex.com, go to your settings and click on "API Clients" on the left bottom.
- Click on the "Create" button.
- Name: "rss-feed", description: "for rss feed auth"
- Confirm with the orange "Create" button on bottom right.
- You will know it's been approved once there is a green dot next to the name. Click on the name and you will see the client id and secret. You will need these for the `config.ts` file later.


2. You need Node.js installed on your system. You can check whether you have these installed by typing `node -v` into your terminal/console. If it is installed, this command should display the installed versions. If not, you will need to install Node.js from [here]().

### Setup for Windows
1. Open the start menu and search for `Command Prompt` and open it.
2. You then need to navigate to the location you want to use for this. You can use the command `chdir` to see where you are, use `cd ..` to go up a folder and `cd <folder name>` to go into a folder.
3. Once you are in the folder you want to use, you need to clone the repository. You can do this by typing `git clone https://github.com/stechermichal/mangadex-rss.git`.
4. You can then use the normal file explorer to navigate to the folder and open the `config.ts` file. You should be able to use Notepad, if you don't have any other text editor installed.
5. You need to change the inside of the single quotes for USERNAME and PASSWORD and enter your MangaDex username and password.
6. Enter the API Client name(for CLIENT_ID) and secret(for CLIENT_SECRET). Personal client/CLIENT_ID is the long text that starts with "personal-client-". Then click "Get Secret" to display the CLIENT_SECRET. When you save the file, it should look something like this:
```
export default {
    BASE_URL: 'https://mdrss.tijlvdb.me/feed?',
    MANGA_API: 'https://api.mangadex.org',
    DEFAULT_LANGUAGE: 'en',
    USERNAME: 'yourUsernameHere',
    PASSWORD: 'yourPasswordHere',
    CLIENT_ID: 'yourPersonalClientIdHere', // this is the thing that starts with personal-client-
    CLIENT_SECRET: 'yourPersonalClientSecretHere',
};

```
6. You can then go ahead and run the `run.bat` file. This will open a command prompt window and run the tool.
7. You can find the URLs in `feedUrlsList.txt`, you can go ahead and paste them into your RSS reader.

### Setup for Linux

1. `git clone https://github.com/stechermichal/mangadex-rss.git`  
2. Open `config.ts` and set your MangaDex username and password in the `USERNAME` and `PASSWORD` fields.
3. Enter the API Client name(for CLIENT_ID) and secret(for CLIENT_SECRET). Personal client/CLIENT_ID is the long text that starts with "personal-client-". Then click "Get Secret" to display the CLIENT_SECRET.
4. You can either just do the next part yourself by running `npx tsc` and then `node dist/index.js` or you can run the `run.sh` file. You do need to set up permissions for the file first, by running `chmod +x run.sh`. 
5. You can find the URLs in `feedUrlsList.txt`, you can go ahead and paste them into your RSS reader.


## Known Issues

This wont work for manga that isn't actually hosted on mangadex, such as Chainsaw Man. This is because the RSS feed is generated from the MangaDex API, which only contains manga hosted on MangaDex. Generally this is the case for the few extremely popular manga that have been licensed in the west and are coming out on regular schedule, in which case the updates page on MD only shows that the chapter came out and links to the official source.

A workaround would be for you to use some other language other than english that is being uploaded on mangadex. Fox example the spanish version of CSM comes is on MD and you could use that to at least get notified.
