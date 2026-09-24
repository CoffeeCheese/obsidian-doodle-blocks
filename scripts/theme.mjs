import { watch } from 'node:fs';
import {
  existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync,
  renameSync, writeFileSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import * as sass from 'sass';

const root = fileURLToPath(new URL('../', import.meta.url));
const packageName = 'Doodle Blocks Q';
const defaultOut = join(root, 'dist', packageName);
const fontDir = join(root, 'src/assets/fonts');
const licenseNames = ['Fusion-Pixel-OFL-1.1.txt', 'JetBrains-Mono-OFL-1.1.txt'];

function options(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!['--out', '--vault', '--once'].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    if (flag === '--once') parsed.once = true;
    else if (!args[i + 1]) throw new Error(`Missing value for ${flag}`);
    else parsed[flag.slice(2)] = args[++i];
  }
  return parsed;
}

function packageFiles() {
  const manifest = JSON.parse(readFileSync(join(root, 'src/manifest.json'), 'utf8'));
  for (const field of ['name', 'version', 'minAppVersion', 'author']) {
    if (typeof manifest[field] !== 'string' || !manifest[field]) throw new Error(`Invalid manifest field: ${field}`);
  }
  if (manifest.name !== packageName || !/^\d+\.\d+\.\d+$/.test(manifest.version) ||
      !/^\d+\.\d+\.\d+$/.test(manifest.minAppVersion)) {
    throw new Error('Invalid theme name or version in manifest');
  }

  let css = sass.compile(join(root, 'src/scss/theme.scss'), {
    style: 'expanded', charset: false, quietDeps: true,
  }).css;
  for (const [marker, filename] of [
    ['__FUSION_PIXEL_FONT__', 'fusion-pixel-12px-proportional-zh_hans.woff2'],
    ['__JETBRAINS_MONO_FONT__', 'JetBrainsMono-Regular.woff2'],
  ]) {
    if (!css.includes(marker)) throw new Error(`Missing font marker: ${marker}`);
    const data = readFileSync(join(fontDir, filename)).toString('base64');
    css = css.replaceAll(marker, `data:font/woff2;base64,${data}`);
  }
  css = `/* Doodle Blocks Q — local fonts: see SOURCES.md and licenses/ in this theme package. */\n${css}`;
  const parsed = postcss.parse(css, { from: 'theme.css' });
  parsed.walkAtRules('import', () => { throw new Error('CSS must not import runtime resources'); });
  parsed.walkDecls((declaration) => {
    const urls = declaration.value.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi);
    for (const [, , url] of urls) {
      if (!url.startsWith('data:')) throw new Error(`CSS has a non-embedded resource: ${url}`);
    }
  });

  const files = new Map([
    ['manifest.json', Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)],
    ['theme.css', Buffer.from(css)],
    ['LICENSE', readFileSync(join(root, 'LICENSE'))],
    ['SOURCES.md', readFileSync(join(fontDir, 'SOURCES.md'))],
  ]);
  for (const name of licenseNames) files.set(`licenses/${name}`, readFileSync(join(fontDir, 'licenses', name)));
  return files;
}

function listFiles(dir, prefix = '') {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relative = join(prefix, entry.name);
    return entry.isDirectory() ? listFiles(join(dir, entry.name), relative) : [relative];
  });
}

function check(out, files) {
  const actual = listFiles(out).sort();
  const expected = [...files.keys()].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Theme package is out of date: file list differs in ${out}`);
  for (const [name, contents] of files) {
    if (!readFileSync(join(out, name)).equals(contents)) throw new Error(`Theme package is out of date: ${name}`);
  }
}

function writePackage(out, files) {
  mkdirSync(out, { recursive: true });
  for (const [name, contents] of files) {
    const target = join(out, name);
    mkdirSync(dirname(target), { recursive: true });
    const temporary = `${target}.tmp-${process.pid}`;
    writeFileSync(temporary, contents);
    renameSync(temporary, target);
  }
}

function vaultThemePath(vault) {
  if (!vault || !isAbsolute(vault)) throw new Error('Preview needs an absolute --vault path or DOODLE_VAULT_PATH');
  const actual = realpathSync(vault);
  if (basename(actual) !== 'dev-test') throw new Error('Preview is limited to the dev-test Vault');
  const obsidian = join(actual, '.obsidian');
  if (!existsSync(obsidian) || !lstatSync(obsidian).isDirectory()) throw new Error('Vault has no .obsidian directory');
  const themes = join(obsidian, 'themes');
  if (existsSync(themes) && lstatSync(themes).isSymbolicLink()) throw new Error('Themes directory must not be a symlink');
  const target = join(themes, packageName);
  if (existsSync(target) && lstatSync(target).isSymbolicLink()) throw new Error('Theme directory must not be a symlink');
  return target;
}

const [command, ...args] = process.argv.slice(2);
try {
  const flags = options(args);
  const out = resolve(flags.out ?? defaultOut);
  if (command === 'build') {
    writePackage(out, packageFiles());
    console.log(`Built ${out}`);
  } else if (command === 'check') {
    check(out, packageFiles());
    console.log(`Theme package matches source: ${out}`);
  } else if (command === 'preview') {
    const target = vaultThemePath(flags.vault ?? process.env.DOODLE_VAULT_PATH);
    const update = () => {
      const files = packageFiles();
      writePackage(out, files);
      writePackage(target, files);
      console.log(`Preview updated: ${target}`);
    };
    update();
    if (!flags.once) {
      let timer;
      const rebuild = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          try { update(); } catch (error) { console.error(error.message); }
        }, 150);
      };
      watch(join(root, 'src'), { recursive: true }, rebuild);
      watch(join(root, 'LICENSE'), rebuild);
      console.log('Watching theme source. Press Ctrl+C to stop.');
    }
  } else {
    throw new Error('Usage: npm run build | npm run check | npm run preview -- --vault /absolute/path/to/dev-test [--once]');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
