console.log("Press 's' to save the webpage contents to the clipboard.")
document.onkeypress = function(e) { 
  if(e.key == 's'){
    c = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Ikebot</title>\n  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n  <meta name=\"description\" content=\"\" />\n  <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\" />\n  <link rel=\"icon\" href=\"favicon.png\">\n</head>"
    c += `<body style="background-color:black">\n`
    c += document.body.innerHTML
    c += "\n"
    c += `</body>\n</html>`
    navigator.clipboard.writeText( c )
    alert("Document is saved to clipboard")
  }
}

function onLoad(){
  //Use the contents of the URL after ? to
  //determine what project should be displayed
  let query = window.location.href.split("?")[1] || null;
  if(!query){
    console.log("No query")
  } else {
    //Make a p for if the markdown file isn't loaded.
    //Then, if it is loaded, we'll delete the p.
    $("body").append(`<p id="failMessage">A page titled ${query} could not be found.`)
  }
  
  //Get the markdown file for this project
  
  //Markdown is converted into HTML with a library called 
  //pagedown: https://github.com/StackExchange/pagedown
  //Markdown cheatsheet: https://www.markdownguide.org/cheat-sheet/
  
  jQuery.get(`markdown/${query}.md`, (data)=> {
    $("#failMessage").remove()
    converter = new Markdown.Converter()
    mdContents = converter.makeHtml(data) ;
    newElements = $.parseHTML(mdContents);
    for(let i in newElements){
      //Append all new elements to the body.
      
      //If the element contains an image, set it to full width
      $(newElements[i]).find('img').attr("width", "100%")
      
      //The markdown converter doesn't embed YouTube videos,
      //So I'll manually search for any p elements starting
      //with vid= and add them manually
      let textContent = newElements[i].textContent
      if(textContent == "br" || textContent == "<br>"){
        $("body").append("<br>")
      } else if(textContent.startsWith("vid::")){
        //If the video link starts with youtu.be
        let videoID = "unknown"
        if(textContent.includes("youtu.be") || textContent.includes("/shorts/")){
          videoID = textContent.split("/").pop()
        }
        if(textContent.includes("watch?v=")){
          videoID = textContent.split("v=").pop()
        }
        
        console.log(videoID)
        let player = $(`<iframe class="ytEmbedInDescription" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`)
        $("body").append(player)
      } else if(textContent.startsWith("button::")) {
        let displayText = textContent.split("::")[1]
        let url = textContent.split("::")[2]
        let newButton =`<a type="button" href="${url}" target="_blank" class="buttonInDescription">${displayText}</a>`
        $("body").append("<br>")
        $("body").append(newButton)
      } else {
        $("body").append(newElements[i])
      }
    }
  })
}