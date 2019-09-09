var express = require('express');
var router = express.Router();
var UserService = require("../service/UserService");
var RoomService = require("../service/RoomService");
var User = require("../modules/model/User");
var util = require("util")

/*
    用户登录
 */
router.post('/login', function (req, res) {
    var body = req.body;
    var userName = body.userName;
    var password = body.password;
    console.log(userName);
    console.log(password);

    //请求响应回的数据
    var resData = {
        isSuccess: false
    }

    if(!userName || !password){
        resData.reason="用户名、密码不能为空!";
        res.json(result);
        return;
    }
    //认证用户
    //1)认证成功，将用户信息保存到session中
    UserService.authUser(userName, password, function (error, isExist) {
        if(error){
            resData.reason = error;
        }else if(isExist){
            req.session.userName = userName;
            resData.isSuccess = true;
        }else{
            resData.reason = "用户不存在!";
        }
        res.json(resData);
    })

});

/*
    用户注册请求处理
 */
router.post('/register', function (req, res) {
    var body = req.body;
    var userName = body.userName;
    var password = body.password;
    var email = body.email;

    //响应返回的数据
    var resData = {
        isSuccess: false,
    }

    //用户名密码不能为空
    if(!userName || !password || !email){
        resData.reason="用户名、密码、邮箱不能为空!";
        res.json(resData);
        return;
    }

    //判断是否存在此用户名是否已被注册
    UserService.isExist(userName, function (err, isExist) {
        if(err){
            resData.reason = err;
        }else if(isExist){
            resData.reason = "已存在该用户！";
        }else{
            var user = {
                userName: userName,
                password: password,
                createTime: new Date(),
                email: email
            }
            //存储在数据库中
            UserService.addUser(user, function (err, userId) {
                if(err){
                    resData.reason = err;
                }else{
                    //生成access_token;
                    var accessToken = "toke_" + new Date().getTime().toString();
                    var expire = 2000;
                    resData.access_token = accessToken;
                    //将token存储到redis
                    var recordTokenResult = UserService.recordAccessToken(accessToken, userId, expire);
                    if(recordTokenResult.isSuccess){
                        resData.isSuccess = true;
                        resData.expire = expire;
                        resData.userId = userId;
                    }else{
                        resData.reason = recordTokenResult.reason;
                    }
                }
                res.json(resData);
            })
            return;
        }
        res.json(result);
    });


})

/*
    根据用户名去查找该用户的联系人
    获取联系人
 */
router.get("/contacts", function (req, res) {
    //响应返回的数据
    var resData = {
        isSuccess: false
    }

    var userName = req.params.userName;
    if(!userName){
        resData.reason = "要查询联系人的用户不能为空";
        res.json(resData);
        return;
    }

    UserService.getContacts(userName, function (error, contacts) {
        if(error){
            resData.reason = error;
        }else{
            resData.contacts = contacts;
        }
        res.json(resData);
    })
});


/*
   处理推荐好友请求
   参数：access_token
 */

router.get("/friends/accomment", function (req, res) {
    var accessToken = req.query.access_token;//req.params.access_token;
    console.log(accessToken)
    var resData = {
        isSuccess: false
    }

    UserService.authUserByToken(accessToken, function (isExist, userId) {
        if(!isExist){
            resData.reason = "用户验证失败";
            console.log(isExist)
            res.json(resData);
            return;
        }
        //用户认证成功
        UserService.getAccommentFriends(userId, function (error, users) {
            if(error){
                resData.reason = error;
            }else{
                resData.isSuccess = true;
                resData.users = users;
            }
            res.json(resData);
        });
    })
});

/*
   好友通知信息请求
   参数：access_token
 */

router.get("/friends/notifitation", function (req, res) {
    var accessToken = req.query.access_token;//req.params.access_token;
    console.log(accessToken)
    var resData = {
        isSuccess: false
    }

    UserService.authUserByToken(accessToken, function (isExist, userId) {
        if(!isExist){
            resData.reason = "用户验证失败";
            console.log(isExist)
            res.json(resData);
            return;
        }
        //用户认证成功
        UserService.getFriendNotifitation(userId, function (error, notifitations) {
            if(error){
                resData.reason = error;
            }else{
                resData.isSuccess = true;
                resData.notifitations = notifitations;
            }
            res.json(resData);
        });
    })
});

