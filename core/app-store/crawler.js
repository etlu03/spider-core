/**
 * @fileoverview Main routine of Apple App Store web crawler
 *
 * Requirements Engineering Lab at Carnegie Mellon University
 * @release 2023
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const process = require('process');
const path = require('path');

const utils = require('../../utils/tree');
const visited = new Set();

/**
 * Extracts the URL of an app developer's privacy policy
 * @param {Object} page Puppeteer page instance
 *
 * @return {string}
 */
async function retrievePrivacyPolicy(page) {
  const privacyPolicy = await page.$x(
    '//a[contains(text(), "developer’s privacy policy")]'
  );
  if (privacyPolicy.length === 0) {
    return null;
  }

  const href = await (await privacyPolicy[0].getProperty('href')).jsonValue();

  return href;
}

/**
 * Retrieves the URLs of apps in the "You Might Also Like" section
 * @param {Object} page Puppeteer page instance
 *
 * @return {Array}
 */
async function getSimilarApps(page) {
  const similar = await page.$x(
    '//h2[text()="You Might Also Like"]/../..//a[contains(@href, "https://apps.apple.com/")]'
  );

  if (similar.length === 0) {
    return [];
  }

  const hrefs = await Promise.all(
    similar.map(
      async (item) => await (await item.getProperty('href')).jsonValue()
    )
  );

  return hrefs;
}

/**
 * Builds a generic tree that outlines the relationships between Google Play
 * apps
 * @param {Object} page Puppeteer page instance
 * @param {Number} maximumDepth Maximum size of the resultant 'Tree' object
 *
 * @return {Object}
 */
async function createTree(page, maximumDepth) {
  const title = await page.title();
  const privacyPolicyURL = await retrievePrivacyPolicy(page);

  const tree = new utils.tree({
    title: title.replace(' on the App Store', ''),
    privacyPolicyURL: privacyPolicyURL,
  });

  visited.add(privacyPolicyURL);

  /**
   * Searches the URLs of apps in the "You Might Also Like" section for their
   * privacy policies
   * @param {Object} page Puppeteer page instance
   * @param {Number} depth Current level
   *
   * @return {Object}
   */
  async function openNeighboringLinks(page, depth = 0) {
    if (maximumDepth < depth) {
      return;
    }

    const URLs = await getSimilarApps(page);
    for (const URL of Object.values(URLs)) {
      await page.goto(URL, {
        waitUntil: 'networkidle2',
      });

      const title = await page.title();
      const privacyPolicyURL = await retrievePrivacyPolicy(page);

      if (visited.has(privacyPolicyURL)) {
        continue;
      }

      if (privacyPolicyURL !== null) {
        const subtree = new utils.tree({
          title: title.replace(' on the App Store', ''),
          privacyPolicyURL: privacyPolicyURL,
        });
        tree.push(subtree);

        visited.add(privacyPolicyURL);
      }

      await openNeighboringLinks(page, (depth = depth + 1));
    }
  }

  await openNeighboringLinks(page);

  return tree;
}

/**
 * Performs depth-first search on a generic tree
 * @param {Object} tree 'Tree' object
 *
 * @return {Array}
 */
function collectNodes(tree) {
  const nodes = [];

  /**
   * Depth-first search
   * @param {Object} subtree 'Tree' object
   */
  function dfs(subtree) {
    if (subtree.node.privacyPolicyURL !== null) {
      nodes.push(subtree.node);
    }

    if (subtree.children.length !== 0) {
      for (const child of subtree.children) {
        dfs(child);
      }
    }
  }

  dfs(tree);

  return nodes;
}

/**
 * Stores the result of the web scrape into a comma-separated values file
 * @param {Array} nodes Array of 'Node' objects
 */
async function transcribe(nodes) {
  const rows = nodes.map((node) => node.title + ',' + node.privacyPolicyURL);
  const data = rows.join('\n');

  const corpusPath = path.join('files', 'corpus.csv');
  await fs.promises
    .writeFile(corpusPath, data, { encoding: 'utf8', flag: 'w' })
    .then(() => console.log('Please see files/corpus.csv for your results'))
    .catch(() => console.error(err));
}

/**
 * Collects developer privacy policies from the Google Play Store using a
 * tree-like traversal
 * @param {boolean} [debug=true]  Launches browser in headful mode with web
 *                                developer tools open
 *
 * Main point of entry for 'crawler.js'
 */
async function routine(debug = false) {
  if (debug) console.log("Running 'crawler.js' in debug mode...");
  const argc = process.argv.length;
  try {
    if (argc < 3) {
      throw new TypeError(
        `Incorrect number of arguments. Expected at least 3, recieved ${argc}`
      );
    }

    if (4 < argc) {
      throw new TypeError(
        `Incorrect number of arguments. Expected at most 4, recieved ${argc}`
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

    await page.goto(process.argv[2], {
      waitUntil: 'networkidle2',
    });
    await page.bringToFront();

    const maximumDepth = isNaN(process.argv[3]) ? -1 : Number(process.argv[3]);
    const tree = await createTree(page, maximumDepth);
    const nodes = collectNodes(tree);

    await transcribe(nodes);

    await browser.close();
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

routine((debug = true));
