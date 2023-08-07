# Developer privacy policy URL scraper
This repository contains the source code of two app marketplae web crawlers, the Gooogle Play Store and the Apple App Store. The web crawler searches for the current developer's privacy policy and moves using tree-like traversal to other neighboring apps. When the web crawler finishes the scraping routine, a file called **corpus.csv** will contain all the found URLs to developer privacy policies.

# Setup
To use this service, you will need [Node.js](https://nodejs.org/en), which you should install beforehand. <br>
Then, clone this repository to your local machine by running the following command:
```shell
> git clone https://github.com/etlu03/spider-core.git
```
Now, install the module's dependencies by 'cd'-ing into the root of the repository and running one of the following commands:
```shell
> npm install
# or
> sh setup.sh
# to install development dependencies
```

# Usage
Once all dependencies have been installed, you can dispatch a web crawler by running the following command:
```shell
> python3 dispatch.py {the URL of choice} --depth {the depth of choice}
# or more concisely
> python3 dispatch.py {the URL of choice} -d {the depth of choice}
```
The argument ***depth*** is optional. If you chose not to explicitly setting the value of ***depth***, it will default to 5. <br>
You can directly interact with the web crawlers by using ***node***, however, you must ensure that the web crawler you are choosing to use recieves a valid URL.
```shell
# examples that set a value to depth
> python3 dispatch.py "https://play.google.com/store/apps/details?id=com.chess&hl=en_US&gl=US" -d 3
> python3 dispatch.py "https://apps.apple.com/us/app/genshin-impact/id1517783697" -d 2

# examples that allow depth to default
> python3 dispatch.py "https://play.google.com/store/apps/details?id=com.supercell.clashofclans&hl=en_US&gl=US"
> python3 dispatch.py "https://apps.apple.com/us/app/genshin-impact/id1517783697"
```

# Known Issues
As of version 1.0.0, it is not possible to successfully run the Apple App Store web crawler on a machine that run macOS. These specific machines prompt a pop-up the ask if the user would like to open the site in the App Store application. This directly prevents these web pages from being scraped. The current fix for this issue is to run the web crawler from a Windows-based machine.
