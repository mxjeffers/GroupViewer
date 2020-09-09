//My personal Google Key
//Remove if published

//Your Youtube Key here
const {getKey} = require('./key')

var Key = getKey()

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function  getYouTubeSearch(msg){

    if (msg.length == 11){
        //https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=Yl5jDU7dLg8&format=json
        var inputID = new Promise((resolve,reject)=>{
            var xhr = new XMLHttpRequest();
            xhr.onload = ()=>{
                if (xhr.status == 200){
                    resolve(JSON.parse(xhr.responseText))
                } else{
                    reject(Error)
                }
            }
            xhr.open('GET', 'https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=' + msg + '&format=json')
            xhr.send();
        })
        inputID.then((message)=>{
            var data = {items: { 0: {
                                    id: { 
                                        videoId : msg
                                        }
                                    },
                                    snippet : {
                                        title: message.title
                                    }
                                }}
        console.log(data)                        
        return data}).catch()
    }
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