const playlist = {};

var MongoCLient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Groupview";

//Playlist will not be needed DELETE
//THis will add a video to a playlist
// Will just do the Youtube video ID
function addVideo(room,videoid,videoName){
    var video = {
                    name: videoName,
                    image: "https://i.ytimg.com/vi/" + videoid + "/default.jpg",
                    id: videoid
    };
   /* 
    if (playlist[room] === undefined){
        
        playlist[room] = []

    }
    //console.log(playlist)
    playlist[room].push(video)
    //console.log(playlist)*/
    
    MongoCLient.connect(url,{ useUnifiedTopology: true }, function(err,db){
        if (err) throw err;
        var dbo = db.db("Groupview")
        dbo.collection(room).insertOne(video, function(err,res){
            if (err) throw err;
            console.log("one item added");
            db.close(); 
        })
    })

    //Next make playlist update to each room with broadcast.
    //playlist.push(video);
    
}


//Returns the playlist for a Room
//Stores current video and next video
function getRoomPlaylist(room){
  return new Promise((resolve,reject)=>{(MongoCLient.connect(url,{ useUnifiedTopology: true },function(err,db){
        if (err) throw err;
        var dbo =db.db("Groupview")
        dbo.collection(room).find({}).toArray(function(err,results){
            if(err) reject(err);
            //console.log(results);
            db.close();
            //if (playlist[room] === undefined){
             playlist[room] = [] 
            playlist[room].push(results.slice(0,2))
            //console.log(results)
            resolve(results)
        })
    })
    
)})}

//Need to rename to get current video
//dont work db.getCollection().find({}).skip(1).limit(1)
function nextVideo(room){
    return new Promise((resolve,reject)=>{
        (MongoCLient.connect(url,{useUnifiedTopology:true}, function(err,db){
            if (err) throw err;
            var dbo = db.db("Groupview")
            results = dbo.collection(room).findOne({}, function(err,result){
              
                if (err) reject (err);
                    db.close();
                    //console.log(result)
                    resolve(result)
                })
            
            }
    ))
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
