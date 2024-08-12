//🚩 imgregdaviesandiamthetaskmasterimpowerfulandinpeakphysicalcondition 🚩
//epa'taifingaestiiyam.npoglkihoolnpkasmudnrsdcere'ctaaihtmem.iwidaredsvn!
//Taskmaster: challenges, dedication, trophies. I'm moving up a rank. Imped, I find a way.
wordList = []

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")
const bitMaskMaximumFrequency = 9

onmessage = (e) => {
  const dataReceived = e.data
  if(dataReceived.type == "wordList"){
    wordList = dataReceived.content
  }
  if(dataReceived.type == "wordSuggestionRequest"){
    const stringForWordsToInclude = dataReceived.stringForWordsToInclude
    const wordSuggestions = findWordsThatFitLetterPool_BitMaskMethod(dataReceived.letterPoolString, dataReceived.stringForWordsToInclude, true)
    postMessage({type:"wordSuggestionsArray", content:wordSuggestions})
  }
}





function decToBin(dec){
  //https://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
  return (dec >>> 0).toString(2).padStart(32, "0")
}

function binToDec(bin){
  return Number(parseInt(bin, 2).toString(10));
}

function sortWordListByLength(a, b){
  // console.log({a, b})
  if(a.word.length == b.word.length)return 0;
  return (a.word.length < b.word.length) ? -1 : 1
}

function getLetterCountBitMask(letterCount, minimumOccurrencesOfLetter){
  //Returns a bit sequence (stored as a Number) where each bit
  //denotes whether a letter of the alphabet appears in the word
  //with at least minimumOccurrencesOfLetter occurrences.
  //The first six binary digits are unused (only 26 of the 32 binary digits are needed)
  //Example: "bagged" = 00000011011010000000000000000000
  //                          abcdefghijklmnopqrstuvwxyz
  let bitmask = "" //Start by storing bitmask as a string of 1s and 0s
  for(let i in alphabet){
    const character = alphabet[i]
    const bit = ( letterCount[character] >= minimumOccurrencesOfLetter ) ? "1" : "0"
    bitmask += bit
  }
  bitmask = bitmask.padStart(32, "0")
  //Convert bitmask to decimal Number
  bitmask = Number(binToDec(bitmask))
  return bitmask
}

function getBitMaskFromString(letterPoolString){
  return getLetterCountBitMask(getLetterCount(letterPoolString), true)
}

function isLetterCountSubset_BitMaskMethod(subsetBitMask, supersetBitMask){
  return ( subsetBitMask & ~(supersetBitMask) ) == 0 //Value of 0 means all bits are set to 0 which is success
}

function getLetterCount(string, includeZerosBoolean){
  //Creates a hashmap object of all letters in the word and their frequencies.
  //If includesZerosBoolean is true, letters with freq zero appear in the hashmap
  const hashmap = {}
  if(includeZerosBoolean){
    alphabet.forEach(e => hashmap[e] = 0)
  }
  for(let i in string){
    if(hashmap.hasOwnProperty(string[i])){
      hashmap[string[i]] += 1
    } else {
      hashmap[string[i]] = 1
    }
  }
  return hashmap
}

function isLetterCountSubsetIncludingZeros(subsetLetterCount, supersetLetterCount){
  //Checks whether all the letter frequencies in subsetLetterCount
  //are less than or equal to all the letter frequencies in supersetLetterCount
  //Letter frequencies of zero are checked.
  const keys = alphabet
  for(let i in keys){
    const character = keys[i]
    if(subsetLetterCount[character]){
      //We only need to check this character if it's contained in the subset.
      if(supersetLetterCount[character] === undefined){
        //The subset has a character that's not in the superset.
        //Therefore, it's not a true subset
        return false
      }
      if(subsetLetterCount[character] > supersetLetterCount[character]){
        //The subset has at least one character that's not in the superset.
        //Therefore, it's not a true subset.
        return false
      }
    }
  }
  return true
}

