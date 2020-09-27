
const chatForm = document.getElementById('chat-form');
const socket = io();
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')
const searchSubmit = document.getElementById('search_video')
const searchResult = document.getElementById('results')
const domPlaylist = document.getElementById('playlist-main')

//Get USername and room from URL
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true});


const SyncDelay = 5

var data = { name : username,
                room: room};

//Stores the current playing video id
var playing;

//Join Chatroom
// Send username and room that user joined to server
// THis is sent from a GET request from the index page
socket.emit('joinRoom', {username,room})

//Get Room and Users
//Gets the list of users and updates the room name
socket.on('roomUsers', ({room,users})=>{
    outputRoomname(room);
    outputUsers(users);
})


//Message from server to add to chatbox
socket.on('message', message =>{
    outputMessage(message)
    //Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


socket.on('searchResults', searchlist =>{
    outputVideoSearch(searchlist)
})

//Output the list of videos to the DOM 
function outputVideoSearch(searchList){
    //searchList is an object with items
    //iterate through items
    //Outputs the search results with picture, title, and a add button
    //add button has the video Id as the value
    //Change this to get the photo using video id and med img
    searchResult.innerHTML = `${searchList.items.map(results =>`<li class="searchResult">
    <img src = "https://i.ytimg.com/vi/${results.id.videoId}/mqdefault.jpg"><br>
    <span>${results.snippet.title}</span><br><button type="button" class="search-button" value =${results.id.videoId}>Add</button></li>`).join('')}
    `;
};

//Update Playlist
socket.on('update_playlist', playlist =>{
    updatePlaylist(playlist)
})

function updatePlaylist(playlist){
    domPlaylist.innerHTML=`
    ${playlist.map(playlist =>`<li class = "playlist-result"><img src=${playlist.image}><div class= playlist-text>${playlist.name}</div></li>`).join("")}`
    try{
    if(domPlaylist.children[0].innerHTML != undefined){
        domPlaylist.children[0].innerHTML+= "<div class=playlist-first>Currently Playing</div>"
    }}
    catch(err){}
}

//Updates the videos current playtime. need to check that
// the same video is playing
socket.on('updatePlayTime',(currtime, currvideo) =>{
    //console.log("Got it")
    updatePlayTime(currtime,currvideo)
})


function updatePlayTime(currtime,currvideo){
    var elapsed = player.getCurrentTime()
    //console.log('elapsed' + elapsed)
    //console.log('currtime' + currtime)
    if(playing == currvideo){
        if(elapsed > currtime + SyncDelay || elapsed < currtime - SyncDelay){
            if(player.getPlayerState() == 1){
            player.pauseVideo()
            player.seekTo(currtime)
            player.playVideo()}
        }
    }else {
        player.cueVideoByID({videoId : currvideo, startSeconds:currtime})
    }
}

socket.on('changeVideo', nextvid=>{
    Changevideo(nextvid)
})

//Changes the video on receiving a message form the server
function Changevideo(nextvid){
    player.loadVideoById({videoId:nextvid})
    playing = nextvid;
}

/*PlayStatus numbers
-1 – unstarted
0 – ended
1 – playing
2 – paused
3 – buffering
5 – video cued*/     

//Message submit
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    
    //Sending message to the server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value="";
    e.target.elements.msg.focus();
})

//Output messsge tot DOM CHatbox
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}  <span> ${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
};

// Change the Roomname text to the correct room
function outputRoomname(room){
    roomName.innerText= room;
};
// Add user names to the sidebar
function outputUsers(users){
    userList.innerHTML= `
    ${users.map(user =>`<li>${user.username}</li>`).join('')}
    `;
}

// THis is the listening event to add a video to the playlist
// It will send the value in the button back to the server, add the
// item to the playslits and clear the search box.
searchResult.onclick = function(event){
    let target = event.target;
    if (target.className == "search-button"){
            var videoName =(target.parentNode.childNodes[4].innerText)
            //console.log(target.parentNode.childNodes[4].innerText)
            //value is video id, videoname is the vid name/description
            socket.emit("add_video",target.value,videoName)
    }
}

function getPlaylist(room){
    socket.emit("get_playlist", room)
}

//Get the current playlist when room is loaded
getPlaylist(room)

function getNextVideo(room){
    socket.emit("nextVideo",room)
}


//Sends the server the playerstatus, current time and the videocode.
socket.on("getCurrentTime",() =>{
try{
    //console.log(player.getPlayerState())
    socket.emit("getCurrentTime",player.getPlayerState(),player.getCurrentTime(),
    playing,room)}
    catch(err){}
})

socket.on("nextVideo", video =>{
    try{
    playing = video.id
    player.loadVideoById(video.id)
    player.playVideo()}
    catch(err){}
})

///YOUTUBE SECTION

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '720',
    width: '1280',
    'mute': 1,
    //playerVars: {'controls' : '1'},
    //videoId: '', No Video ID, Start on a blank player
    events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

function onPlayerReady(event) {
    //event.target.pauseVideo(); //DONT USE ONLY for not playing anymore videos
    //Breaks video autoplay for debug throws this error Uncaught TypeError: player.PlayerState is not a function
    //console.log(player.getPlayerState())
    //console.log(player)
    getNextVideo(room)
  }

 
  function onPlayerStateChange(event) {
        switch(event.data){
            case -1: 
                player.playVideo();
            case 5:
                player.playVideo();  
        }
    }
  

searchSubmit.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.elements.search_video.value;
    //send message to the server
    socket.emit("searchVideo", msg);
    //clear the input
    //e.target.elements.searchSubmit.value= "";
})

//Update the playlist every 10 secs
setInterval(getPlaylist(room),10000)
