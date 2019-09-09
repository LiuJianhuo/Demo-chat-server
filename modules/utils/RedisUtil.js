
const redis = require('redis');

var port = 6379;
var host = "localhost";
var pwd = "";

var opts = {
    auth_pass: pwd
}

const RedisUtil = {
    createClient : undefined
}

RedisUtil.createClient = function () {
    const client = redis.createClient(port, host);
    client.on('ready',function(res){
        console.log('ready');
        var s = this.exists("token:001");
        console.log(s)
    });

    client.on('end',function(err){
        console.log('end');
    });

    client.on('error', function (err) {
        console.log("error");
    });

    client.on('connect',function(){
        var s = this.exists("token:001");
        console.log('connect:'+s)
    });
    return client;
}

module.exports = RedisUtil;