function isLetterCountSubsetExcludingZeros(subsetLetterCount, supersetLetterCount){
  //Checks whether all the letter frequencies in subsetLetterCount
  //are less than or equal to all the letter frequencies in supersetLetterCount
  //Letter frequencies of zero are assumed not to be in the letter counts.
  keys = Object.keys(subsetLetterCount)
  
  for(let i in keys){
    const character = keys[i]
    if(subsetLetterCount[character]){
      //We only need to check this character if it's contained in the subset.
      if(supersetLetterCount[character] === undefined){
        //The subset has a character that's not in the superset.
        //Therefore, it's not a true subset
        return false
      }
      if(subsetLetterCount[character] > supersetLetterCount[character]){
        //The subset has at least one character that's not in the superset.
        //Therefore, it's not a true subset.
        return false
      }
    }
  }
  return true
}

function findWordsThatFitLetterPool_HashmapMethod(letterPoolString){
  //Uses hashmaps that include letter frequencies of zero
  const t1 = Date.now()
  const letterPoolLetterCount = getLetterCount(letterPoolString , true)
  let results = []
  for(let i in wordList){
    if(isLetterCountSubsetIncludingZeros(wordList[i].letterCount, letterPoolLetterCount)){
      results.push(wordList[i].word)
    }
  }
  const t2 = Date.now()
  console.log(t2 - t1 + "ms")
  return results
}

function getLetterCountBitMasksUpToFrequency(letterPoolLetterCount, frequency){
  let bitmasks = []
  for(let i = 1; i <= frequency; i ++){
    bitmasks.push( getLetterCountBitMask(letterPoolLetterCount, i) )
  }
  return bitmasks
}


/*
Every word has 9 bitmasks, stored as JavaScript Numbers. (Ignore the first six digits of the mask, which aren't used).
Bitmask n stores whether the word has at least n occurrences of each letter in the alphabet. Example:

Word: Bagged
Bitmask 1: 00000011011010000000000000000000 ("bagged" has at least one occurrence of a, b, d, e, g)
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ
Bitmask 2: 00000000000010000000000000000000 ("bagged" has at least two occurrences of g)
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ
Bitmask 3: 00000000000000000000000000000000 ("bagged" has no letters with at least three occurrences)
                 ABCDEFGHIJKLMNOPQRSTUVWXYZ

On calculation, 9 bitmasks are also generated for the letter pool.
To check whether a word can be spelt with the letters in the letter pool, the program checks for any occurrences where the word has a quantity of letters that the letter pool doesn't (looking for a 1 above a 0). The bitwise expression for this is: word_bitmask AND NOT(letterpool_bitmask) i.e. word_bitmask & ~letterpool_bitmask. If this bitwise operation returns a new bit sequence of all zeros (which is a Number 0 in Javascript), then that means it found no mismatches between the word bitmask and letter pool bitmask.

Word bitmask 1 (bagged):         00000011011010000000000000000000
Letter pool bitmask 1 (adeggg):  00000010011010000000000000000000
                                       ABCDEFGHIJKLMNOPQRSTUVWXYZ

The program finds a 1 above a 0 in the "B" slot, but nowhere else. It doesn't care about a 0 above a 1 (the letter pool has a letter that the word doesn't). If it doesn't find a mismatch in the first bitmask, it moves on to the other bit masks for higher quantities of letters.

About efficiency of bitwise operations in js:
https://tms-outsource.com/blog/posts/javascript-bitwise-operators/
https://smellycode.com/js-bithacks/
https://stackoverflow.com/questions/1523061/performance-of-bitwise-operators-in-javascript
https://dreaminginjavascript.wordpress.com/2009/02/09/bitwise-byte-foolish/
TLDR bitwise operations in JS are not as fast as in lower-level languages like C or C++ but they are still pretty fast, often consuming fewer processor cycles than alternative methods. They aren't converted directly into machine code.

This whole method scales well with large letter pools because this method doesn't keep track of letter counts past 9. It doesn't need to care about whether any letters appear more than 9 times.

Another optimization method would be to use a trie to categorize words
*/


