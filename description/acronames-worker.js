let combinationsGenerated = 0;
let numberOfCombinations = 0;

function rb(myString){ //remove brackets
  return myString.replaceAll("[", "").replaceAll("]", "")
}

function getNested(obj, ...args) {
  return args.reduce((obj, level) => obj && obj[level], obj)
}

function getResultText(matchingWords, includeAllResults){
  let resultText = ""
  let matchingWordsKeys = Object.keys(matchingWords)
  //Sort first by length, and then alphabetically
  matchingWordsKeys.sort( (a, b) => {return rb(b).length - rb(a).length || rb(b).localeCompare(rb(a)) } )
  
  //Only display the top 1000 longest words to avoid memory problems
  for(let k = 0; k < matchingWordsKeys.length && (k < 1000 || includeAllResults); k ++){
    let namesList = sortNamesByWord(matchingWords[ matchingWordsKeys[k] ].split(" "), matchingWordsKeys[k]).join(", ")
    resultText += rb(matchingWordsKeys[k]) + ": " + namesList + "\n"
  }
  
  return resultText;
  //Put all results in the resultsP element
}

function sortNamesByWord(namesList, wordString){
  for(let i in namesList){
    namesList[i] = rb(namesList[i])
  }
  let sortedNames = []
  let availableNames = namesList.slice();
  for(let i in wordString){
    let letterFound = false;
    for(let j in namesList){
      if(namesList[j].length > 0 && !letterFound && namesList[j][0].toLowerCase() == wordString[i].toLowerCase() && availableNames.includes(namesList[j])){
        availableNames.splice( availableNames.indexOf(namesList[j]), 1 )
        sortedNames.push(namesList[j])
        letterFound = true;
      }
    }
  }
  return sortedNames;
}

function lazyProduct(sets,f,context){
  if (!context) context=this;
  var p=[],max=sets.length-1,lens=[];
  for (var i=sets.length;i--;) lens[i]=sets[i].length;
  function dive(d){
    var a=sets[d], len=lens[d];
    if (d==max) for (var i=0;i<len;++i) p[d]=a[i], f.apply(context,p);
    else        for (var i=0;i<len;++i) p[d]=a[i], dive(d+1);
    p.pop();
  }
  dive(0);
}

