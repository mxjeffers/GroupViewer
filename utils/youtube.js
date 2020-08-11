//My personal Google Key
// Remove if published
const Key = 'AIzaSyD548HiNdqvXAhQeZKrQ-AwwJTGOY5wvhA' 
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function  getYouTubeSearch(msg){
    return new Promise((resolve,reject)=>{
        var xhr = new XMLHttpRequest();
        
        xhr.onload = ()=>{
            if (xhr.status == 200){

                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(Error(xhr.statusText))
            }
        }
        /* This would work just need to reorganize to get async to work
        xhr.onreadystatechange = function(){
            if (this.readyState == 4 && this.status ==200){
                var YTresponse = (this.responseText)
                console.log("getyoutube")
                //console.log(YTresponse)
                resolve(YTresponse);
            } if(xhr.onerror == true)
                reject(xhr.statusText);
                
            }
        }
            */
        //xhr.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&q=' + msg + '&maxResults=3&key='+ Key, true);
        xhr.open('GET','https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=l4JkKr6O99A')
        xhr.open('GET', 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q='+ msg+'&fields=items(id(videoId),snippet(title,thumbnails(default(url))))&key=' + Key)
        xhr.send();
        
        
        })};

module.exports = {
    getYouTubeSearch
}