
var Room = {
    fetchMembers : undefined,

}

Room.fetchMembers = function(roomId){
    if(!roomId) return [];
    var members = [{
        userId: "u001"+0,
        userName: "用户01",
    }, {
        userId: "u002"+1,
        userName: "用户02"
    }];
    return members;
}


module.exports = Room;