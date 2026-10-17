import { mkdir, copyFile, cp } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
for (const file of ['app.js', 'server.js']) {
  await copyFile(`src/${file}`, `dist/${file}`);
}
await cp('src/public', 'dist/public', { recursive: true });
console.log('Built ShopFast into dist/');
