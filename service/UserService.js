
var RedisUtil = require("../modules/utils/RedisUtil");
var MySqlUtil = require("../modules/utils/MysqlUtil");

var User = require("../modules/model/User");



var UserService = {
    authUserByToken : function (token, fn) {
        //RedisClient.get(token);
        if(token){
            var redisClient = RedisUtil.createClient();
            redisClient.get(token, function (err, userId) {
                if(err) {
                    console.log(err.toString());
                }
                fn(userId ? true : false, userId);
            })
        }else{
            fn(false, undefined)
        }


        // console.log("redis:" +token)
        //
        // redisClient.exists(token, function (w) {
        //
        // })
        // if(redisClient.exists(token)){
        //     console.log(redisClient.exists(token))
        //    var userId = redisClient.get(token);
        //    fn(userId ? true: false, userId);
        //    return;
        // }
        // fn(false, undefined);
    },
    authUser : function (userName, pwd, fn) {
        User.getUserByName(userName, function (err, user) {
            if(err){
                fn(err);
                return;
            }
            fn(err, user ? (user.password === pwd) : false);
        })
    },
    recordAccessToken: function (token, userId, expire) {
        var result = {
            isSuccess: false,

        }
        var redisClient = RedisUtil.createClient();
        redisClient.set(token);
        if(redisClient.exists(token)){
            result.reason = "此token("+token+")已经存在!";
        }
        redisClient.set(token, userId);
        redisClient.expire(token, expire);
        result.isSuccess = true;
        return result;
    },
    isExist: function (userName, fn) {
        User.getUserByName(userName, function (err, user) {
            if(err){
                fn(err);
                return;
            }
            fn(err, user ? true: false);
        })
    },
    addUser: function (user, fn) {
        User.addUser(user, function (err, userId) {
            fn(err, userId);
        });
    },
    getUserById: function(userId, fn){
        User.getUserById(userId, function (error, user) {
            fn(error, user);
        })
    },
    getContacts(userName, fn) {
        User.getContacts(userName, function (err, contacts) {
            fn(err, contacts);
        })
    },
    saveAddFriendMsg(addFriendMsg, fn) {
        // var addFriendMsg = {
        //     fromUserId : userId,
        //     toUserId: addUserId,
        //     requestTime : requestTime,
        //     reason: reason,
        // }
        User.saveAddFriendMsg(addFriendMsg, function (err, msgId) {
            fn(err, msgId);
        })
    },
    getAccommentFriends(userId, fn) {
        User.getAccommentFriends(userId, function (error, users) {
            fn(error, users);
        })
    },
    getFriendNotifitation(userId, fn) {
        User.getAddFriendMsg(userId, function (error, notifitation) {
            fn(error, notifitation);
        });
    },
    updateAddFriendMsg(conditionData, updateData, fn) {
        User.updateAddFriendMsg(conditionData, updateData, fn);
    },
    getAddFriendMsgDetailById(msgId, fn) {
        User.getAddFriendMsgDetailById(msgId, fn);
    },

    getAddFriendMsgDDetailById(s, f) {
        
    }
}


module.exports = UserService;