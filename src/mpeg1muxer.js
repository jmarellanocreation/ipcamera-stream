const child_process = require('child_process');
const EventEmitter = require('events');

class Mpeg1Muxer extends EventEmitter {
  #stream;
  #configs;
  #restartTimer; // Timer reference for restart delay

  constructor(configs) {
    super();
    this.#configs = configs;
    this.startFFmpeg();
  }

  startFFmpeg() {
    if (this.#stream) {
      this.#stream.kill('SIGTERM'); // Stop the existing FFmpeg process if it exists
      this.#stream = null; // Clear the reference to the process
    }

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
      this.stopFFmpeg();
      this.scheduleRestart(); // Schedule restart after a delay
    });

    this.#stream.stdout.on('data', (data) => {
      console.log('FFmpeg Data:', data);
    });

    this.#stream.stderr.on('data', (data) => {
      if (data.toString().includes("Conversion failed!")) {
        console.log('Restarting FFmpeg...');
        this.stopFFmpeg();
        this.scheduleRestart(); // Schedule restart after a delay
      }
      console.log('FFmpeg Log Data:', data);
    });

    this.#stream.on('exit', (code) => {
      if (code === 0) {
        console.log('FFmpeg process exited successfully.');
      } else {
        console.error('FFmpeg process exited with code:', code);
        console.log('Restarting FFmpeg...');
        this.scheduleRestart(); // Schedule restart after a delay
      }
    });
  }

  // Method to stop the FFmpeg process
  stopFFmpeg() {
    if (this.#stream) {
      this.#stream.kill('SIGTERM');
      this.#stream = null;
    }
  }

  // Method to schedule restart after a 3-second delay
  scheduleRestart() {
    if (this.#restartTimer) {
      clearTimeout(this.#restartTimer); // Clear previous timer if it exists
    }

    this.#restartTimer = setTimeout(() => {
      this.startFFmpeg(); // Restart FFmpeg after the timeout
    }, 3000); // 3 seconds delay (3000 milliseconds)
  }
}

module.exports = Mpeg1Muxer;
