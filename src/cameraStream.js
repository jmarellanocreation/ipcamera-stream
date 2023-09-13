const Mpeg1Muxer = require('./mpeg1muxer');
const WebServer = require('./webServer');
const StreamServer = require('./streamServer');
const configs = require('./config');

class IPCameraStream {

    #mpeg1Muxer;
    #webServer;
    #streamServer;

    constructor(options) {
        if(options.wsPort)
            configs.wsPort = options.wsPort;
        if(options.rtspUrl)
            configs.rtspUrl = options.rtspUrl;
        if(options.rtspPort)
            configs.rtspPort = options.rtspPort;
        if(options.screen)
            configs.screen = options.screen;
        if(options.bitrateVideo)
            configs.bitrateVideo = options.bitrateVideo;
        if(options.fps)
            configs.fps = options.fps;
        if(options.secret)
            configs.secret = options.secret;
        if(options.recordStream)
            configs.recordStream = options.recordStream;
        if(options.recordPath)   
            configs.recordPath = options.recordPath;
        if(options.maxStorageGB)   
            configs.maxStorageGB = options.maxStorageGB;
        this.init(configs);
    }

    init(configs){
        this.#webServer = new WebServer(configs);
        this.#streamServer = new StreamServer(configs, this.#webServer);
        this.#mpeg1Muxer = new Mpeg1Muxer(configs);
    }
}
  
module.exports = IPCameraStream