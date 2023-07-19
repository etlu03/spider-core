/**
 * @fileoverview Template definition for the 'Tree' object
 *
 * Requirements Engineering Lab at Carnegie Mellon University
 * @release 2023
 */

/**
 * Definition of the 'Tree' object
 * @param {Object} node Root value
 */
module.exports = function (node) {
  this.node = node;
  this.children = [];

  /**
   * Inserts a child to the array of children
   * @param {Object} subtree 'Tree' object
   */
  this.push = function (subtree) {
    this.children.push(subtree);
  };
};
