const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = false
const port = process.env.PORT || 443
const app = next({ dev })
const handle = app.getRequestHandler()
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
}

app.prepare().then(() => {
  createServer(options, (req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    switch (pathname) {
      case '/a':
        return app.render(req, res, '/a', query)
      case '/b':
        return app.render(req, res, '/b', query)
      default:
        handle(req, res, parsedUrl)
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:',port)
  })
})