function findWordsThatFitLetterPool_BitMaskMethod(letterPoolString, stringForWordsToInclude, logTime){
  let wordMustIncludeAString = false
  if(stringForWordsToInclude.length > 0){
    wordMustIncludeAString = true
    letterPoolString += stringForWordsToInclude //We want suggestions to include letters that have already been inputted into the word
  }
  
  let t1 = null;
  if(logTime)t1 = Date.now();
  const letterPoolLetterCount = getLetterCount(letterPoolString , true)
  const letterPoolBitMasks = getLetterCountBitMasksUpToFrequency(letterPoolLetterCount, bitMaskMaximumFrequency)
  // console.log(letterPoolBitMasks)
  let results = []
  for(let i in wordList){
    let wordIsValid = true
    //Only bother checking this word if it starts with the required string,
    //if any.
    let wordIncludesRequiredStringIfAny = true
    if(wordMustIncludeAString){
      wordIncludesRequiredStringIfAny = (wordList[i].word !== stringForWordsToInclude) && wordList[i].word.includes(stringForWordsToInclude)
    }
    if(wordIncludesRequiredStringIfAny){
      //Word is a valid subset of the letter pool if and only if
      //all of its bitmasks pass the test against the letter pool's
      //bitmasks
      for(let b = 0; b < bitMaskMaximumFrequency; b ++){
        if(!isLetterCountSubset_BitMaskMethod(wordList[i].bitfields[b], letterPoolBitMasks[b])){
          wordIsValid = false;
          break; //We found an invalid bitmask so we don't need to keep checking
        }
      }
      if(wordIsValid){
        results.push(wordList[i].word)
      }
    }
  }
  if(logTime){
    const t2 = Date.now()
    console.log(t2 - t1 + "ms")
  }
  return results
}

function convertBitMasksArrayToStringBitMasksArray(bitMasksArray){
  const ret = []
  for(let i in bitMasksArray){
    //Use _ to denote 0 and * to denote 1
    ret.push( decToBin(bitMasksArray[i]).replaceAll("0", "_").replaceAll("1", "*") )
  }
  return ret
}

function findWordsThatFitLetterPool_StringBitMaskMethod(letterPoolString, logTime){
  let t1 = null;
  if(logTime)t1 = Date.now();
  const letterPoolLetterCount = getLetterCount(letterPoolString , true)
  const letterPoolBitMasks = getLetterCountBitMasksUpToFrequency(letterPoolLetterCount, bitMaskMaximumFrequency)
  const letterPoolStringBitMasks = convertBitMasksArrayToStringBitMasksArray(letterPoolBitMasks)
  // console.log(letterPoolStringBitMasks)
  // return
  // console.log(letterPoolBitMasks)
  let results = []
  for(let i in wordList){
    let wordIsValid = true
    //Word is a valid subset of the letter pool if and only if
    //all of its string bitmasks pass the test against the letter pool's
    //string bitmasks
    loopThroughStringBitMasks: for(let b = 0; b < bitMaskMaximumFrequency; b ++){
      const stringBitMask = letterPoolStringBitMasks[b]
      for(let c in letterPoolStringBitMasks[b]){
        const wordCharacter = wordList[i].stringBitMasks[b][c] //Either _ or *
        const letterPoolCharacter = letterPoolStringBitMasks[b][c] //Either _ or *
        if(wordCharacter == "*" && letterPoolCharacter == "_"){
          wordIsValid = false;
          break loopThroughStringBitMasks; //We found an invalid bitmask so we don't need to keep checking
        }
      }
    }
    if(wordIsValid){
      results.push(wordList[i].word)
    }
  }
  if(logTime){
    const t2 = Date.now()
    console.log(t2 - t1 + "ms")
  }
  return results
}