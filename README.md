# Spellcheck code challenge

To get started, first install the node dependencies. I used yarn for my package manager:

`yarn install`

Then, to run the spellcheck program against your input file, run:

`yarn start {path/to/dictionary.txt} {path/to/input-file.txt}`

- The core spellchecking logic all resides in the `spellcheck.ts` file and its associated functions. The `index.ts` file only handles parsing the input files and printing out the results.
