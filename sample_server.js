var http = require('http');

if(process.argv.length <=2 || process.argv[2] === "help" || process.argv[2] === "-h"){
    return console.log("Usage: node sample_server.js <server_port>");
}

var port = parseInt(process.argv[2]);

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hi from ' + port + '\n');
});

console.log("listening on port " + port);


server.listen(port);

