var UserService = require("./service/UserService");


var addFriendMsg = {
    fromUserId : "1",
    toUserId: '2',
    requestTime : new Date(),
    reason: "喜欢你",
}


// UserService.saveAddFriendMsg(addFriendMsg, function (error, msgId) {
//     if(error){
//         console.log(error);
//         return;
//     }
//     console.log(msgId)
// });

// UserService.getUserById('1', function (error, user) {
//     if(error){
//         console.log(error);
//         return;
//     }
//     console.log(user)
// });

// UserService.getAccommentFriends('1', function (error, users) {
//     if(error){
//         console.log("error:" + error);
//         return;
//     }
//     var a= {}
//     a.users=users;
//     console.log(JSON.stringify(a));
// })

// UserService.getFriendNotifitation('1', function (error, notifitations) {
//     if(error){
//         console.log("error:" + error);
//         return;
//     }
//     var a= {}
//     console.log(JSON.stringify(notifitations));
// });
// //
// UserService.updateAddFriendMsg({msgId:1},{status:1}, function (error, affectRows) {
//     if(error){
//         console.log("error:" + error);
//         return;
//     }
// })

// UserService.getAddFriendMsgDetailById('1', function (error, msgDetail) {
//     if(error){
//         console.log("error:" + error);
//         return;
//     }
//     console.log(msgDetail)
// })

UserService.getFriendNotifitation('1', function (error, users) {
        if(error){
        console.log("error:" + error);
        return;
    }
    console.log(users)
})