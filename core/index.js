/**
 * @fileoverview Export routing for core modules
 *
 * Requirement Engineering Lab at Carnegie Mellon University
 * @release 2023
 */

module.exports = {
  google: require('./google-play/crawler'),
  apple: require('./app-store/crawler'),
};
