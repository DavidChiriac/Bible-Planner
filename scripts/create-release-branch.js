#!/usr/bin/env node
// Renames the working branch to the release version after standard-version commits the bump.

const { execFileSync } = require('child_process');
const version = require('../package.json').version;
const branch = `release/v${version}`;
const currentBranch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();

if (!currentBranch) {
  throw new Error('Cannot rename the release branch while in detached HEAD state.');
}

if (currentBranch === branch) {
  console.log(`Already on release branch: ${branch}`);
} else {
  execFileSync('git', ['branch', '-m', branch], { stdio: 'inherit' });
  console.log(`Renamed ${currentBranch} to ${branch}`);
}
