var express = require('express');
var router = express.Router();
var UserService = require("../service/UserService");


/*
    登录成功
    result : {isSuccess: true}

 */
router.get('/', function(req, res) {

    var userId = req.query.userName;
    var pwd = req.query.password;

    var result = {
        isSuccess: false,
    }
    console.log(userId);
    console.log(pwd)
    if(userId && pwd){
        UserService.authUser(userId, pwd, function (isExist) {
            var accessToken = new Date().getTime().toString();
            var expire = 2000;
            result.isSuccess = true;
            result.access_token = accessToken;
            result.expires = expire;
            //将token存储到redis
            UserService.recordAccessToken(accessToken, userId, expire);
            res.json(result);
        })
    }else{
        res.json(result);
    }

});

module.exports = router;