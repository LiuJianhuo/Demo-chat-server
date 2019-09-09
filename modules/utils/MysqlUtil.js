
var mysql = require('mysql');



var MysqlUtil = {
    getConnection : function(){
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '123456',
                database: 'chat'
            });
            return connection;
        } ,
}
//connection.connect();

module.exports = MysqlUtil;
