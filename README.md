#Proxy_Sniffer_Server
实现了简单的代理功能, 将请求和响应数据通过websocket发送给监听的浏览器

##准备工作
* [NodeJS](https://nodejs.org)
* git

##项目部署
###克隆代码
	$git clone https://github.com/chenshijie/app_proxy_sniffer
###Install Modules
	$npm install -d

##配置文件
```js
 {
   "target_host":"api.domain.com",
   "target_port":80,
   "service_port":3000
 }
```

* target_host 目标WEB服务器域名或IP
* target_port 目标WEB服务器端口
* service_port 代理服务器监听端口

##运行
	$node prooxy-server.js
	
浏览器访问: http://localhost:3000/proxy.html