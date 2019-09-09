var Room = require("../modules/model/Room");

var RoomService = {
    createRoom: function (room, fn) {
        Room.createRoom(room, fn);
    },
    addMember: function (roomId, userId, joinTime, fn) {
        Room.addMember(roomId, userId, joinTime, fn);
    }
}

module.exports = RoomService;