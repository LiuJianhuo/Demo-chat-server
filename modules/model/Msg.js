
var MysqlUtils = require("../utils/MysqlUtil");

var Msg = {

    addMsg: undefined,
    removeMsg: undefined,
    getMsgsByRoom: undefined,
    updateMsg: undefined
}

var commonUtils = require("../utils/CommonUtils");

Msg.addMsg = function(msg, fn){
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var addSql = "insert into msg(roomId, sender, isSuccess, isRead, content, type, createTime)" +
        "values(?,?,?,?,?,?,?)";

    var params=[];
    if(msg){
        params = [msg.roomId, msg.sender, msg.isSuccess, msg.isRead,
                     msg.content, msg.type, msg.creareTime];
    }else{
        params = ["", "", "","","","",""];
    }

    connect.query(addSql, params, function (err, result) {
        if(typeof  fn === "function"){
            fn(err, result);
        }
    });
    connect.end;
}

Msg.removeMsg = function(recordId, fn){
    const isFun = typeof fn === "function";

    if(!recordId){
        throw "要移除的消息recordId不能为空！";
    }
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var deleteSql = "delete from msg where recordId=?";

    var params = [recordId];
    connect.query(deleteSql, params, function (err, result) {
        if(isFun){
            fn(err, result);
        }
    });
    connect.end;
}

Msg.getMsgsByRoom = function(roomId, fn){
    if(!roomId){
        throw "查询的房间不能为空！"
    }

    const isFun = typeof fn === "function";
    var records = [];
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var selectSql = "select recordId, sender, isSuccess, isRead, content, type, createTime " +
                        "from user where roomId=?";

    connect.query(selectSql, [roomId], function (err, results, fields) {
        if(err){
            fn(err);
            return;
        }
        var record = {}
        for(let result of results){
            record.recordId = result.recordId;
            record.sender = result.sender;
            record.isSuccess = result.isSuccess;
            record.isRead = result.isRead;
            record.content = result.content;
            record.type = result.type;
            record.creareTime = result.createTime;
            records.push(record);
        }
        fn(err, records);

    });
    connect.end;
}

Msg.updateMsg = function(recordId, updates, fn){
    if(!recordId){
        throw "更新的消息不能为空！"
    }
    if(typeof updates !== "object"){
        throw "更新失败";
    }

    var keys = [];
    var values =[]
    for(let key in updates){
        keys.push(key+"=?");
        values.push(updates[key]);
    }
    values.push(recordId);
    if(keys.length < 1){
        throw "更新失败";
    }



    const isFun = typeof fn === "function";

    var connect = MysqlUtils.getConnection();
    connect.connect();
    var updateSql = "update msg set " + keys.join(",")+
                        " where recordId=?";

    connect.query(updateSql, values, function (err, results) {
        if(err){
            fn(err);
            return;
        }
        fn(err, records);

    });
    connect.end;
}
module.exports = Msg;