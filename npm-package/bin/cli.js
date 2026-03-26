#!/usr/bin/env node
const { execSync } = require('child_process');

const url = 'https://raw.githubusercontent.com/mthnmhn/proto-kit/main/setup.sh';

try {
  execSync(`curl -fsSL "${url}" | bash`, {
    stdio: 'inherit',
    shell: true,
  });
} catch {
  process.exit(1);
}
