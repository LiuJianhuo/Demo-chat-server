
var RoomServer = require('./service/RoomService');
var util = require('util')

RoomServer.createRoom({
    type: "many",
    roomName: "一起嗨",
    createUserId: "1"
}, function (error, roomId) {
    if(error){
        console.log(error);
        return;
    }
    console.log(roomId)
});

RoomServer.addMember('001', '1', null, function (error, result) {
    if(error){
        console.log(error);
        return;
    }
    console.log(util.inspect(result))
})