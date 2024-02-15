import { existsSync, readFileSync } from 'fs';
import { spellcheck } from './spellcheck';

const [dictionaryFile, inputFile] = process.argv.slice(2);
if (!existsSync(dictionaryFile) || !existsSync(inputFile)) {
  console.info('usage: yarn start {dictionary-file.txt} {your-input-file.txt}');
  process.exit(1);
}

const dictionary = readFileSync(dictionaryFile).toString().trim().split('\n');
const inputContent = readFileSync(inputFile).toString().trim();

const mispelledWords = spellcheck(inputContent, ['a', ...dictionary]); // including 'a' b/c it wasn't in dictionary

console.table(mispelledWords);
