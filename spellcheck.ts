export interface MispelledResult {
  word: string;
  suggestions: string[];
  context: string;
  lineNumber: number;
  columnNumber: number;
}

export const spellcheck = (
  content: string,
  dictionary: string[],
  editDistanceLimit: number = 2,
): MispelledResult[] => {
  const mispelledWords: MispelledResult[] = [];

  content.split('\n').forEach((line, lineIndex) => {
    for (const wordMatch of line.matchAll(/\w+/g)) {
      const [word] = wordMatch;
      const { index } = wordMatch;

      if (isOnlyDigits(word)) {
        continue;
      }

      if (isProperNoun(word, line, index!)) {
        continue;
      }

      const normalizedWord = word.toLowerCase();
      if (dictionary.indexOf(normalizedWord) === -1) {
        mispelledWords.push({
          word: normalizedWord,
          suggestions: findSuggestions(
            normalizedWord,
            dictionary,
            editDistanceLimit,
          ),
          context: getContext(line, word),
          lineNumber: lineIndex + 1,
          columnNumber: index! + 1,
        });
      }
    }
  });

  return mispelledWords;
};

const isOnlyDigits = (value: string): boolean => {
  return /^\d+$/.test(value);
};

// very basic scheme for determining if the word is a proper noun: if the first
// letter is uppercase and it's not preceded by a period or the start of the
// sentence, then it is assumed that it's a proper noun. won't solve the case if
// a sentence starts with a proper noun, but couldn't find any reliable
// non-dictionary solution to that.
const isProperNoun = (word: string, line: string, index: number): boolean => {
  if (!/^[A-Z]/.test(word)) {
    return false;
  }

  for (let i = index; i > 0; i--) {
    if (!line[i]) {
      continue;
    }

    if (line[i] === '.') {
      return false;
    }

    // otherwise we've hit a character that is not a period
    return true;
  }

  // if we're out of the loop, then it's the start of the sentence
  return false;
};

const findSuggestions = (
  word: string,
  dictionary: string[],
  limit: number,
): string[] => {
  const suggestions: { value: string; distance: number }[] = [];

  for (const value of dictionary) {
    const distance = calculateLevenshteinDistance(word, value);
    if (distance <= limit) {
      suggestions.push({ value, distance });
    }
  }

  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .map((suggestion) => suggestion.value);
};

// https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_full_matrix
const calculateLevenshteinDistance = (
  string1: string,
  string2: string,
): number => {
  const lenStr1 = string1.length;
  const lenStr2 = string2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= lenStr1; i++) {
    matrix[i] = [];
    matrix[i][0] = i;
  }

  for (let j = 0; j <= lenStr2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenStr1; i++) {
    for (let j = 1; j <= lenStr2; j++) {
      const cost = string1[i - 1] === string2[j - 1] ? 0 : 1;
      const deletion = matrix[i - 1][j] + 1;
      const insertion = matrix[i][j - 1] + 1;
      const substitution = matrix[i - 1][j - 1] + cost;

      matrix[i][j] = Math.min(deletion, insertion, substitution);
    }
  }

  // bottom-right value of the matrix is the distance
  return matrix[lenStr1][lenStr2];
};

const getContext = (line: string, word: string, numberOfWords: number = 2) => {
  const words = [...line.matchAll(/\w+/g)].map((match) => match[0]);
  const indexOfWord = words.indexOf(word);
  if (indexOfWord < 0) {
    return '';
  }

  const startIndex =
    indexOfWord - numberOfWords < 0 ? 0 : indexOfWord - numberOfWords;
  const endIndex = indexOfWord + numberOfWords + 1; // need to add 1 for exclusive end index

  return words.slice(startIndex, endIndex).join(' ');
};
