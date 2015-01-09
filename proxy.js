var net = require('net'),
    http = require('http'),
    httpProxy = require('http-proxy');

if(process.argv.length <=3 || process.argv[2] === "help" || process.argv[2] === "-h"){
    return console.log("Usage: node proxy.js <proxy_port> <target_port1> [<target_port2> <target_port3> ...]");
}

var proxy_port = parseInt(process.argv[2]);
var ports = ok_ports = [];

for(var i = 3; i< process.argv.length; i++){
    ports.push(parseInt(process.argv[i]));
}

function random (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var proxy = httpProxy.createProxyServer({});

proxy.on('error', function (err, req, res) {
    console.log("PROXY ERROR!");
});

function checkPorts(){

    var count = ports.length;
    var new_ok_ports = [];

    function done(port,ok){
        count--;

        if(ok){
            new_ok_ports.push(port)
        }

        if(count <= 0){

            if(ok_ports.length != new_ok_ports.length){
                console.log("Good ports: " + (new_ok_ports.length?new_ok_ports.join(', '):"none :-("));
            }
            ok_ports = new_ok_ports;

            //se chama novamente depois de 2 segundos
            setTimeout(checkPorts,1000);
        }
    }

    for(var i = 0; i< ports.length; i++){

        setTimeout(function(i){
            return function(){
                var port = ports[i];
                var socket = new net.Socket();

                socket.connect(port, 'localhost', function(){
                    done(port,true);
                    socket.destroy();
                });

                socket.on('error',function(){
                    done(port,false);
                    socket.destroy();
                });
            }

        }(i),i*20);




    }

}

function proxyRequest (req,res) {
    var rand = random(0,ok_ports.length);
    var target = "http://localhost:" + ok_ports[rand];
    console.log("[" + rand + "] " + ok_ports[rand]);
    proxy.web(req, res, { target: target });
}

checkPorts();



var server = http.createServer(function(req, res) {
    proxyRequest(req, res);
});

console.log("listening proxy on port " + proxy_port + " to ports:");
for(var i = 0; i< ports.length; i++){
    console.log("\t- " + ports[i]);
}


server.listen(proxy_port);

