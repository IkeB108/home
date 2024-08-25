//🚩 imgregdaviesandiamthetaskmasterimpowerfulandinpeakphysicalcondition 🚩
//epa'taifingaestiiyam.npoglkihoolnpkasmudnrsdcere'ctaaihtmem.iwidaredsvn!

/*
Every word has 9 precalculated bitfields, stored as base-10 JavaScript Numbers. (Ignore the bitfields' first six digits, which aren't used).
Bitfield n stores whether the word has at least n occurrences of each letter in the alphabet. Example:

Word: Bagged
Bitfield 1: 00000011011010000000000000000000 ("bagged" has at least one occurrence of a, b, d, e, g)
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ
Bitfield 2: 00000000000010000000000000000000 ("bagged" has at least two occurrences of g)
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ
Bitfield 3: 00000000000000000000000000000000 ("bagged" has no letters with at least three occurrences)
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ

9 bitfields are also generated for the letter pool when it's time to generate word suggestions.

To check whether a word can be spelt with the letters in the letter pool, the program checks for any occurrences where the word has a quantity of letters that the letter pool doesn't (looking for a 1 above a 0). The bitwise expression for this is: word_bitfield AND NOT(letterpool_bitfield) i.e. word_bitfield & ~letterpool_bitfield. If this bitwise operation returns a new bit sequence of all zeros (which is a Number 0 in Javascript), then that means it found no mismatches between the word bitfield and letter pool bitfield.

Word bitfield 1 (bagged):         00000011011010000000000000000000
Letter pool bitfield 1 (adeggg):  00000010011010000000000000000000
                                       ABCDEFGHIJKLMNOPQRSTUVWXYZ

The program finds a 1 above a 0 in the "B" slot, but nowhere else. It doesn't care about a 0 above a 1 (the letter pool has a letter that the word doesn't). If it doesn't find a mismatch in the first bitfield, it moves on to the other bit fields for higher quantities of letters.

About efficiency of bitwise operations in js:
https://tms-outsource.com/blog/posts/javascript-bitwise-operators/
https://smellycode.com/js-bithacks/
https://stackoverflow.com/questions/1523061/performance-of-bitwise-operators-in-javascript
https://dreaminginjavascript.wordpress.com/2009/02/09/bitwise-byte-foolish/
TLDR bitwise operations in JS are not as fast as in lower-level languages like C or C++ but they are still pretty fast, often consuming fewer processor cycles than alternative methods. They aren't converted directly into machine code.

This whole method scales well with large letter pools because this method doesn't keep track of letter counts past 9. It doesn't need to care about whether any letters appear more than 9 times.

Another optimization method would be to use a trie to categorize words
*/

wordList = []
useUnoptimized = false;

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")
const bitfieldMaximumFrequency = 9 //No more than 9 bitfields are needed since no words have more than 9 occurrences of a single letter

onmessage = (e) => {
  const dataReceived = e.data
  //If this web worker has received data about the wordlist, store it in a global variable
  if(dataReceived.type == "wordList"){
    wordList = dataReceived.content
    useUnoptimized = dataReceived.useUnoptimized
    if(useUnoptimized){
      //If we're using letter frequency tables, then we need to generate them
      //now, at the time the wordlist is passed in to this web worker.
      for(let i in wordList){
        wordList[i].lft = getLFT(wordList[i].word)
      }
    }
  }
  //If receiving data for a word suggestion request, find matching words and post a message back
  if(dataReceived.type == "wordSuggestionRequest"){
    let method = useUnoptimized ? "lft" : "bitfield"
    const wordSuggestions = findWordsThatFitLetterPool(dataReceived.letterPoolString, dataReceived.stringForWordsToInclude, method, false)
    postMessage({type:"wordSuggestionsArray", content:wordSuggestions})
  }
}

