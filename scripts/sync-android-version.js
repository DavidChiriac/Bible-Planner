#!/usr/bin/env node
// Syncs versionName and increments versionCode in android/app/build.gradle
// to match the version in package.json. Run after standard-version.

const fs = require('fs');
const path = require('path');

const pkgVersion = require('../package.json').version;
const gradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

let gradle = fs.readFileSync(gradlePath, 'utf8');

// Increment versionCode by 1
gradle = gradle.replace(/versionCode\s+(\d+)/, (_, code) => {
  const next = parseInt(code, 10) + 1;
  console.log(`versionCode: ${code} → ${next}`);
  return `versionCode ${next}`;
});

// Replace versionName with package.json version
gradle = gradle.replace(/versionName\s+"[^"]*"/, () => {
  console.log(`versionName → "${pkgVersion}"`);
  return `versionName "${pkgVersion}"`;
});

fs.writeFileSync(gradlePath, gradle, 'utf8');
console.log('android/app/build.gradle updated.');
