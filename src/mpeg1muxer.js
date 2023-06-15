const child_process = require('child_process');
const EventEmitter = require('events');

class Mpeg1Muxer extends EventEmitter {

  #stream;

  constructor(configs) {
    super(configs);
    this.#stream = child_process.spawn('ffmpeg', ['-rtsp_transport', 'tcp', '-i', configs.rtspUrl, '-f', 'mpegts', '-codec:v', 'mpeg1video', '-s', configs.screen, '-b:v', configs.bitrateVideo, '-r', configs.fps, '-muxdelay', '0.4', `http://localhost:${configs.rtspPort}/${configs.secret}`], {
      detached: false
    });
    this.#stream.stdout.on('data', (data) => { console.log(data) })
    this.#stream.stderr.on('data', (data) => { console.error(data.toString()) })
  }
}

module.exports = Mpeg1Muxer;