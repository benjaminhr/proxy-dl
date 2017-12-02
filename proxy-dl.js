const exec = require('child_process').exec
const http = require('http')
const Progress = require('progress')
const chalk = require('chalk');
const url = process.argv.slice(2)

var proxydl = () => {
  http.get('http://gimmeproxy.com/api/getProxy\?post\=true\&supportsHttps\=true\&maxCheckPeriod\=3600\&country\=US', (res) => {
    res.setEncoding('utf8');
    res.on('data', (data) => {
      let json = JSON.parse(data)
      download(json.curl)
    })
  })

  var download = function (proxyUrl) {
    var bar = new Progress(chalk.green('downloading [:bar] :rate/bps :percent :etas'), {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 100
    });  

    var command = `youtube-dl ${url} --proxy ${proxyUrl}`
    const child = exec(command)

    child.stdout.on('data', (data) => {
      if (bar.complete) {
        console.log('DONE 🎉')
      }
      bar.tick(0.5);
    })
    
    child.stderr.on('data', (data) => {
      var error = chalk.bold.red;

      if (data.includes('country')) {
        console.log(error('Try again, proxy is not in the right country'))
      } else if (data.includes('You must provide at least one URL')) {
        console.log(error('You need to provide a url: proxy-dl $YOUTUBE_URL'))
      } else {
        console.log(error('\n\n' + data))
      }      
    })

    child.on('close', () => {
      process.exit(1)
    })
  }
}

exports.proxydl = proxydl