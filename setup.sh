#!/bin/sh
echo "Installing core dependencies...";
npm install puppeteer@19.7.5 > /dev/null;
npm install fs@0.0.1-security > /dev/null;
npm install process@0.11.10 > /dev/null;
npm install path@0.12.7 > /dev/null;

echo "Install development dependencies...";
npm install --save-dev eslint@latest > /dev/null;
npm install --save-dev eslint-plugin-prettier@latest > /dev/null;
npm install --save-dev prettier@latest > /dev/null;
npm install --save-dev eslint-config-prettier > /dev/null;
