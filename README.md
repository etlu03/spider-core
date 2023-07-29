# Google Play Store Spiderbot

This repository contains the source code of a Google Play Store web crawler. The bot searches for the developer privacy policy of a given app. The bot moves in a tree-like format, logging the current developer's privacy policy and moving onto developers of similar apps.

# Installation

```shell
> sh build.sh
```

# Usage

The main routine of spider-core requires two command-line arguments: url, the root url, and maximumDepth, how far the bot will traverse.

```shell
# example
> node core/crawler.js "https://play.google.com/store/apps/details?id=com.chess&hl=en_US&gl=US" 2
```

| Reference screenshot of a Google Play app |
| ----------------------------------------- |
| <img src = "docs/chess.com.png">          |
