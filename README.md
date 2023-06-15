# ipcamera-stream

First of all, it's a based on [**node-rtsp-stream-jsmpeg**]

## Description

Stream IP Camera RTSP stream and output to [WebSocket](https://github.com/websockets/ws) for consumption by [jsmpeg](https://github.com/phoboslab/jsmpeg).
HTML5 streaming video!

## Requirements

You need to download and install [FFMPEG](https://ffmpeg.org/download.html) in server-side.

##Installation

```
npm i ipcamera-stream
```

## Server

```
const IPCameraStream = require('@jmarellanocreation/ipcamera-stream')
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
```


## Client

```
<!DOCTYPE html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>DEMO node-rtsp-stream-jsmpeg</title>
  <script src="https://jsmpeg.com/jsmpeg.min.js"></script>
</head>
<body>
  <div>
    <canvas id="video-canvas">
    </canvas>
  </div>

  <script type="text/javascript">
  var url = "ws://localhost:3001";
  var canvas = document.getElementById('video-canvas');
  var player = new JSMpeg.Player(url, {canvas: canvas});
  </script>
</body>
```