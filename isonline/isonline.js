/**
 * Created by Bladerunner on 11/03/16.
 */
var net = require('net');
var Promise = require('bluebird');

module.exports = function(RED) {
    function NodeIsOnline(config) {
        RED.nodes.createNode(this,config);
        this.action = config.action;
        this.url = config.url;
        var node = this;

        this.on('input', function(msg) {
            msg.timestamp = +new Date();

            var url = node.url || 'google.com';
            var pos = url.indexOf(":");
            var port = "80";
            if (pos > 0) {
                port = url.substring(pos+1);
                url = url.substring(0, pos);
            }

            checkConnection(url, port).then(function() {
                SendMessage(node, msg, true);
            }, function(err) {
                SendMessage(node, msg, false);
            });

        });
    }

    RED.nodes.registerType("Is-Online",NodeIsOnline);
};

function SendMessage(node, msg, online) {

    msg.online = online;
    switch (parseInt(node.action)) {
        case 0:
            msg.payload = online;
            break;
        case 1:
            if (!online) msg = null;
            break;
        case 2:
            if (online) msg = null;
            break;
    }

    node.send(msg);
}

function checkConnection(host, port, timeout) {
    return new Promise(function(resolve, reject) {
        timeout = timeout || 1000;     // default of 10 seconds
        var timer = setTimeout(function() {
            reject("timeout");
            socket.end();
        }, timeout);
        var socket = net.createConnection(port, host, function() {
            clearTimeout(timer);
            resolve();
            socket.end();
        });
        socket.on('error', function(err) {
            clearTimeout(timer);
            reject(err);
        });
    });
}


