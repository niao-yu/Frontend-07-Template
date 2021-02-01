const net = require('net');
const parse = require('./parse');

class Request {
  constructor(options) {
    this.method = options.method && options.method.toUpperCase() || 'GET'
    this.host = options.host
    this.port = options.port || 80
    this.path = options.path || '/'
    this.body = options.body || {}
    this.headers = options.headers || {}
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
    }

    this.headers['Content-Length'] = this.bodyText.length
  }

  toString() {
    let a = `${this.method} ${this.path} HTTP/1.1\n`
    let b = Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')
    let c = `\n\n${this.bodyText}`
    return a + b + c
  }
  
  send(connection) {
    return new Promise((resole, reject) => {
      const parse = new ResponseParser;
      if (connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port,
        }, () => {
          connection.write(this.toString())
        })
      }

      connection.on('data', data => {
        parse.receive(data.toString())
        if (parse.isFinished) {
          resole(parse.response)
          connection.end()
        }
      })

      connection.on('error', err => {
        connection.end()
        reject(err)
      })
    })
  }
}

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0
    this.WAITING_STATUS_LINE_END = 1
    this.WAITING_HEADER_NAME = 2
    this.WAITING_HEADER_SPACE = 3
    this.WAITING_HEADER_VALUE = 4
    this.WAITING_HEADER_LINE_END = 5
    this.WAITING_HEADER_BLOCK_END = 6
    this.WAITING_BODY = 7

    this.current = this.WAITING_STATUS_LINE
    this.statusLine = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    this.bodyParse = null
  }

  get isFinished() {
    return this.bodyParse && this.bodyParse.isFinished
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParse.content.join(''),
    }
  }

  receive(string) {
    // console.log(string)
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }
  receiveChar(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_STATUS_LINE_END
      } else {
        this.statusLine += char
      }
    } else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ':') {
        this.current = this.WAITING_HEADER_SPACE
      } else if (char === '\r') {
        this.current = this.WAITING_HEADER_BLOCK_END
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParse = new TrunkedBodyParser()
        }
      } else {
        this.headerName += char
      }
    } else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE
      }
    } else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === '\r') {
        this.headers[this.headerName] = this.headerValue
        this.headerName = ''
        this.headerValue = ''
        this.current = this.WAITING_HEADER_LINE_END
      } else {
        this.headerValue += char
      }
    } else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WAITING_BODY
      }
    } else if (this.current === this.WAITING_BODY) {
      this.bodyParse.receiveChar(char)
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0 // 一行开始了
    this.WAITING_LENGTH_LINE_END = 1 // 长度行结束了
    this.READING_TRUNK = 2
    this.WAITING_NEW_LINE = 3
    this.WAITING_NEW_LINE_END = 4

    this.length = 0
    this.content = []
    this.isFinished = false
    this.current = this.WAITING_LENGTH

    this.a = 0
  }
  receiveChar(char) {
    if (this.isFinished) return
    if (this.current === this.WAITING_LENGTH) { // 整个刚开始了
      // console.log('整个刚开始了', char === ' ' ? '空格' : char === '\r' ? 'r' : char === '\n' ? 'n' : char, '*')
      if (char === '\r') {
        // console.log(this.length)
        if (this.length === 0) {
          this.isFinished = true
        }
        this.current = this.WAITING_LENGTH_LINE_END
      } else {
        this.length *= 16
        this.length += parseInt(char, 16)
        // console.log(this.length, char)
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) { // 长度行结束了
      if (char === '\n') {
        this.current = this.READING_TRUNK
      }
    } else if (this.current === this.READING_TRUNK) { // 开始记录真实内容
      this.content.push(char)
      this.length--
      this.a++
      // console.log(this.length, this.a, char === ' ' ? '空格' : char === '\r' ? 'r' : char === '\n' ? 'n' : char)
      if (this.length === 0) { // 消息完了
        this.current = this.WAITING_NEW_LINE
      }
    } else if (this.current === this.WAITING_NEW_LINE) { // 消息刚完，等待回车 \r
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) { // 全完了，回归
      if (char === '\n') {
        this.current = this.WAITING_LENGTH
      }
    }
  }
}

void async function() {
  let request = new Request({
    // method: 'post',
    host: '127.0.0.1',
    port: '1111',
    path: '/',
    headers: {
      ['X-Foo2']: 'customed',
      // ['Content-Type']: 'application/json',
    },
    body: {
      name: 'winter',
    },
  })
  console.log('开始')

  try {
    let response = await request.send()
    // console.log('response')
    // console.log(response)
    parse.parseHtml(response.body)
  } catch(error) {
    console.error('error')
    console.error(error)
  }
}()