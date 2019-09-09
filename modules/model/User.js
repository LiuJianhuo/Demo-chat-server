var path = require("path");
var fs = require("fs");
var MysqlUtils = require("../utils/MysqlUtil");

const  UserDataModel = {
}


var UserEntity = function () {
    this.userId = undefined;
    this.userName = undefined;
    this.headPortrait = undefined;
    this.createTime = undefined;
}

var userEntity = new UserEntity();

var User = {
    creatUserEntity: function(){
        return new UserEntity();
    },
    DBPath: path.join(__dirname,"dbs/user/user.db"),
    _DbPathExists: undefined,
    addUser: undefined,
    removeUser: undefined,
    getUsers: undefined,
    getUserByName: undefined,
    updateUser: undefined,
    getUserById: undefined,
    getContacts: undefined
}

var userBean = User.creatUserEntity();


var commonUtils = require("../utils/CommonUtils");

User._DbPathExists = function(){
    return fs.existsSync(this.DBPath);
}

User.addUser = function(user, fn){
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var addSql = "insert into user(userName, password, headPortrait, createTime)" +
                        "values(?,?,?,?)";

    var params;
    if(user){
        params = [user.userName, user.password, user.headPotrait, user.createTime];
    }else{
        params = ["", "", "", ""];
    }
    connect.query(addSql, params, function (err, result) {
        if(err){
            fn(err.toString());
        }

        fn(err, result.insertId);
    });
    connect.end;
}

User.removeUser = function(userId, fn){
    const isFun = typeof fn === "function";

    if(!userId){
        throw "要移除的用户userId不能为空！";
    }
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var deleteSql = "delete from user where userId=?";

    var params = [userId];
    connect.query(deleteSql, params, function (err, result) {
        if(isFun){
            fn(err, result);
        }
    });
    connect.end;
}

User.getUsers = function(fn){
    const isFun = typeof fn === "function";
    var users = [];
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var selectSql = "select userId, password, userName, headPortrait, createTime from user";

    connect.query(selectSql, function (err, results, fields) {
        if(err){
            fn(err);
            return;
        }
        var user = {}
        for(let result of results){
            user.userId = result.userId;
            user.userName = result.userName;
            user.headPotrait = result.headPotrait;
            user.createTime = result.createTime;
            user.password = result.password;
            users.push(user);
        }
        fn(err, users);

    });
    connect.end;
}

User.getUserById = function(userId, fn){
    const isFun = typeof fn === "function";
    var connect = MysqlUtils.getConnection();
    connect.connect();
    var selectSql = "select userId, email, age, gender, password, userName, headPortrait, createTime from user" +
        " where userId=?";
    if(!userId)
        fn("用户id不能为空")
    connect.query(selectSql, [userId], function (err, results) {
        if(err){
            fn(err.toString());
            return;
        }


        if(!results || results.length < 1) {
            fn(undefined, null);
            return;
        }
        var user = {};
        for(var result of results){
            user.userId = result.userId;
            user.userName = result.userName;
            user.headPotrait = result.headPotrait;
            user.createTime = result.createTime;
            user.password = result.password;
            user.gender = result.gender;
            user.email = result.email;
            user.age = result.age;
            break;
        }
        fn(err, user);
    });
    connect.end;
}

User.getUserByName = function(userName, fn){
    const isFun = typeof fn === "function";

    var connect = MysqlUtils.getConnection();
    connect.connect();
    var selectSql = "select userId, password, headPortrait, createTime from user" +
        " where userName=?";

    if(!userName){
        fn("用户名不能为空！", null);
        return;
    }

    connect.query(selectSql, [userName], function (err, results) {
        if(err){
            console.log(err.toString());
            fn(err.toString());
            return;
        }

        if(!results || results.length < 1) {
            fn(err, null)
            return;
        }

        var user = {};
        for(var result of results){
            user.userId = result.userId;
            user.userName = result.userName;
            user.headPotrait = result.headPotrait;
            user.createTime = result.createTime;
            user.password = result.password;
            break;
        }
        fn(err, user);
    });
    connect.end;
}

