# 学习笔记

# 有限状态机

# 
## HTTP 请求

```
POST /HTTP/1.1
Host:127.0.0.1
Content-Type: application/x-www-form-urlencoded
```

- Request line：method / path / HTTP和版本
- headers：多行，以空白行结束
- body：格式和结构，根据 Content-Type 的不同而不同

## HTTP 响应

```
HTTP/1.1 200 OK
Content-Type:text/html
Date:Mon,23 Dec 2019 06:46:19 GMT
Connection:keep-alive
Transfer-Encoding:chunked
```

- Status link：HTTP和版本 HTTP的状态码 HTTP状态文本
- headers：响应内容的格式和结构，和一些其他信息多行

消息体 chunked body：

【16进制数字】
内容
【16进制数字】
