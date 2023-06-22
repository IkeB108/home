function onLoad(){
  let query = window.location.href.split("?")[1] || null;
  if(!query){
    console.log("No query")
  } else {
    console.log(query)
    $("title").text(query)
    $("p").text(query)
  }
}