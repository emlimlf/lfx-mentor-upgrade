// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
const child_process = require('child_process');

/**
 * @returns {string} A git commit SHA.
 */
function getGitCommitSHA() {
  return child_process
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();
}

module.exports = getGitCommitSHA;