var routerUrl = "/friend/agree";
router.post(routerUrl, function (req, res) {
    var accessToken = req.body.access_token;
    var body = req.body;
    var resData = {
        isSuccess: false
    }

    UserService.authUserByToken(accessToken, function (isExist, userId) {
        if(!isExist){
            resData.reason = "用户验证失败";
            console.log(routerUrl, "---用户验证失败");
            res.json(resData);
            return;
        }
        console.log(routerUrl, "---用户验证成功");
        //同意好友需要处理如下：
        //     // 1.更新添加好友消息的状态为同意
        //     // 2.创建房间, 房间创建人为请求添加好友用户
        //     // 3.房间添加成员, 添加被请求添加好友用户
        //     // 4.给请求添加好友用户发送好友请求成功信息
        //     // 5.给被请求添加好友用户发送同意操作成功

        var conditionData = {
            status: 0,
            toUserId: userId,
            msgId: body.msgId
        }
        var updateData = {
            status: 1
        }
        UserService.updateAddFriendMsg(conditionData, updateData, function(error, affectRows) {
            if (error) {
                resData.reason = error;
                res.json(resData);
                return;
            }
            resData.isSuccess = true;

            if (affectRows > 0) {
                UserService.getAddFriendMsgDetailById(body.msgId, function (error, addFriendMsgDetail) {
                    if (error) {
                        console.log(routerUrl, "---", error);
                        return;
                    }
                    if (!addFriendMsgDetail) {
                        console.log("获取添加好友消息记录【" + msgId + "】为空");
                        return;
                    }
                    var fromUserId = addFriendMsgDetail.fromUser.userId;
                    var toUserId = addFriendMsgDetail.toUser.userId;
                    var room = {
                        type: 'single',
                        createUserId: userId,
                        createTime: new Date()
                    }
                    //创建房间
                    RoomService.createRoom(room, function (err, roomId) {
                        if (err) {
                            console.log("创建房间失败..")
                            return;
                        }
                        console.log("创建房间成功..")
                        //添加成员
                        RoomService.addMember(roomId, fromUserId, new Date(),  function (error) {
                            if (error) {
                                console.log("添加成员失败！");
                                return;
                            }
                            console.log("添加成员成功!");
                            //通知用户操作成功
                            res.json(resData);
                        });
                    });
                });
            }else{
                //通知用户操作成
                res.json(resData);
            }
        });
    })
});


var routerUrl = "/friend/reject";
router.post(routerUrl, function (req, res) {
    var accessToken = req.body.access_token;
    var body = req.body;
    var resData = {
        isSuccess: false
    }
    UserService.authUserByToken(accessToken, function (isExist, userId) {
        if(!isExist){
            resData.reason = "用户验证失败";
            console.log(routerUrl, "---用户验证失败");
            res.json(resData);
            return;
        }
        console.log(routerUrl, "---用户验证成功");

        var conditionData = {
            status: 0,
            toUserId: userId,
            msgId: body.msgId
        }
        var updateData = {
            status: -1
        }
        UserService.updateAddFriendMsg(conditionData, updateData, function(error, affectRows) {
            if (error) {
                resData.reason = error;
                res.json(resData);
                return;
            }
            resData.isSuccess = true;
            //通知用户操作成功
            res.json(resData);
        });
    })
});


var routerUrl = "/friend/add";
router.post(routerUrl, function (req, res) {
    console.log(req.url)
    var body = req.body;
    var accessToken = body.access_token;
    var addUserId = body.addUserId;
    var reason = body.reason;
    var resData = {
        isSuccess: false
    }
    UserService.authUserByToken(accessToken, function (isExist, userId) {
        if(!isExist){
            resData.reason = "用户验证失败";
            console.log(routerUrl, "---用户验证失败");
            res.json(resData);
            return;
        }
        console.log(routerUrl, "---用户验证成功");

        var requestTime = new Date();
        var addFriendMsg = {
            fromUserId: userId,
            toUserId: addUserId,
            requestTime: requestTime,
            reason: reason
        }

        UserService.saveAddFriendMsg(addFriendMsg, function(error, msgId) {
            if (error) {
                resData.reason = error;
                res.json(resData);
                return;
            }
            resData.isSuccess = true;
            resData.addFriendMsg = {
                msgId: msgId,
                requestTime: requestTime,
            };
            //通知用户操作成功
            res.json(resData);
        });
    })
});


module.exports = router;