const http = require('http') // 基础的 http 服务

let server = function (request, response) {
  // response.setHeader('Access-Control-Allow-Origin', '*') // 允许跨域的请求头
  let body = [] // {string} 接收的数据 
  // 监听'data'事件,收data的传参
  request.on('error', error => {
    console.error(error)
  }).on('data', data => {
    body.push(data)
  }).on('end', () => { // 监听'end'事件,接参结束
    // 用 querystring 格式化接收到的参数
    body = Buffer.concat(body).toString() // {object} 接收的数据
    console.log(body)
    response.writeHead(200, {'Content-Type': 'text/html'}) // 把数据返回给前台
    response.end('Hello world')
  })
}

http.createServer(server).listen(1111)