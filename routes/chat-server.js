var express = require("express");
var router = express.Router();

var expressWs = require("express-ws");
expressWs(router);
var util = require("util");

var Msg = require("../modules/Msg");
var Room = require("../modules/Room");
var WSBroadcast = require("../modules/WSBroadcast");
var UserService = require("../service/UserService");
var RoomService = require("../service/RoomService");
var ContactMsgDealer = require("../webscoket/MsgDealer");


var num=0;
//用户与websocket字典
var dict_UserWithWs= {}
var onlineUser = {}

var messageBroadcast = function(sender, msgObj, roomId, onlineMembers, offlineMembers){
    var content = msgObj.content;//消息内容
    var type = msgObj.type;
    var notNoticedMembers = [];//没有通知到的成员
    for (let member of onlineMembers){
        //console.log(onlineMembers)
        let ws = member.ws;
        if(ws && ws.readyState === ws.OPEN){
            var msg = WSBroadcast.BuilderTextMsg(msgObj);
            ws.send(msg);
        }else{
            notNoticedMembers.push({
                userId: member.userId
            })
        }
    }
    return notNoticedMembers;
}
var userId = "1";

var noticeUser = function(userId, resData){
    var isSuccess = false; //发送成功
    var socket = dict_UserWithWs[userId];
    if(socket && socket.readyState === socket.OPEN){
        //3.返回添加好友的消息结果
        socket.send(JSON.stringify(resData));
        isSuccess = true;
    }
    return isSuccess;
}
var temp ={
    "1" : "token:001",
    "2": "token:002",
};
var i = 1;
router.ws("/chat", function (ws, req) {
    var User = require("../modules/model/User");
    //var accessToken = req.query.access_token;
    var userId = i % 2 === 0 ? 2 : 1;
    var accessToken = temp[userId];
    dict_UserWithWs[userId] = ws;
    //连接返回用户信息
    var resData = {
        isSuccess: false,
        msgType: Msg.Type.LOGIN_USER_INF,
    }
    resData.msgType = Msg.Type.LOGIN_USER_INF;
    console.log(Msg.Type.LOGIN_USER_INF)

    UserService.getUserById(userId, function (error, user) {
        if(error){
            resData.reason = error.toString();
            noticeUser(userId, resData);
            return;
        }
        if(!user) {
            resData.reason = "不存在该用户";
            noticeUser(userId, resData);
            return;
        }
        delete user.password;
        resData.isSuccess = true;
        user.accessToken = accessToken;
        resData.user = user;
        noticeUser(userId, resData);
    });


    // UserService.authUserByToken(accessToken, function (isExist, userId) {
    //     if (!isExist) {
    //         console.log("身份认证失败:", accessToken);
    //         resData.reason = "身份认证失败，请重新建立连接";
    //         //noticeUser(userId, resData);
    //         ws.send(resData)
    //         return;
    //     }
    //     console.log("用户上线:" + userId);
    //     dict_UserWithWs[userId] = ws;
    // });
    i++;
    ws.on("message", function (msg) {
        console.log(msg);
        //消息对象
        var msgObj = JSON.parse(msg);
        var msgType = msgObj.msgType;
        var accessToken = msgObj.accessToken;

        var resData = {
            isSuccess: false,
            msgType: msgType,
        }

        UserService.authUserByToken(accessToken, function (isExist, userId) {
            if(!isExist){
                console.log("身份认证失败:", accessToken);
                resData.reason = "身份认证失败，请重新建立连接";
                noticeUser(userId, resData);
                return;
            }

            console.log("身份认证成功：userid:"+userId);
            if(msgType === Msg.Type.ADD_FRIEND_SUCCESS){
                ContactMsgDealer.dict_UserWithWs = dict_UserWithWs;
                ContactMsgDealer.AddFriendSuccess(msgObj, userId);
            }
            else if(msgType === Msg.Type.ADD_FRIEND_FAILURE) {
                ContactMsgDealer.dict_UserWithWs = dict_UserWithWs;
                ContactMsgDealer.AddFriendFailure(msgObj, userId);
            }
            //通知对方，请求添加好友
            else if(msgType === Msg.Type.REQUEST_ADD_FRIEND){
                ContactMsgDealer.dict_UserWithWs = dict_UserWithWs;
                ContactMsgDealer.RequestAddFriend(msgObj, userId);
            }
        });

        //
        //
        // var roomId = msgObj.roomId;
        // var content = msgObj.content;
        // var sender = msgObj.sender;
        // var timestamp = msgObj.timestamp;
        // var type = msgObj.type;
        //
        // //1.将消息持久化到数据库中
        // var sqlConn = require("../modules/utils/MysqlUtil").getConnection();
        // sqlConn.connect();
        // var addSql = "insert into msg(roomId, type, content, sender, timestamp)" +
        //                     "values (?,?,?,?,?)";
        // var params = [roomId, type, content, sender, timestamp];
        // sqlConn.query(addSql, params, function (err, result) {
        //     if(err){
        //        console.log("insert error:" + err.message);
        //        return;
        //     }
        //     console.log("insert success" + result.insertId);
        //     console.log(result)
        //     console.log("-----")
        // });
        // //2.根据roomId 获取房间中的成员
        // //  1）获取在线成员，和未在线成员
        // //  2) 给在线成员广播消息，未在线成员的未读消息持久化到数据库
        // //3.通知发送者已成功发送
        //
        //
        //
        //
        // //1.更加roomId 获取房间中的成员
        // var members = Room.fetchMembers(roomId);
        // var onlineUser = [];
        // var offlineUser = [];
        // console.log("房间["+roomId+"]在线的成员有:")
        // for(var member of members){
        //     var userId = member.userId;
        //     var userName = member.userName;
        //     if(dict_UserWithWs[userId]){
        //         console.log(userId + ":"+userName)
        //         onlineUser.push({
        //             userId: userId,
        //             ws: dict_UserWithWs[userId]
        //         })
        //     }else {
        //         offlineUser.push({
        //             userId: member.userId
        //         })
        //     }
        // }
        // //消息传播给其他用户
        // var notNoticedMembers = messageBroadcast(sender, msgObj, roomId, onlineUser, offlineUser);
        // if(notNoticedMembers.length <1){
        //     console.log("全部通知到了")
        // }
        //
        // //给发送者传回消息已成功发出
        //
        //
        //
        // //2. 1)在线的成员：给发送消息
        // //   2)离线的成员：加入到消息队列中
        // if (Msg.Type.TEXT === msgObj.type){
        //
        // }else if(Msg.Type.VOICE === msgObj.type){
        //
        // }

    });
    ws.on("close", function (code) {
        for (var key in dict_UserWithWs){
            if(dict_UserWithWs[key] === this){
                delete dict_UserWithWs[key];
                console.log("用户离线:"+key);
            }
        }
    });
    ws.on("error", function (error) {
        console.log("error:"+util.inspect(error));

    });


});

module.exports = router