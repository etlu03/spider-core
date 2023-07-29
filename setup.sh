#!/bin/sh
echo "Installing core dependencies...";
npm install puppeteer@19.7.5 > /dev/null;

echo "Installing development dependencies...";
npm install --save-dev eslint@latest > /dev/null;
npm install --save-dev eslint-plugin-prettier@latest > /dev/null;
npm install --save-dev prettier@latest > /dev/null;
npm install --save-dev eslint-config-prettier > /dev/null;
