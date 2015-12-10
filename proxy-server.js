'use strict'
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var http = require('http');
var beautify = require('js-beautify').js_beautify;
//载入配置文件
var settings = require('./etc/settings');

server.listen(settings.service_port, function () {
    console.log('服务已启动, 端口: %d', settings.service_port);
});

//静态文件目录
app.use(express.static(__dirname + '/public'));
//web socket 连接用户数
var numUsers = 0;

//socket 连接事件处理
io.on('connection', function (socket) {
    numUsers++;
    socket.emit('connection', {
        msg: 'connected'
    });
    //断开连接处理连接用户数
    socket.on('disconnect', function () {
        --numUsers;
    });
});

//发送给socket客户端
var send2client = function (title, data, beauty, type, stringify) {
    var send_data = formatdata(title, data, beauty, type, stringify);
    io.emit('data', send_data);
}
//格式化输出内容
var formatdata = function (title, data, beauty, type, stringify) {
    var time = new Date().getTime();
    var dataString = data;
    if (stringify) {
        dataString = JSON.stringify(data);
    }
    if (beauty) {
        dataString = beautify(dataString, {
            indent_size: 4
        });
    }
    return {
        title: title,
        data: dataString,
        type: type,
        beauty: beauty,
        time: time
    };
};

var format_xml = function(str) {
    var data = str.replace(/</g, "&lt;");
    data = data.replace(/>/g, "&gt;");
    return data;
};

/**
 * 代理到目标服务器
 * @param req
 * @param data
 * @param callback
 */
var proxy2api = function (req, data, callback) {
    var body = '';
    //避免处理gzip返回的报文
    req.headers['accept-encoding'] = false;
    //适应目标使用虚拟主机配置
    req.headers['host'] = 'appapi.17house.com';
    var options = {
        host: 'appapi.17house.com',
        port: 80,
        path: req.url,
        method: req.method,
        headers: req.headers
    };
    var request = http.request(options, function (res) {
        send2client('响应头信息', res.headers, true, 'JSON', true);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            var body_data = body;
            try{
                body_data = JSON.parse(body);
                send2client('响应数据', body_data, true, 'JSON', true);
            } catch(exception) {
                body_data = format_xml(body);
                send2client('响应数据', body_data, false, 'HTML', false);
            }

            callback(body);
        });
    });
    request.end(data, 'utf8');
};

app.get('/*', function (req, res) {
    send2client('请求URL', req.url, true, 'JSON', false);
    send2client('请求参数', req.query, true, 'JSON', true);
    send2client('请求头信息', req.headers, true, 'JSON', true);
    proxy2api(req, '', function (data) {
        res.end(data);
        io.emit('split', {});
    });

});

app.post('/*$', function (req, res) {
    var body = '';
    send2client('请求URL', req.url, true, 'JSON', false);
    send2client('请求参数', req.query, true, 'JSON', true);
    send2client('请求头信息', req.headers, true, 'JSON', true);
    res.on('data', function (chunk) {
        body += chunk;
    });
    res.on('end', function () {
        proxy2api(req, body, function (data) {
            res.end(data);
            io.emit('split', {});
        });
    });
});