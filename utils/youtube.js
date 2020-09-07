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
    
        //xhr.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=viewCount&q=' + msg + '&maxResults=3&key='+ Key, true);
        //xhr.open('GET','https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=l4JkKr6O99A')
        xhr.open('GET', 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q='+ msg+'&fields=items(id(videoId),snippet(title))&key=' + Key)
        xhr.send();
        })};

module.exports = {
    getYouTubeSearch
}