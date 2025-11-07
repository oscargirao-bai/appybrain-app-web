#!/usr/bin/env node
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const args = process.argv.slice(2);
const bumpType = args[0] || 'patch'; // patch, minor, major

const versionFile = join(process.cwd(), 'version.semver');

function readVersion() {
  try {
    return readFileSync(versionFile, 'utf8').trim();
  } catch {
    return '1.0.0';
  }
}

function bumpVersion(version, type) {
  const parts = version.split('.').map(n => parseInt(n, 10) || 0);
  
  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] += 1;
      break;
  }
  
  return parts.join('.');
}

const currentVersion = readVersion();
const newVersion = bumpVersion(currentVersion, bumpType);

writeFileSync(versionFile, newVersion + '\n');

console.log(`[bump-version] ${currentVersion} → ${newVersion} (${bumpType})`);
