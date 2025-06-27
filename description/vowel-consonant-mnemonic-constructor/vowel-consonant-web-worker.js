/*
Each word has a Vowel Consonant Bitfield:
00 = none (no more letters), 01 = vowel, 10 = consonant, 11 = y

*/
wordList = []

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")
const letterTypeMap = {
  "a": "vowel",
  "b": "consonant",
  "c": "consonant",
  "d": "consonant",
  "e": "vowel",
  "f": "consonant",
  "g": "consonant",
  "h": "consonant",
  "i": "vowel",
  "j": "consonant",
  "k": "consonant",
  "l": "consonant",
  "m": "consonant",
  "n": "consonant",
  "o": "vowel",
  "p": "consonant",
  "q": "consonant",
  "r": "consonant",
  "s": "consonant",
  "t": "consonant",
  "u": "vowel",
  "v": "consonant",
  "w": "consonant",
  "x": "consonant",
  "y": "y",
  "z": "consonant",
}
onmessage = (e) => {
  const dataReceived = e.data
  //If this web worker has received data about the wordlist, store it in a global variable
  if(dataReceived.type == "wordList"){
    wordList = dataReceived.content
    //When we load the wordList,
    //Each word's "bitfields" property is meant for the anagram constructor project, not this project.
    //So we'll delete it and replace it with a single "bitfield" property
    //which lists which letters are vowels and consonants.
    
    for(let i in wordList){
      let word = wordList[i].word
      delete wordList[i].bitfields
      wordList[i].bitfield = getVowelConsonantBitfieldOfString(word)
    }
  }
  //If receiving data for a word suggestion request, find matching words and post a message back
  if(dataReceived.type == "wordSuggestionRequest"){
    console.log(dataReceived.vowelConsonantPatternString)
    let wordSuggestions = findWordsThatFitVowelConsonantPattern(dataReceived.vowelConsonantPatternString, true)
    postMessage({type:"wordSuggestionsArray", content:wordSuggestions})
  }
}

function getVowelConsonantPatternBitfield(vowelConsonantPatternString){
  //Returns a bitfield (sequence of ones and zeros stored as a 32-bit JS Number)
  //where each pair of bits represents a vowel, consonant, or y in the vowel consonant pattern.
  
  vowelConsonantPatternString = vowelConsonantPatternString.replaceAll("v", "a")
  return getVowelConsonantBitfieldOfString(vowelConsonantPatternString)
}

function getVowelConsonantBitfieldOfString(myString){
  //Returns a bitfield (sequence of ones and zeros stored as a 32-bit JS Number)
  //where each pair of bits represents a vowel, consonant, or y in the string.
  //01 = vowel, 10 = consonant, 11 = y.
  //If the string is less than 32/2 = 16 characters, then leftover bit pairs are 00.
  
  //If myString is longer than 16 letters, then we can't store it in 32 bits,
  //so we remove any letters past 16. This isn't needed for words since scrabble dictionary
  //only goes up to 15 letter words, but it is needed for the vowel consonant pattern, which can
  //be any length.
  myString = myString.slice(0, 16)
  let vowelConsonantBitfield = ""
  for(let c = 0; c < myString.length; c ++){
    let letterType = letterTypeMap[ myString[c] ]
    if(letterType == "vowel"){
      vowelConsonantBitfield += "01"
    }
    if(letterType == "consonant"){
      vowelConsonantBitfield += "10"
    }
    if(letterType == "y"){
      vowelConsonantBitfield += "11"
    }
  }
  //Pad the rest with 0s since this needs to be 32 bits.
  //32 bits / 2 bits per letter = 16 letters maximum per word, but this is
  //fine since we're using scrabble dictionary which only goes up to 15 letter words.
  vowelConsonantBitfield = binToDec( vowelConsonantBitfield.padEnd(32, "0") )
  return vowelConsonantBitfield
}

function findWordsThatFitVowelConsonantPattern(vowelConsonantPatternString, logTime){
  //method = "lft" (letter frequency tables) or "bitfield" (optimized method)
  
  let t1 = null; //For logging time
  if(logTime)t1 = Date.now();
  
  const vowelConsonantPatternBitfield = getVowelConsonantPatternBitfield(vowelConsonantPatternString)
  
  let results = [] //Words to suggest will be stored here
  for(let i in wordList){
    //For each word in the wordlist...
    let wordIsSpellable = wordMatchesVowelConsonantPattern(wordList[i].bitfield, vowelConsonantPatternBitfield)
    if(wordIsSpellable){
      results.push(wordList[i].word)
    }
  }
  if(logTime){
    const t2 = Date.now()
    let logMessage = "Completed word suggestion list in: " + (t2 - t1) + "ms"
    console.log(logMessage)
  }
  return results
}

function wordMatchesVowelConsonantPattern(wordBitfield, vowelConsonantPatternBitfield){
  //All pairs of trailing zeroes at the end of the wordBitfield are irrelevant,
  //so we use bitshifting to remove those digits and any corresponding digits in
  //the vowelConsonantPatternBitfield.
  //(Keep bit shifting as long as the wordBitfield is a multiple of 4, which means it ends in two zeros in binary)
  while( wordBitfield % 4 == 0 ){
    wordBitfield = wordBitfield >> 2
    vowelConsonantPatternBitfield = vowelConsonantPatternBitfield >> 2
  }
  
  //Then, just check for equality.
  //The word's vowel, consonant, and y placements must match the pattern.
  return wordBitfield == vowelConsonantPatternBitfield
}

function decToBin(dec){
  //https://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
  return (dec >>> 0).toString(2).padStart(32, "0")
}

function binToDec(bin){
  return Number(parseInt(bin, 2).toString(10));
}

