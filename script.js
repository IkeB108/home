console.log("Press 's' to save the webpage contents to the clipboard.")
document.onkeypress = function(e) { 
  if(e.key == 's'){
    $("#makePageWarning").remove()
    c = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Ikebot</title>\n  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n  <meta name=\"description\" content=\"\" />\n  <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\" />\n  <link rel=\"icon\" href=\"favicon.png\">\n</head>"
    c += `<body style="background-color:black">\n`
    c += document.body.innerHTML.split("<!-- Code injected by live-server -->")[0]
    c += "\n"
    c += `</body>\n</html>`
    navigator.clipboard.writeText( c )
    alert("Document is saved to clipboard")
  }
}

function onLoad(){
  fetch("description/projectDescriptions.json")
    .then((response) => response.json())
    .then(generateProjectCards)
  
}

function generateProjectCards(json){
  projectDescriptions = json
  pd = projectDescriptions
  
  let template = $("#templatePCardAnchor")
  
  for(let p in pd){
    //For each project, create a project card.
    
    //Make new project cards by cloning the template project card,
    //which we will delete at the end.
    let project = pd[p]
    let newProjectCard = template.clone()
    
    //Set the id of the new project card to the name of the project
    newProjectCard.attr("id", project.name + "ProjectCard")
    
    //Make it visible
    newProjectCard.removeAttr("hidden")
    
    //Set the title of the card to the title of the project
    newProjectCard.find(".pCardTitle").text(project.title)
    
    //Set other data
    newProjectCard.find(".pCardDescription").text(project.shortDescription)
    newProjectCard.find(".pCardDate").text(project.date)
    newProjectCard.find(".pCardImageContainer").css("background-image", `url("thumbnails/${project.thumbnail}")`)
    newProjectCard.find(".pCardImageContainer").attr("title", project.thumbnailAlt)
    
    //Add any icons that apply (interact, youtube, and/or game)
    let iconIndex = 7;
    if(project.icons.toLowerCase().includes("interact")){
      let newIconDiv = "<div class=\"iconDiv interactIcon\"><img src=\"icons/interactIcon.png\" class=\"iconImage\" alt=\"interactive\"></img></div>"
      newProjectCard.find(".pCardImageContainer").find(".emptyDiv").eq(iconIndex).replaceWith(newIconDiv)
      iconIndex --
    }
    if(project.icons.toLowerCase().includes("youtube")){
      let newIconDiv = "<div class=\"iconDiv youtubeIcon\"><img src=\"icons/youtubeIcon.png\" class=\"iconImage\" alt=\"YouTube\"></img></div>"
      newProjectCard.find(".pCardImageContainer").find(".emptyDiv").eq(iconIndex).replaceWith(newIconDiv)
      iconIndex --
    }
    if(project.icons.toLowerCase().includes("game")){
      let newIconDiv = "<div class=\"iconDiv gameIcon\"><img src=\"icons/gameIcon.png\" class=\"iconImage\" alt=\"game\"></img></div>"
      newProjectCard.find(".pCardImageContainer").find(".emptyDiv").eq(iconIndex).replaceWith(newIconDiv)
      iconIndex --
    }
    
    //Set href to the description page for this project
    newProjectCard.attr("href", "description/" + project.name + ".html")
    
    //Temporarily, set href to the actual project itself
    // newProjectCard.attr("href", project.link)
    
    $(".pCardGrid").append(newProjectCard)
  }
  
  //Delete the template card
  $("#templatePCardAnchor").remove()
}