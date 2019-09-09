var express = require('express');
var router = express.Router();
var UserService = require("../service/UserService");


/*
    注册成功
    result : {isSuccess: true}

 */
router.get('/', function(req, res) {
    var userName = req.query.userName;

    var password = req.query.password;
    res.cookie("access_token", new Date().getTime(),{maxAge:10000, httpOnly:true});
    if(req.cookies){
        console.log(req.cookies.access_token)
    }
    console.log(req.sessionID)
    console.log(req.session.id)
    if(req.session.userName){
        console.log(req.session.userName);
        res.json({isSuccess: true, result: "已登录过"})
    }
    if(userName === "toby" && password === "123456"){
        req.session.userName = "toby";
        res.json({isSuccess: true, sessionId: req.sessionID});
    }else{
        res.json({isSuccess: false, sss:"ff", sid: req.sessionID})
    }

    // var userId = req.query.userName;
    // var pwd = req.query.password;
    // var result = {
    //     isSuccess: false,
    // }
    // console.log(userId);
    // console.log(pwd)
    // if(userId && pwd){
    //     UserService.authUser(userId, pwd, function (isExist) {
    //         var accessToken = new Date().getTime().toStri
    //         ng();
    //         var expire = 2000;
    //         result.isSuccess = true;
    //         result.access_token = accessToken;
    //         result.expires = expire;
    //         //将token存储到redis
    //         UserService.recordAccessToken(accessToken, userId, expire);
    //         res.json(result);
    //     })
    // }else{
    //     res.json(result);
    // }

}).post('/', function (req, res) {

});

module.exports = router;