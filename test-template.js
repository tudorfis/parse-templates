if (process.argv.length == 2) {
    console.log(
        "\n Please enter the template id, example: \n" +
        "'$ node test-template wt_57787' \n" +
        "----------------------------------"
    );
} else {
    var express = require('express'),
        app = express(),
        server = require('http').createServer(app);

    var folder_path = 'templates/',
        template_id = 'wt_'+ process.argv[2] +'/',
        page = 'index.html',
        template_path = folder_path + template_id;

    app.use(express.static(template_path));

    app.get('/', function(req, res){
        res.sendFile(__dirname + template_path + page);
    });

    var port = process.argv[2];
    //if (!process.argv[3]) {
    //    port = Math.round(Math.random() * 10000);
    //} else {
    //    port = process.argv[3];
    //}


    server.listen(port);
    console.log('Test your template on: http://localhost:'+ port);
}
