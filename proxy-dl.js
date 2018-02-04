const exec = require('child_process').exec
const http = require('http')
const Progress = require('progress')
const chalk = require('chalk');
const url = process.argv.slice(2)

const proxydl = () => {
  http.get('http://gimmeproxy.com/api/getProxy\?post\=true\&supportsHttps\=true\&maxCheckPeriod\=3600\&country\=US', (res) => {
    res.setEncoding('utf8');
    res.on('data', (data) => {
      let json = JSON.parse(data)
      download(json.curl)
    })
  })

  const download = function (proxyUrl) {
    const bar = new Progress(chalk.green('downloading [:bar] :rate/bps :percent :etas'), {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 100
    });  

    const command = `youtube-dl ${url} --proxy ${proxyUrl}`
    const child = exec(command)

    child.stdout.on('data', (data) => {
      if (bar.complete) {
        console.log('DONE 🎉')
      }
      bar.tick(0.2);
    })
    
    child.stderr.on('data', (data) => {
      const error = chalk.bold.red;

      if (data.includes('country')) {
        console.log(error('Try again, proxy is not in the right country'))
      } else if (data.includes('You must provide at least one URL')) {
        console.log(error(`You need to provide a url: `))
        console.log(chalk.green(`    proxy-dl $YOUTUBE_URL`))
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
