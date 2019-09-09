
var Msg = require("../modules/Msg")

var WSBroadcast = {
    BuilderTextMsg: undefined
}


// type: Msg.Type.TEXT,
//     roomId: "",
//     content: "",
//     sender:"",
//     timestamp: new Date().getTime()
WSBroadcast.BuilderTextMsg = function (msgObj, ) {
    msgObj = Object.assign({
        type: Msg.Type.TEXT,
        recordId:"",
        roomId: "",
        content: "",
        sender:"",
        isRead:false,
        isSuccess:false,
        timestamp: undefined
    }, msgObj || {});
    return JSON.stringify(msgObj);
}

module.exports = WSBroadcast;

