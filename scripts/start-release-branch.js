#!/usr/bin/env node
// Starts the ship process on a temporary branch so commits never land on the source branch.

const { execFileSync } = require('child_process');
const currentBranch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();

if (!currentBranch) {
  throw new Error('Cannot start a release from detached HEAD state.');
}

const branch = `${currentBranch}-ship`;
execFileSync('git', ['switch', '-c', branch], { stdio: 'inherit' });
console.log(`Started ship branch: ${branch}`);
