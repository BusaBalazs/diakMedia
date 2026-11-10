import dictionaryText from '../../../node_modules/dictionary-hu/index.dic?raw';

const suffixes = [
  'jaitok', 'jeitek', 'aitok', 'eitek', 'jaik', 'jeik', 'aink', 'eink',
  'aim', 'eim', 'ain', 'ein', 'atok', 'etek', 'otok', 'ötök',
  'ban', 'ben', 'ból', 'ből', 'ról', 'ről', 'hoz', 'hez', 'höz', 'nak', 'nek',
  'val', 'vel', 'nál', 'nél', 'ra', 're', 'ba', 'be', 'ig', 'ért', 'kor',
  'ként', 'képp', 'tól', 'től', 'stul', 'stül', 'jait', 'jeit', 'ain',
  'ein', 'unk', 'ünk', 'juk', 'jük', 'tak', 'tek', 'ták', 'ték', 'tam',
  'tem', 'tuk', 'tük', 'tok', 'tök', 'ott', 'ett', 'ött', 'ni', 'va', 've',
  'ja', 'je', 'uk', 'ük', 'ak', 'ek', 'ok', 'ök', 'at', 'et', 'ot', 'öt',
  'as', 'es', 'os', 'ös', 'an', 'en', 'on', 'ön', 'ul', 'ül', 'im',
  'am', 'em', 'om', 'öm', 'ad', 'ed', 'od', 'öd', 'k', 't', 'n', 'm',
  'a', 'e', 'i', 'ó', 'ő',
].sort((a, b) => b.length - a.length);

const shortVowels = { á: 'a', é: 'e', í: 'i', ó: 'o', ő: 'ö', ú: 'u', ű: 'ü' };
let dictionary;

function getDictionary() {
  if (dictionary) return dictionary;
  dictionary = new Set();
  for (const line of dictionaryText.split(/\r?\n/u)) {
    if (!line || line.startsWith('#')) continue;
    const [entry, ...variants] = line.trim().split('\t');
    const root = entry.split('/')[0].toLocaleLowerCase('hu-HU');
    if (/^\p{L}+$/u.test(root)) dictionary.add(root);
    for (const variant of variants) {
      for (const word of variant.trim().split(/\s+/u)) {
        if (/^\p{L}+$/u.test(word)) dictionary.add(word.toLocaleLowerCase('hu-HU'));
      }
    }
  }
  return dictionary;
}

function isKnownWord(word, words, depth = 3, memo = new Map()) {
  if (words.has(word)) return true;
  const key = `${word}:${depth}`;
  if (memo.has(key)) return memo.get(key);
  if (depth === 0 || word.length < 4) {
    memo.set(key, false);
    return false;
  }

  for (const suffix of suffixes) {
    if (!word.endsWith(suffix) || word.length - suffix.length < 2) continue;
    const stem = word.slice(0, -suffix.length);
    if (isKnownWord(stem, words, depth - 1, memo)) {
      memo.set(key, true);
      return true;
    }
    const last = stem.at(-1);
    if (shortVowels[last] && isKnownWord(stem.slice(0, -1) + shortVowels[last], words, depth - 1, memo)) {
      memo.set(key, true);
      return true;
    }
    if (stem.length > 3 && stem.at(-1) === stem.at(-2) && isKnownWord(stem.slice(0, -1), words, depth - 1, memo)) {
      memo.set(key, true);
      return true;
    }
  }
  memo.set(key, false);
  return false;
}

export function checkHungarianSpelling(text) {
  const words = getDictionary();
  const memo = new Map();
  const seen = new Set();
  const unknown = [];
  for (const match of text.matchAll(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu)) {
    const word = match[0];
    if (word.length < 3 || word === word.toLocaleUpperCase('hu-HU')) continue;
    const normalized = word.toLocaleLowerCase('hu-HU');
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const parts = normalized.split(/[-’']/u);
    if (parts.every((part) => isKnownWord(part, words, 3, memo))) continue;
    if (isKnownWord(normalized, words, 3, memo)) continue;
    unknown.push(word);
    if (unknown.length === 8) break;
  }
  return unknown;
}