function findWordsThatFitLetterPool(letterPoolString, stringForWordsToInclude, method, logTime){
  //method = "lft" (letter frequency tables) or "bitfield" (optimized method)
  
  let wordMustIncludeAString = false
  if(stringForWordsToInclude.length > 0){
    wordMustIncludeAString = true
    letterPoolString += stringForWordsToInclude //We want suggestions to include letters that have already been inputted into the current word, even though they're removed from the letter pool, so they need to be added back in.
  }
  
  let t1 = null; //For logging time
  if(logTime)t1 = Date.now();
  
  const letterPoolLFT = getLFT(letterPoolString , true) //Get a letter frequency table for the letter pool
  const letterPoolBitfields = getLetterCountBitfieldsUpToFrequency(letterPoolLFT, bitfieldMaximumFrequency) //Get an array of 9 bitfields for the letter pool
  
  let results = [] //Words to suggest will be stored here
  for(let i in wordList){
    //For each word in the wordlist...
    
    //Only bother checking whether this word is spellable if it includes the required string, if any.
    let wordIncludesRequiredStringIfAny = true
    if(wordMustIncludeAString){
      wordIncludesRequiredStringIfAny = (wordList[i].word !== stringForWordsToInclude) && wordList[i].word.includes(stringForWordsToInclude)
    }
    if(wordIncludesRequiredStringIfAny){
      
      let wordIsSpellable = null
      if(method == "bitfield"){
        //The word is a valid subset of the letter pool if and only if
        //all of its bitfields are subsets of the letter pool's corresponding bitfields
        wordIsSpellable = isBitfieldArraySubsetOfBitfieldArray(wordList[i].bitfields, letterPoolBitfields)
      }
      if(method == "lft"){
        wordIsSpellable = isLFTSubsetOfLFT(wordList[i].lft, letterPoolLFT)
      }
      
      if(wordIsSpellable){
        results.push(wordList[i].word)
      }
    }
  }
  if(logTime){
    const t2 = Date.now()
    let logMessage = "Completed word suggestion list in: " + (t2 - t1) + "ms"
    console.log(logMessage)
  }
  return results
}

function isLFTSubsetOfLFT(lft1, lft2){
  //Returns whether all letters in lft1 (letter frequency table 1) are
  //less than or equal to all letters in lft2
  let LFTIsSubset = true //Assume true until proven false
  for(let i in alphabet){
    const letter = alphabet[i]
    if(lft1[letter] > lft2[letter]){
      LFTIsSubset = false
      break; //We found a letter quantity that is too great, so we don't need to bother checking the rest.
    }
  }
  return LFTIsSubset
}

function isBitfieldArraySubsetOfBitfieldArray(bitfieldArray1, bitfieldArray2){
  //Returns whether all bitfields in bitfieldArray1 are subsets of the corresponding bitfields in bitfieldArray2
  
  let bitfieldArrayIsSubset = true //Assume true until proven false
  for(let b = 0; b < bitfieldMaximumFrequency; b ++){
    const bitfieldIsSubset = isBitfieldSubset(bitfieldArray1[b], bitfieldArray2[b]);
    if(!bitfieldIsSubset){
      bitfieldArrayIsSubset = false;
      break; //We found a bitfield that isn't a subset, so we don't need to bother checking the rest of the bitfields
    }
  }
  return bitfieldArrayIsSubset
}

function decToBin(dec){
  //https://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
  return (dec >>> 0).toString(2).padStart(32, "0")
}

function binToDec(bin){
  return Number(parseInt(bin, 2).toString(10));
}

function sortWordListByLength(a, b){
  //For debugging
  if(a.word.length == b.word.length)return 0;
  return (a.word.length < b.word.length) ? -1 : 1
}

function getLetterCountBitfield(letterCount, minimumOccurrencesOfLetter){
  //Returns a bit sequence (stored as a Number) where each bit
  //denotes whether a letter of the alphabet appears in the word
  //with at least minimumOccurrencesOfLetter occurrences.
  //The first six binary digits are unused (only 26 of the 32 binary digits are needed)
  //Example: "bagged" = 00000011011010000000000000000000
  //                          abcdefghijklmnopqrstuvwxyz
  let bitfield = "" //Start by storing bitfield as a string of 1s and 0s
  for(let i in alphabet){
    const character = alphabet[i]
    const bit = ( letterCount[character] >= minimumOccurrencesOfLetter ) ? "1" : "0"
    bitfield += bit
  }
  bitfield = bitfield.padStart(32, "0") //Add the six zeros to the beginning
  //Convert bitfield to decimal Number
  bitfield = Number(binToDec(bitfield))
  return bitfield
}

function isBitfieldSubset(subsetBitfield, supersetBitfield){
  return ( subsetBitfield & ~(supersetBitfield) ) == 0 //Value of 0 means all bits are set to 0 which means the bitfield is a subset
}

function getLFT(string){
  //Create a Letter Frequency Table:
  //A JS object mapping all letters to their frequency in the string.
  //Ex. {"a": 1, "b": 0, "c": 2, ... }
  const LFT = {}
  alphabet.forEach(e => LFT[e] = 0)
  for(let i in string){
    LFT[string[i]] += 1
  }
  return LFT
}

function getLetterCountBitfieldsUpToFrequency(letterPoolLFT, frequency){
  let bitfields = []
  for(let i = 1; i <= frequency; i ++){
    bitfields.push( getLetterCountBitfield(letterPoolLFT, i) )
  }
  return bitfields
}
