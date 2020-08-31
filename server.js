// Basic default server setup
// npm install express socket.io nodemon moment

const express = require('express')
const app = express()
const http = require('http');
const PORT = 3000 || process.env.PORT
const path = require('path')
const socketio = require('socket.io')


const formatMessage = require('./utils/message')
const {userJoin, getCurrentUser, userLeave, getRoomUsers, setRoomKey, getRoomKey, getRooms} = require('./utils/users')
const {getYouTubeSearch} = require('./utils/youtube')
const {addVideo, getRoomPlaylist, nextVideo, getPlaylist, removeVid} = require("./utils/playlist");
// Dont know why this is here commented to disable
const { Console } = require('console');

const server= http.createServer(app)
const io = socketio.listen(server);

const botName  = "Server"

// Sets the static folder
app.use(express.static(path.join(__dirname,'public')));
app.use('/io', express.static(__dirname + '/node_modules/socket.io-client/lib'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  //Run when client connects
  // THis is the initial connection for io
  // All the io "messages" are sent through here
io.on("connection", (socket) => {
    
    socket.on('joinRoom', ({username, room})=>{
        //Welcome add console connection message
        console.log("New Connection")
        const user = userJoin(socket.id, username, room)    
        socket.join(user.room)
        setRoomKey(room)
        socket.emit('message', formatMessage(botName,'Welcome to ChatROOM'));
    //Broadcast to everyone except user they are connecting
        socket.broadcast
        .to(user.room)
        .emit('message', formatMessage(botName,` ${user.username} has joined the chat`));
        
        //Send users and Room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)})
    });//ENd of connection
    
    socket.on('searchVideo', (msg)=>{
        //send data to youtube.js for key and get 
        getYouTubeSearch(msg).then((data)=>{
            //console.log(data.items[0])
            socket.emit('searchResults', data)
        })
        .catch((error)=>{
            console.log(error)})
    })
    
    
    //Listen for chatmessage
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })
    

    //Listen for added video to playlist
    socket.on("add_video", (video_id, videoName)=>{
        const user = getCurrentUser(socket.id);
        addVideo(user.room,video_id,videoName) 
        getRoomPlaylist(user.room).then((data)=>{
            io.to(user.room).emit('update_playlist', data)})
        .catch((error)=>{
            console.log(error)})
        });
    
    socket.on("get_playlist", (room) =>{
        getRoomPlaylist(room).then((data)=>{
            io.to(room).emit('update_playlist', data)})
        .catch((error)=>{
            console.log(error)})
    })
    
    
    //Get the Next Video
    socket.on("nextVideo", (room) =>{
        nextVideo(room).then((data)=>{
            socket.emit("nextVideo", data)})
        .catch((error)=>
        console.log(error))

    }) 
    
    //Check playing status
    //data contains username,room,playstatus,current playtime
    socket.on("playingVideo",(data)=>{
        
    })


    socket.on('getCurrentTime',async (playstatus,currtime,currvideo,room) =>{
        var playlist = getPlaylist(room)
        if (playstatus == 1 && currvideo == playlist[0][0].id ){
            socket.broadcast.to(room).emit('updatePlayTime',currtime, currvideo)
        } else if(playstatus == 0 && currvideo == playlist[0][0].id) {
            console.log("changing video " +playlist[0][1].id )
            io.in(room).emit('changeVideo', playlist[0][1].id)
            await removeVid(room)
            getRoomPlaylist(room).then((data)=>{
                io.to(room).emit('update_playlist', data)})
            .catch((error)=>{
                console.log(error)})
        }
    })

    //Runs when client disconnects update roomkey
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
        io.emit('message', formatMessage(botName,`${user.username} has left the chat`));
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)});
        setRoomKey(user.room);
    }});//End of Disconnect
});//END of Connection

//Will repeat on server every 5 seconds
// Will use the roomkey to get current play time then send to other users
// others will compare and adjust their time as needed.
// room key will rotate every minute.
function controlPlay(){
    var rooms = getRooms();
    rooms.forEach(room=> playercontrol(room) )
//Create function for getting info from the key and sending it to each user
//THen on the main.js add function for comparing the time and updating the
//current play position if it is off by more than 5 seconds. Gets the current
// video to insure everyone is on the same video.
    function playercontrol(room){
        var user = getRoomKey(room)
        io.to(user.id).emit("getCurrentTime")
    }
}

setInterval(controlPlay,3000)

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));