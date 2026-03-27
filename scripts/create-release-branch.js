#!/usr/bin/env node
// Creates a release branch named after the current package.json version.
// Intended to run after standard-version has committed the bump.

const { execSync } = require('child_process');
const version = require('../package.json').version;
const branch = `release/v${version}`;

execSync(`git checkout -b ${branch}`, { stdio: 'inherit' });
console.log(`Created branch: ${branch}`);
