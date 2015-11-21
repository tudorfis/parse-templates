/**
 * Testing save image
 * @type {request|exports|module.exports}
 */
//var request = require('request'),
//    fs = require('fs'),
//    mkdirp = require("mkdirp"),
//    cp = require("cp"),
//    getDirName = require("path").dirname;
//
//var link = 'images/favicon.ico',
//    url = 'http://livedemo00.template-help.com/wt_57780/'+ link,
//    file_path = 'test/'+ link;
//
//request.head(url, function (err, res, body) {
//    if (err) return console.log("writeImage: "+ err);
//    mkdirp(getDirName(file_path), function (err) {
//        request(url).pipe(fs.createWriteStream(file_path));
//    });
//});
/**
 * Testing receiving arguments
 */
//if (process.argv.length == 2) {
//    console.log(
//        "'Please enter the template id, example: " +
//        "'node parse-template wt_57787' \n'" +
//        "' ####### ---- #######"
//    );
//} else {
//
//}
/**
 * Testing downloading fonts
 */
//var request = require('request'),
//    fs = require('fs'),
//    url = 'http://livedemo00.template-help.com/wt_57646/fonts/material-design.';
//['eot', 'ttf', 'woff'].forEach(function(ext_type){
//    request.get({
//        url: url + ext_type,
//        encoding: null
//    }, function(err, res, body) {
//        if(err) throw err;
//        fs.writeFileSync('material-design.' + ext_type, body, 'binary');
//    });
//});
