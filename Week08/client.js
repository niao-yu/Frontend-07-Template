const net = require('net');

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
    // console.log(1, 'toString 执行了', a, b, c)
    return a + b + c
  }
  
  send(connection) {
    return new Promise((resole, reject) => {
      const parse = new ResponseParser;
      console.log(12, '来了')
      if (connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port,
        }, () => {
          console.log(this.toString())
          connection.write(this.toString())
        })
      }

      connection.on('data', data => {
        console.log(0.1)
        console.log(data.toString())
        console.log(1.1)
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

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
    console.log(this.statusLine)
    console.log(this.headers)
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
      console.log(char)
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

  try {
    let response = await request.send()
    console.log('response')
    console.log(response)
  } catch(error) {
    console.error('error')
    console.error(error)
  }
}()