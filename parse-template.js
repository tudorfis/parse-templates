/**
 *
 */
if (process.argv.length == 2) {
    console.log(
        "\n Please enter the template id, example: \n" +
        "'$ node parse-template 57787' \n" +
        "----------------------------------"
    );
} else {
    var request = require('request'),
        cheerio = require('cheerio'),
        fs = require('fs'),
        mkdirp = require("mkdirp"),
        cp = require("cp"),
        getDirName = require("path").dirname,
        async = require('async');

    var template_id = template_id = 'wt_'+ process.argv[2] +'/',
        template_folder = 'templates/',
        website_domain = 'http://livedemo00.template-help.com/';

    local_url = template_folder + template_id;
    remote_url = website_domain + template_id;

    var removeFolder = function(location, next) {
        fs.readdir(location, function (err, files) {
            async.each(files, function (file, cb) {
                file = location + '/' + file
                fs.stat(file, function (err, stat) {
                    if (err) {
                        return cb(err);
                    }
                    if (stat.isDirectory()) {
                        removeFolder(file, cb);
                    } else {
                        fs.unlink(file, function (err) {
                            if (err) {
                                return cb(err);
                            }
                            return cb();
                        })
                    }
                })
            }, function (err) {
                if (err) return next(err)
                fs.rmdir(location, function (err) {
                    return next(err)
                })
            })
        })
    };

    var checkIfImage = function(link) {
        if (link) {
            return (link.toLowerCase().indexOf('.jpg') != -1 ||
            link.toLowerCase().indexOf('.jpeg') != -1 ||
            link.toLowerCase().indexOf('.png') != -1 ||
            link.toLowerCase().indexOf('.ico') != -1 ||
            link.toLowerCase().indexOf('.bmp') != -1);
        }
        return false;
    };

    var checkIfFont = function(link) {
        if (link) {
            return (link.toLowerCase().indexOf('.otf') != -1 ||
            link.toLowerCase().indexOf('.eot') != -1 ||
            link.toLowerCase().indexOf('.ttf') != -1 ||
            link.toLowerCase().indexOf('.woff') != -1);
        }
        return false;
    };

    var checkIfLocal = function(link) {
        if (link) {
            return (link.indexOf('//') == -1 && link.indexOf('www.') == -1);
        }
        return false;
    };

    var checkIfValid = function(link) {
        if (link) {
            return (link != '#' && link != './' &&
                    link.indexOf('mailto:') == -1 &&
                    link.indexOf('callto:') == -1 &&
                    link.match(/\.[a-z]{2,4}$/) &&
                    link != 'scriptUrl' &&
                    link != "' + scriptUrl + '");
        }
        return false;
    };

    var writeImage = function(src) {
        if (checkIfLocal(src)) {

            src = src.replace(/\?.+$/g, '');

            var url = remote_url + src,
                file_path = local_url + src;
            request.head(url, function (err, res, body) {
                if (err) return console.log("writeImage: "+ err);
                mkdirp(getDirName(file_path), function (err) {
                    request(url).pipe(fs.createWriteStream(file_path));
                });
            });
        }
    };

    var writeFont = function(src) {
        if (checkIfLocal(src)) {
            src = src.replace(/\s?format\(.+\).*$/g, '')
                    .replace(/\s?\#.*$/g, '')
                    .replace(/\s?\?.*$/g, '');
            var url = remote_url + src,
                file_path = local_url + src;
            request({
                url: url,
                encoding: null
            }, function (err, resp, body) {
                if (err) return console.log("writeFont: "+ err);
                mkdirp(getDirName(file_path), function (err) {
                    if (err) return console.log("writeFont: "+ err);
                    fs.writeFileSync(file_path, body, 'binary');
                });
            });
        }
    };

    var writeFile = function(link, type, cb) {
        if (checkIfLocal(link) && checkIfValid(link)) {
            var url = remote_url + link,
                file_path = local_url + link;
            fs.exists(file_path, function(exists) {
                if (!exists) {
                    request(url, function (err, resp, body) {
                        if (err) return console.log("ERROR: "+ url);
                        mkdirp(getDirName(file_path), function (err) {
                            if (err) return console.log("mkdirp: "+ err);
                            var content;
                            if (type == 'html') {
                                var $ = cheerio.load(body);
                                content = $.html();
                            } else {
                                content = body;
                            }
                            fs.writeFile(file_path, content, function (err) {
                                if (err) return console.log("fs.writeFile: "+ err);
                                if (type == 'js') {
                                    var result_arr1 = body.match(/include\(.+\)/g),
                                        result_arr2 = body.match(/href\=[\"\']{1}[0-9a-zA-Z\.\-\_\/]+[\"\']{1}/g);
                                    if (result_arr1) {
                                        result_arr1.forEach(function(link){
                                            link = link.replace('include(', '')
                                                .replace(')', '')
                                                .replace(/\'/g, '')
                                                .replace(/\"/g, '');

                                            if (link.indexOf('//') == -1) {
                                                if (!link.match(/\.\.\//g) && link.indexOf('js/') == -1) {
                                                    var link_fp = file_path.replace(local_url, '');
                                                    link = getDirName(link_fp) + '/' + link;
                                                } else {
                                                    link = link.replace('../', '');
                                                }
                                                writeFile(link, 'js');
                                            }
                                        });
                                    }
                                    if (result_arr2) {
                                        result_arr2.forEach(function(link){
                                            link = link.replace('href="', '')
                                                .replace("href='", '')
                                                .replace(/\'/g, '')
                                                .replace(/\"/g, '');

                                            var ext_type = link.match(/\.[a-z0-9]{3,4}$/),
                                                ext_type_str;
                                            if (ext_type) {
                                                ext_type_str = ext_type[0];
                                                ext_type_str = ext_type_str.replace(/\./, '');
                                            }
                                            if (ext_type_str) {
                                                writeFile(link, ext_type);
                                            }
                                        });
                                    }
                                    if (file_path.match(/jquery[0-9\-\.]*(\.min)*\.js/g)) {
                                        cp("bower_components/jquery/dist/jquery.js", file_path, function(err){
                                            if (err) return console.log("cp: "+ err);
                                        });
                                    }
                                } else if (type == 'css') {
                                    result_arr = body.match(/url\(.+\)/g);
                                    if (result_arr) {
                                        result_arr.forEach(function(link){
                                            link = link.replace('url(', '')
                                                .replace(')', '')
                                                .replace(/\'/g, '')
                                                .replace(/\"/g, '');

                                            if (!link.match(/\.\.\//g) && link.indexOf('css/') == -1) {
                                                var link_fp = file_path.replace(local_url, '');
                                                link = getDirName(link_fp) + '/' + link;
                                            } else {
                                                link = link.replace('../', '');
                                            }
                                            if (link.toLowerCase().indexOf('.css') != -1) {
                                                writeFile(link, 'css');
                                            } else if (checkIfImage(link)) {
                                                writeImage(link);
                                            } else if (checkIfFont(link)) {
                                                writeFont(link);
                                            }
                                        });
                                    }
                                } else if (type == 'html') {
                                    $('link').each(function(i, element){
                                        var href = $(element).attr('href');
                                        if (checkIfImage(href)) {
                                            writeImage(href);
                                        } else {
                                            writeFile(href, 'css');
                                        }
                                    });
                                    $('script').each(function(i, element){
                                        var src = $(element).attr('src');
                                        writeFile(src, 'js');
                                    });
                                    $('img').each(function(i, element){
                                        var src = $(element).attr('src');
                                        writeImage(src);
                                    });
                                    $('*[data-url]').each(function(i, element){
                                        var src = $(element).attr('data-url');
                                        writeImage(src);
                                    });
                                    $('*[data-src]').each(function(i, element){
                                        var src = $(element).attr('data-src');
                                        writeImage(src);
                                    });
                                    $('a').each(function(i, element){
                                        var href = $(element).attr('href');
                                        writeFile(href, 'html')
                                    });
                                }
                            })
                        });
                    })
                }
            })
        };
    };

    /// init
    fs.exists(local_url, function(exists) {
        if (exists) {
            removeFolder(local_url, function(err){
                if (err) return console.log("REMOVE FOLDER:"+ err);
                writeFile('index.html', 'html');
            });
        } else {
            writeFile('index.html', 'html');
        }
    });

}