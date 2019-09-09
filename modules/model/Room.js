var MysqlUtils = require("../utils/MysqlUtil");

var Room = {
    createRoom: undefined,
    addMember: undefined,
}

Room.createRoom = function (room, fn) {
    if(!room){
        fn("参数房间不能为空")
    }

    var connect = MysqlUtils.getConnection();
    connect.connect();
    var sql = "insert into room (type, roomName, createUserId, createTime)" +
        " values (?, ?, ?, ?)";
    var params = [room.type, room.roomName, room.createUserId, room.createTime ? room.createTime : new Date()];
    connect.query(sql, params, function (err, result) {
        if(err){
            fn(err, null);
            return;
        }
        fn(undefined, result.insertId);
    });
    connect.end;
};

Room.addMember = function (roomId, userId, joinTime, fn) {
    if(!roomId){
        fn("房间id不能为空");
    }
    if(!userId){
        fn("添加成员用户id不能为空");
    }
    joinTime = joinTime ? joinTime : new Date();
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var sql = "insert into room_member (roomId, userId, joinTime)" +
        " values (?, ?, ?)";

    var params = [roomId, userId, joinTime];
    connect.query(sql, params, function (err, result) {
        if(err){
            fn(err, null);
            return;
        }
        fn(undefined, result);
    });
    connect.end;
}

module.exports = Room;