User.updateUser = function(userId, updates, fn){
    if(!userId){
        throw "更新的用户id不能为空！"
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
    values.push(userId);
    if(keys.length < 1){
        throw "更新失败";
    }



    const isFun = typeof fn === "function";

    var connect = MysqlUtils.getConnection();
    connect.connect();
    var updateSql = "update user set " + keys.join(",")+
        " where userId=?";

    connect.query(updateSql, values, function (err, results) {
        if(err){
            fn(err);
            return;
        }
        fn(err, results);

    });
    connect.end;
}

//获取联系人
User.getContacts = function(userName, fn){

    if(!userName){
        fn("要查询的联系人用户不能为空");
        return;
    }

    var connect = MysqlUtils.getConnection();
    connect.connect();
    var selectSql = "select u1.userId, u1.userName, c.createTime as friendTime, u1.headPortrait from user u, user u1, contact c" +
        " where u.userName=? and ((u.userId=c.userId and u1.userId=c.otherUserId) or (u.userId=c.otherUserId and u1.userId=c.userId))";

    connect.query(selectSql, [userName], function (err, results) {
        if(err){
            fn(err);
            return;
        }
        console.log(results.length)
        fn(err, results);
    });
    connect.end;
}

/*
    请求添加好友消息记录到数据中
    1.参数 addFriendMsg：
    {
        fromUserId : userId,
        toUserId: addUserId,
        requestTime : requestTime,
        reason: reason,
    }
    2.fn 回调函数， 输出结果信息(消息主键值:msgId)
 */
User.saveAddFriendMsg = function(addFriendMsg, fn) {
    // var addFriendMsg = {
    //     fromUserId : userId,
    //     toUserId: addUserId,
    //     requestTime : requestTime,
    //     reason: reason,
    // }

    if(!addFriendMsg){
        fn("添加好友消息值不能为空");
        return;
    }


    var connect = MysqlUtils.getConnection();
    connect.connect();
    var insertSql = "insert into contact_add_msg" +
        "(fromUserId, toUserId, reason, requestTime, createTime)" +
        " values(?, ?, ?, ?, ?)";
    var params = [
        addFriendMsg.fromUserId, addFriendMsg.toUserId, addFriendMsg.reason,
        addFriendMsg.requestTime, new Date()
    ]

    connect.query(insertSql, params, function (err, result) {
        if(err){
            fn(err.toString());
            return;
        }
        fn(err, result.insertId);
    });
    connect.end;
};

User.getAccommentFriends = function(userId, fn){
    if(!userId){
        fn("用户id不能为空");
        return;
    }

    var connect = MysqlUtils.getConnection();
    connect.connect();
    var selectSql = "select userId, userName, age, gender, email from user" +
        " where userid<>? and userid not in" +
        "   (select u.userid from user u, room r, room_member rm" +
        "       where u.userid in(r.createUserId, rm.userId) and r.roomId=rm.roomId and r.type='single' and r.isDissolved=0)"

    var params = [userId];

    connect.query(selectSql, params, function (err, results) {
        if(err){
            fn(err.toString());
            return;
        }
        fn(undefined, results);
    });
    connect.end;
}

/*
    获取请求好友添加消息
    1. userId : 用户id

 */
User.getAddFriendMsg= function(userId, fn){
    if(!userId){
        fn("用户id不能为空");
        return;
    }

    var connect = MysqlUtils.getConnection();
    connect.connect();
    //降序排列
    //requester : 1 表示请求者， 0 表示被请求者
    var selectSql = "(select u.userId, u.userName, u.age, u.gender, u.email, 0 as isRequester," +
        " msg.reason, msg.status, msg.requestTime, msg.msgId, msg.toUserId, msg.fromUserId" +
        " from user u, contact_add_msg msg" +
        " where msg.toUserId=? and u.userId=msg.fromUserId)" +

        " union (select u.userId, u.userName, u.age, u.gender, u.email, 1 as isRequester," +
        " msg.reason, msg.status, msg.requestTime, msg.msgId, msg.toUserId, msg.fromUserId" +
        " from user u, contact_add_msg msg" +
        " where msg.fromUserId=? and u.userId=msg.toUserId)" +
        " order by requestTime desc";

    var params = [userId, userId];

    connect.query(selectSql, params, function (err, results) {
        if(err){
            fn(err.toString());
            return;
        }
        var notifitations = null;
        if(results && results.length > 0){
            notifitations = [];
            for (var result of results){
                var item = {
                    isRequester: result.isRequester,
                    msg:{
                        msgId : result.msgId,
                        toUserId: result.toUserId,
                        fromUserId: result.fromUserId,
                        requestTime: result.requestTime,
                        reason: result.reason,
                        status: result.status
                    },
                    otherUser:{
                        userId: result.userId,
                        userName: result.userName,
                        age: result.age,
                        gender: result.gender,
                        email: result.email
                    }
                }
                notifitations.push(item);
            }

        }
        fn(undefined, notifitations);
    });
    connect.end;
}


// User.getFriendNotifitation= function(userId, fn){
//     if(!userId){
//         fn("用户id不能为空");
//         return;
//     }
//
//     var connect = MysqlUtils.getConnection();
//     connect.connect();
//     var selectSql = "select userId, userName, age, gender, email from user" +
//         " where userid<>? and userid not in" +
//         "   (select u.userid from user u, room r, room_member rm" +
//         "       where u.userid in(r.createUserId, rm.userId) and r.roomId=rm.roomId and r.type='single' and r.isDissolved=0)"
//
//     var params = [userId];
//
//     connect.query(selectSql, params, function (err, results) {
//         if(err){
//             fn(err.toString());
//             return;
//         }
//         fn(undefined, results);
//     });
//     connect.end;
// }
User.updateAddFriendMsg = function(conditionData, updateData, fn){

    if(!updateData){
        fn("无更新的字段");
        return;
    }
    var updateFields = [];
    var params = [];
    for (var key in updateData){
        updateFields.push(key + "=?");
        params.push(updateData[key]);
    }
    if(updateFields.length < 1){
        fn("无更新的字段");
        return;
    }

    var hasCondition = true;
    if(!conditionData){
        hasCondition = false;
    }

    var updateSql = "update contact_add_msg set " + updateFields.join(',');
    if(hasCondition){
        var conditionFields = [];
        for (var key in conditionData){
            conditionFields.push(key+"=?");
            params.push(conditionData[key]);
        }
        updateSql += " where " + conditionFields.join(' and ');
    }
    console.log(params)
    console.log(updateSql)
    var connect = MysqlUtils.getConnection();
    connect.connect();
    connect.query(updateSql, params, function (err, result) {
        if(err){
            fn(err.toString());
            return;
        }
        console.log(result)
        fn(undefined, result.affectedRows);
    });
    connect.end;
}

User.getAddFriendMsgDetailById = function(msgId, fn){
    if(!msgId){
        fn("消息id不能为空");
        return;
    }

    var connect = MysqlUtils.getConnection();
    connect.connect();

    var selectSql = "select msg.toUserId, u.userName as toUserName, u.age as toUserAge, u.gender as toUserGender, u.email as toUserEmail, " +
            " msg.reason, msg.status, msg.requestTime, msg.msgId, " +
            " msg.fromUserId, u1.userName as fromUserName, u1.age as fromUserAge, u1.gender as fromUserGender, u1.email as fromUserEmail" +
            " from user u, user u1, contact_add_msg msg where msg.toUserId=u.userid and u1.userId=msg.fromUserId and msg.msgId=" + msgId;
    var params = [msgId];

    connect.query(selectSql, msgId, function (err, results) {
        if(err){
            fn(err.toString());
            return;
        }
        var addFriendMsgDetail = null;
        if(results && results.length > 0){
            var result = results[0];
            addFriendMsgDetail = {
                msgId: result.msgId,
                reason: result.reason,
                status: result.status,
                requestTime: result.requestTime,
                toUser: {
                    userId: result.toUserId,
                    userName: result.toUserName,
                    age: result.toUserAge,
                    gender: result.toUserGender,
                    email: result.toUserEmail
                },
                fromUser: {
                    userId: result.fromUserId,
                    userName: result.fromUserName,
                    age: result.fromUserAge,
                    gender: result.fromUserGender,
                    email: result.fromUserEmail
                }
            }
        }
        fn(undefined, addFriendMsgDetail);
    });
    connect.end;
}

module.exports = User;