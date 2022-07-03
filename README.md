<!-- markdownlint-disable MD014 -->

# moka-bot

Discord Bot using [discord.js](https://discord.js.org/#/)

## Feature

- Music Bot
- [Discord Together](https://www.npmjs.com/package/discord-together)
- [Minecraft Server Status](https://mcsrvstat.us/)
- [Weather Forecast](https://openweathermap.org/)

## Install

```bash
$ git clone https://github.com/shmknrk/moka-bot
$ npm i
# set playlist
# set config.json
```

### playlist

```bash
$ cd moka-bot
$ mkdir playlist
```

### config.json

```json
{
    "clientId": "<discord client id>",
    "token": "<discord token>",
    "prefix": "<command prefix>",
    "globalIPAddress": "<global IP address for minecraft server status>",
    "playlistPath": "<playlist path for music bot>",
    "lat": "<latitude for weather API>",
    "lon": "<longitude for weather API>",
    "appid": "<API key for weather API>",
    "cnt": "<number of API response>",
    "weatherForecastChannelId": "<discord channel id>"
}
```

### Weather Forecast

- [5 day weather forecast | Open Weather Map](https://openweathermap.org/forecast5)

## Build a Bot

```bash
$ node index.js
```

## Music Bot Commands

```txt
!play
!skip
!dc
```
