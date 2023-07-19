/**
 * @fileoverview Main routine of 'spider-core'
 *
 * Requirements Engineering Lab at Carnegie Mellon University
 * @release 2023
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const process = require('process');
const path = require('path');

const utils = require('../utils/tree');
const visited = new Set();

/**
 * Retrieves the URLs of appsin the "Similar games" and "Similar apps" section
 * @param {Object} page Puppeteer page instance
 * @return {Array}
 */
async function getSimilarItems(page) {
  const similar = await page.$x(
    '//span[text()="Similar games" or text()="Similar apps"]/../../../../..//a[contains(@href, "/store/apps/details?id")]'
  );

  const hrefs = await Promise.all(
    similar.map(
      async (item) => await (await item.getProperty('href')).jsonValue()
    )
  );

  return hrefs;
}

/**
 * Builds a generic tree that outlines the relationships between Google Play
 * Store apps
 * @param {Object} page Puppeteer page instance
 * @param {Number} maximumDepth Maximum size of the resultant 'Tree' object
 * @return {Object}
 */
async function createTree(page, maximumDepth) {
  const [title, url] = [await page.title(), await page.url()];
  const node = { title: title, url: url };

  const tree = new utils.tree(node);
  visited.add(url);

  await openNeighboringLinks(page, tree);
  /**
   * Opens the URLs of apps in the "Similar games" and "Similar apps" section
   * @param {Object} page Puppeteer page instance
   * @param {Object} tree 'Tree' object
   * @param {Number} depth Current level
   */
  async function openNeighboringLinks(page, tree, depth = 0) {
    if (maximumDepth < depth) {
      return;
    }

    const hrefs = await getSimilarItems(page);
    for (const [child, href] of hrefs.entries()) {
      await page.goto(href, {
        waitUntil: 'networkidle2',
      });

      const [title, url] = [await page.title(), await page.url()];
      if (visited.has(url)) {
        continue;
      }

      visited.add(url);
      const node = { title: title, url: url };

      const subtree = new utils.tree(node);
      tree.push(subtree);

      await openNeighboringLinks(page, tree, depth = depth + 1);
    }
  }

  return tree;
}

/**
 * Traverses through a generic tree and collects the nodes
 * @param {Object} tree 'Tree' object
 * @return {Array}
 */
function collectNodes(tree) {
  const nodes = [];
  dfs(tree);

  /**
   * Depth-first search
   * @param {Object} subtree 'Tree' object
   */
  function dfs(subtree) {
    nodes.push(subtree.node);
    if (subtree.children.length !== 0) {
      for (const child of subtree.children) {
        dfs(child);
      }
    }
  }

  return nodes;
}

/**
 * Saves the result of the web scrape into a comma-separated values file
 * @param {Array} nodes Array of 'Tree' object nodes
 *
 * Side-effect: Creates a comma-separated values named 'corpus.csv'
 */
async function transcribeNodes(nodes) {
  const rows = nodes.map((node) => node.title + ',' + node.url);
  const data = rows.join('\n');

  const corpusPath = path.join('files', 'corpus.csv');
  await fs.promises
    .writeFile(corpusPath, data, { encoding: 'utf8', flag: 'w'})
    .then(() => console.log('See files/ for the result'))
    .catch(() => console.error(err));
}

/**
 * Collects related developer privacy policies from the Google Play Store
 * @param {boolean} [debug=false] Launches browser in headful mode with web
 *                                developer tools open
 *
 * Main point of entry for 'crawler.js'
 */
async function routine(debug = false) {
  if (debug) console.log("Running 'crawler.js' in debug mode...");
  const argc = process.argv.length;
  try {
    if (argc !== 4) {
      throw new TypeError(
        `Incorrect number of arguments. Expected 4, recieved ${argc}`
      );
    }

    const browser = await puppeteer.launch({
      devtools: debug,
      defaultViewport: {
        width: 1366,
        height: 768,
      },
      headless: !debug,
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 768,
    });

    const root = process.argv[2];
    await page.goto(root, {
      waitUntil: 'networkidle2',
    });
    await page.bringToFront();

    const maximumDepth = Number(process.argv[3]);
    const tree = await createTree(page, maximumDepth);

    const nodes = collectNodes(tree);
    await transcribeNodes(nodes);

    await browser.close();
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

routine();
