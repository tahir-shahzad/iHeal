// file system
var normalize_path = require('path').join(__dirname, '../routes/');
var path = '../routes/';

module.exports = (app) => {
    var fs = require('fs').readdirSync(normalize_path).forEach((file) => {
        // uncomment this for testing
        // console.log(file," route loaded");
        require(path + file)(app);
    });
}