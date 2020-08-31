const playlist = {};

var MongoCLient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Groupview";

//Playlist will not be needed DELETE
//THis will add a video to a playlist
// Will just do the Youtube video ID
function addVideo(room,videoid,videoName){
    var video = {
                    name: videoName,
                    image: "https://i.ytimg.com/vi/" + videoid + "/mqdefault.jpg",
                    id: videoid
    };

    MongoCLient.connect(url,{ useUnifiedTopology: true }, function(err,db){
        if (err) throw err;
        var dbo = db.db("Groupview")
        dbo.collection(room).insertOne(video, function(err,res){
            if (err) throw err;
            console.log("one item added");
            db.close(); 
        })
    })    
}


//Returns the playlist for a Room
//Stores current video and next video
function getRoomPlaylist(room){
  return new Promise((resolve,reject)=>{(MongoCLient.connect(url,{ useUnifiedTopology: true },function(err,db){
        if (err) throw err;
        var dbo =db.db("Groupview")
        dbo.collection(room).find({}).toArray(function(err,results){
            if(err) reject(err);
            db.close();
            playlist[room] = [] 
            playlist[room].push(results.slice(0,2))
            resolve(results)
        })
    })
    
)})}

//Need to rename to get current video
function nextVideo(room){
    return new Promise((resolve,reject)=>{
        (MongoCLient.connect(url,{useUnifiedTopology:true}, function(err,db){
            if (err) throw err;
            var dbo = db.db("Groupview")
            results = dbo.collection(room).findOne({}, function(err,result){
                if (err) reject (err);
                    db.close();
                    resolve(result)
            })
        }))
    })
}

function getPlaylist(room){
    return playlist[room]
}

//Removes the first document after the video is played
function removeVid(room){
    new Promise((resolve,reject)=>{
        MongoCLient.connect(url,{useUnifiedTopology:true}, function(err,db){
            if (err) throw err;
            var dbo = db.db("Groupview")
            dbo.collection(room).deleteOne({}, function(err,result){
                if (err) reject (err);
                    db.close();
                    resolve(result)
            })
        })
    })
}

module.exports= {
    addVideo, getRoomPlaylist, nextVideo, getPlaylist, removeVid
}
