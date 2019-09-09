

var UserService = require("../service/UserService");
var RoomService = require("../service/RoomService");
var Msg = require("../modules/Msg");


var noticeUser = function(userId, data, dict_UserWithWs){

    return isSuccess;
}

var MsgDealer = {

    Contact: {

    }
}

//联系人 消息处理器
var ContactMsgDealer = {
    dict_UserWithWs: {},
    noticeUser: function (userId, data) {
        var isSuccess = false; //发送成功
        var socket = this.dict_UserWithWs[userId];
        if(socket && socket.readyState === socket.OPEN){
            //3.返回添加好友的消息结果
            socket.send(JSON.stringify(data));
            isSuccess = true;
        }
        return isSuccess;
    },
    //添加好友消息处理
    AddFriend: function () {

    },
    //添加好友成功消息处理
    AddFriendSuccess: function (msgObj, userId) {
        var msgId = msgObj.addFriendMsg.msgId;
        var $this = this;
        UserService.getAddFriendMsgDetailById(msgId, function (error, addFriendMsgDetail) {
            if (error) {
                console.log(error);
                return;
            }
            if (!addFriendMsgDetail) {
                console.log("获取添加好友消息记录【" + msgId + "】为空");
                return;
            }
            //通知请求添加好友的用户，已被成功添加好友
            var fromUser = addFriendMsgDetail.fromUser;
            var toUser = addFriendMsgDetail.toUser;
            var noticeData = {
                msgType: Msg.Type.ADD_FRIEND_SUCCESS,
                addFriendMsg: {
                    msgId: msgId,
                    reason: addFriendMsgDetail.reason,
                    requestTime: addFriendMsgDetail.requestTime,
                    status: addFriendMsgDetail.status,
                    toUser: toUser
                }
            }
            $this.noticeUser(fromUser.userId, noticeData);
        })
    },
    //添加好友失败消息处理
    AddFriendFailure: function (msgObj, userId) {
        var $this = this;
        var msgId = msgObj.addFriendMsg.msgId;
        UserService.getAddFriendMsgDetailById(msgId, function (error, addFriendMsgDetail) {
            if (error) {
                console.log(error);
                return;
            }
            if (!addFriendMsgDetail) {
                console.log("获取添加好友消息记录【" + msgId + "】为空");
                return;
            }
            //通知请求添加好友的用户，已被拒绝添加好友
            var fromUser = addFriendMsgDetail.fromUser;
            var toUser = addFriendMsgDetail.toUser;
            var noticeData = {
                msgType: Msg.Type.ADD_FRIEND_FAILURE,
                addFriendMsg: {
                    msgId: msgId,
                    toUser: toUser
                }
            }
            var flag = $this.noticeUser(userId, noticeData, this.dict_UserWithWs);
            console.log("通知消息", flag ? "success" : "failure")
        })
    },
    RequestAddFriend(msgObj, userId) {
        var addFriendMsg = msgObj.addFriendMsg;
        var msgId = addFriendMsg.msgId;
        var $this = this;
        UserService.getAddFriendMsgDetailById(msgId, function (error, addFriendMsgDetail) {
            if (error) {
                console.log(error);
                return;
            }
            if (!addFriendMsgDetail) {
                console.log("获取添加好友消息记录【" + msgId + "】为空");
                return;
            }
            //通知请求添加好友的用户
            var fromUser = addFriendMsgDetail.fromUser;
            var toUser = addFriendMsgDetail.toUser;
            delete addFriendMsgDetail.toUser;
            var noticeData = {
                msgType: Msg.Type.REQUEST_ADD_FRIEND,
                addFriendMsg: addFriendMsgDetail
            }
            var flag = $this.noticeUser(toUser.userId, noticeData);
            console.log("通知消息", flag ? "success" : "failure")
        })
    },

}

module.exports = ContactMsgDealer;