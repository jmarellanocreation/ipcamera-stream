const child_process = require('child_process');
const EventEmitter = require('events');

class Mpeg1Muxer extends EventEmitter {
  #stream;
  #configs;

  constructor(configs) {
    super();
    this.#configs = configs;
    this.startFFmpeg();
  }

  startFFmpeg() {
    this.#stream = child_process.spawn('ffmpeg', [
      '-rtsp_transport', 'tcp',
      '-i', this.#configs.rtspUrl,
      '-f', 'mpegts',
      '-codec:v', 'mpeg1video',
      '-s', this.#configs.screen,
      '-b:v', this.#configs.bitrateVideo,
      '-r', this.#configs.fps,
      '-muxdelay', '0.4',
      `http://localhost:${this.#configs.rtspPort}/${this.#configs.secret}`
    ], {
      detached: false
    });

    this.#stream.on('error', (err) => {
      console.error('FFmpeg Error:', err);
    });

    this.#stream.stdout.on('data', (data) => {
      console.log('FFmpeg Data:', data);
    });

    this.#stream.stderr.on('data', (data) => {
      if (data.toString().includes("Conversion failed!")) {
        console.log('Restarting FFmpeg...');
        this.startFFmpeg();
      }
      console.log('FFmpeg Log Data:', data);
    });

    this.#stream.on('exit', (code) => {
      if (code === 0) {
        console.log('FFmpeg process exited successfully.');
      } else {
        console.error('FFmpeg process exited with code:', code);
        console.log('Restarting FFmpeg...');
        this.startFFmpeg();
      }
    });
  }
}

module.exports = Mpeg1Muxer;
