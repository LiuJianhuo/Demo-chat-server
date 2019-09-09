const sqlConnect= require("../utils/MysqlUtil").getConnection();

var MsgDb = {
    getAllByRoom: undefined,
    add: undefined
}

MsgDb.getAllByRoom = function (roomId) {

}

MsgDb.add = function () {
    sqlConnect.connect();
    var addSql = "";
    var result =  sqlConnect.query();
    sqlConnect.end();
}