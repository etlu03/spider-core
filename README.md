# App Developer Privacy Policy Web Crawler

This repository contains the source code of a Google Play Store web crawler. The bot searches for the developer privacy policy of a given app. The bot moves with a tree-like traversal, saving the link to the current developer's privacy policy and moving onto developers of similar apps.

# Installation

```shell
> sh build.sh
```

# Usage

The main routine of spider-core requires two command-line arguments: url, the root url, and maximumDepth, how far down the bot will traverse.

```shell
# example
> node core/google-play/crawler.js "https://play.google.com/store/apps/details?id=com.chess&hl=en_US&gl=US" 2
```
