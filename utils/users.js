const users = [];
const roomkey ={}
var roomnames = []
//Join user to chat

function userJoin(id,username,room){
    const user = {id,username,room};
    users.push(user);
    return user
}

// Get the current user
function getCurrentUser(id){
    return users.find(user =>user.id === id);
}

//User leaves chat
function userLeave(id){
    const index = users.findIndex(users => users.id === id);
    //need to update room key maybe
    if(index !==-1){
        return users.splice(index,1)[0];
    }
}

//Get room users
function getRoomUsers(room){
    return users.filter(users => users.room === room )
}

//This function sets the room leader. Other users videos will
// follow this users lead. It will rotate every minute.
function setRoomKey(room){
    newKey=getRoomUsers(room)
    roomkey[room] = newKey[Math.floor(Math.random() * newKey.length)]
}

function getRoomKey(room){
    return roomkey[room]
}


/*Get a set of roomnames. Reset roomnames then go through
 each user and get their room. Convert array to a Set.
 This will be used for cycling through and updating room
 current play position
*/
function getRooms(){
    roomnames = []
    users.forEach(user => roomnames.push(user.room))
    roomnames= new Set(roomnames)
    return roomnames
}

module.exports = {
    userJoin, getCurrentUser, userLeave, getRoomUsers, setRoomKey, getRoomKey, getRooms,
}