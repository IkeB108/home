function onLoad(){
  console.log("LOADED")
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
    
    //Make new project cards by cloning the tempalte project card,
    //which we will delete at the end.
    let project = pd[p]
    let newProjectCard = template.clone()
    
    //Set the id of the new project card to the name of the project
    newProjectCard.attr("id", project.name)
    
    //Set the title of the card to the title of the project
    newProjectCard.find(".pCardTitle").text(project.title)
    
    //Set other data
    newProjectCard.find(".pCardDescription").text(project.shortDescription)
    newProjectCard.find(".pCardDate").text(project.date)
    newProjectCard.find(".pCardImageContainer").css("background-image", `url("thumbnails/${project.thumbnail}")`)
    
    //Add any icons that apply
    let iconIndex = 7;
    if(project.icons.toLowerCase().includes("interact")){
      let newIconDiv = "<div class=\"iconDiv interactIcon\"><image src=\"icons/interactIcon.png\" class=\"iconImage\"></image></div>"
      newProjectCard.find(".pCardImageContainer").find(".emptyDiv").eq(iconIndex).replaceWith(newIconDiv)
      iconIndex --
    }
    if(project.icons.toLowerCase().includes("youtube")){
      let newIconDiv = "<div class=\"iconDiv youtubeIcon\"><image src=\"icons/youtubeIcon.png\" class=\"iconImage\"></image></div>"
      newProjectCard.find(".pCardImageContainer").find(".emptyDiv").eq(iconIndex).replaceWith(newIconDiv)
      iconIndex --
    }
    if(project.icons.toLowerCase().includes("game")){
      let newIconDiv = "<div class=\"iconDiv gameIcon\"><image src=\"icons/gameIcon.png\" class=\"iconImage\"></image></div>"
      newProjectCard.find(".pCardImageContainer").find(".emptyDiv").eq(iconIndex).replaceWith(newIconDiv)
      iconIndex --
    }
    
    //Set href to the description page for this project
    newProjectCard.attr("href", "description/?" + project.name)
    
    //Temporarily, set href to the actual project itself
    newProjectCard.attr("href", project.link)
    
    $(".pCardGrid").append(newProjectCard)
  }
  
  //Delete the template card
  $("#templatePCardAnchor").remove()
}