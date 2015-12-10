$(function() {
    var socket = io();
    socket.on('data', function(data) {
        var html = $('#chat-box').html();
        var piece = '<pre>'+data.title+' / 时间: '+ data.time +'</pre>';
        if(data.beauty) {
            piece += '<pre><code class="'+data.type+'">'+data.data+'</code></pre>';
        } else {
            piece += '<pre>'+data.data+'</pre>';
        }
        $('#chat-box').html(html + piece);
        colourfull();
    });
    
    socket.on('connection', function(data){
        var html = $('#chat-box').html();
        $('#chat-box').html(html + '<br>' + data.msg);
    });
    
    socket.on('split', function(data) {
        $('#chat-box').append('<hr>');
    });
    socket.on('disconnect',function(data){
        console.log(data);
    });
});

var colourfull = function() {
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
};

var clearArea = function() {
    $('#chat-box').html('Data Cleared!');
}