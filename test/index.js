const IPCameraStream = require('../src/cameraStream')
new IPCameraStream({
    wsPort: 3001,
    rtspUrl: 'rtsp://localhost/stream1',
    rtspPort: 3002,
    screen: '720x480',
    bitrateVideo: '6000k',
    fps: 30,
    secret: 's1',
    recordStream: true,
    recordPath: '/media/'
});