onmessage = (e) => {
  //User has clicked generate acronyms button.
  
  //Get full names from textarea
  let namesInputVal = e.data[0];
  let wordList = e.data[1];
  let minLetterSliderVal = e.data[2];
  let maxLetterSliderVal = e.data[3];
  console.log(maxLetterSliderVal)
  let includeMultipleSpellings = e.data[4];
  fullNames = namesInputVal.split("\n")
  
  //Remove any lines that are empty
  fullNames = fullNames.filter(element => (element != "") )
  
  //Create a pruned word list by removing words that can't possibly be used
  postMessage([
    "status text",
    "Pruning word list..."
  ])
  
  //Step 1: Calculate the min & max number of letters a usable word can have
  maximumWordLength = fullNames.length
  if(minLetterSliderVal > maximumWordLength){
    postMessage(["setMinLetterSlider", maximumWordLength])
    minLetterSliderVal = maximumWordLength;
  }
  
  if(maxLetterSliderVal < maximumWordLength){
    maximumWordLength = maxLetterSliderVal;
  }
  
  minimumWordLength = fullNames.filter( e => !e.includes("[") && !e.includes("]")).length
  if(minimumWordLength < minLetterSliderVal )minimumWordLength = minLetterSliderVal;
  
  //Step 2: Create an array of usable letters. Words that include unusable letters can be eliminated.
  usableLetters = []
  for(let i in fullNames){
    let nameWithoutBrackets = rb(fullNames[i]).split(" ")
    for(let j in nameWithoutBrackets){
      let initial = nameWithoutBrackets[j][0].toLowerCase()
      if(!usableLetters.includes(initial))usableLetters.push(initial)
    }
  }
  
  //Step 3: Eliminate words that are the wrong length or include unusable letters
  prunedWordList = []
  for(let i in wordList){
    if(wordList[i].length >= minimumWordLength &&
    wordList[i].length <= maximumWordLength){
      //Word is the correct length. Check if it has unusable letters
      let hasUnusableLetters = false;
      for(let j in wordList[i]){
        if( !usableLetters.includes(wordList[i][j].toLowerCase()) )hasUnusableLetters = true;
      }
      if(!hasUnusableLetters){
        prunedWordList.push(wordList[i])
      }
    }
  }

  
  let nameCombinations = [];
  iwl = {};
  let combnSettings = []
  
  //If the pruned word list is empty, then there are no possible acronames and we don't need to go any further.
  if(prunedWordList.length == 0){
    postMessage(["alert", "No words can be spelt with this list of names. Try making some names optional with [brackets], or try adding middle names or nick-names."])
  } else {
    //There is at least one word in the pruned word list, so continue.
    
    postMessage([
      "status text",
      "Indexing word list..."
    ])
    
    //Create indexed word list: words categorized by length
    //and then by first two letters
    for(let w in prunedWordList){
      let word = prunedWordList[w]
      let alphabetizedWord = word.split("").sort().join("")
      //Create category for words of this length if not created yet
      if(!iwl.hasOwnProperty( alphabetizedWord.length )){
        iwl[alphabetizedWord.length] = {}
      }
      //Create category for words with these two starting letters if not created yet
      if(!iwl[alphabetizedWord.length].hasOwnProperty(alphabetizedWord.slice(0,2))){
        iwl[alphabetizedWord.length][alphabetizedWord.slice(0,2)] = {}
      }
      //Add the word to the necessary category
      
      if(!iwl[alphabetizedWord.length][alphabetizedWord.slice(0,2)].hasOwnProperty(alphabetizedWord) ){
        iwl[alphabetizedWord.length][alphabetizedWord.slice(0,2)][alphabetizedWord] = []
      }
      iwl[alphabetizedWord.length][alphabetizedWord.slice(0,2)][ alphabetizedWord ].push( word )
    }
    
    //Get settings for combinations of names
    for(let i in fullNames){
      //If the full name has brackets, then it is deemed optional by the user.
      fullNameIsOptional = fullNames[i].includes("[") || fullNames[i].includes("]");
      
      fullNames[i] = rb(fullNames[i]) //Remove brackets if any
      
      
      let splitName = fullNames[i].split(" ")
      for(let i in splitName){
        splitName[i] += " "
      }
      if(fullNameIsOptional)splitName.push(""); //Add an empty option if the full name is optional
      combnSettings.push(splitName)
    }
    
    //Calculate number of combinations by multiplying all array lengths in combnSettings
    numberOfCombinations = 1;
    for(let i in combnSettings)numberOfCombinations *= combnSettings[i].length;
    
    if(numberOfCombinations > 100000000){
      postMessage([
        "alert",
        "Warning: your name list will testing searching over 100 million combinations. The webpage may crash due to running out of memory."
      ])
    }
    combinationsGenerated = 0;
  }
  //Iterate through all name combinations WITHOUT storing them in an array (to save memory)
  
  matchingWords = {}
  //First: write a function for what happens to a name combination when generated
  const doWithNameCombination = function(...names){
    let nameCombination = Array.prototype.slice.call(names, 0);
    //Get initials of this name combination and sort alphabetically
    let s = nameCombination.filter(element => (element != "") )
    let letters = []
    s.forEach( element => { 
      letters.push( element[0].toUpperCase() )
    } )
    letters = letters.sort().join("")
    
    //If number of letters is below minimum requirement, don't bother searching
    //the word list. Otherwise, go ahead.
    if(letters.length >= minimumWordLength){
      //Search the indexed word list for matches with this combination
      let queryResult = getNested(iwl, letters.length, letters.slice(0,2), letters)
      if( typeof queryResult !== "undefined" ){
        //There is an array with at least one matching word in it.
        for(let k in queryResult){
          if(!includeMultipleSpellings){
            matchingWords[ queryResult[k] ] = nameCombination.join("");
          }
          if(includeMultipleSpellings){
            let addedBrackets = ""
            while( typeof matchingWords[queryResult[k] + addedBrackets] !== "undefined" ){
              addedBrackets += "]"
            }
            matchingWords[queryResult[k] + addedBrackets] = nameCombination.join("");
          }
        }
      }
    }
    
    
    
    combinationsGenerated ++;
    
    if(combinationsGenerated % 40000 == 0 || combinationsGenerated == numberOfCombinations){
      let asteriskCount = Math.round((combinationsGenerated / numberOfCombinations) * 20);
      let percentage = Math.round((combinationsGenerated / numberOfCombinations) * 100);
      let loadingBarText = "[" + "*".repeat(asteriskCount) + "_".repeat(20-asteriskCount) + "] " + percentage + "%"
      postMessage([
        "status text",
        `Pruned word list has ${numberWithCommas(prunedWordList.length)} words.\nTesting ${numberWithCommas(numberOfCombinations)} potential name combinations: ${letters}\n${loadingBarText}\nWords found:${Object.keys(matchingWords).length}`,
        matchingWords
      ])
      
      postMessage([
        "results text",
        getResultText(matchingWords, false), //Includes only top 1000 results
        getResultText(matchingWords, true) //Includes all results
      ])
    }
    
  }
  
  //Second: use lazyProduct function to generate and iterate through name combinations
  lazyProduct(combnSettings, doWithNameCombination);
  postMessage(["complete progress", matchingWords])
}


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}