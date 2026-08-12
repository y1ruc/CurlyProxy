const fs = require('fs');
const path = require('path');

const UV_SRC = path.join(__dirname, 'node_modules', '@titaniumnetwork-dev', 'ultraviolet', 'dist');
const UV_DEST = path.join(__dirname, 'public', 'uv');
const FILES = ['uv.bundle.js', 'uv.client.js', 'uv.handler.js', 'uv.sw.js'];

if (!fs.existsSync(UV_SRC)) {
    console.error('UV source not found at', UV_SRC);
    process.exit(1);
}

if (!fs.existsSync(UV_DEST)) {
    fs.mkdirSync(UV_DEST, { recursive: true });
}

for (const file of FILES) {
    const src = path.join(UV_SRC, file);
    const dest = path.join(UV_DEST, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('Copied ' + file);
    } else {
        console.warn('Missing: ' + file);
    }
}

const ROOT_SW = path.join(__dirname, 'public', 'sw.js');
const sw = '/* CurlyProxy */\n' +
    'self.addEventListener("install",function(){self.skipWaiting()});\n' +
    'importScripts("/uv/uv.bundle.js");\n' +
    'importScripts("/uv/uv.config.js");\n' +
    'importScripts("/uv/uv.sw.js");\n' +
    'var uvsw=new UVServiceWorker();\n' +
    'self.addEventListener("fetch",function(e){e.respondWith(uvsw.fetch(e))});\n' +
    'self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())});\n';
fs.writeFileSync(ROOT_SW, sw);
console.log('Created /sw.js');

const CONFIG_PATH = path.join(UV_DEST, 'uv.config.js');
const config = '/* CurlyProxy UV Config */\n' +
    'self.__uv$config={\n' +
    ' prefix:"/~/curly/",\n' +
    ' bare:"/bare/",\n' +
    ' encodeUrl:Ultraviolet.codec.xor.encode,\n' +
    ' decodeUrl:Ultraviolet.codec.xor.decode,\n' +
    ' handler:"/uv/uv.handler.js",\n' +
    ' client:"/uv/uv.client.js",\n' +
    ' bundle:"/uv/uv.bundle.js",\n' +
    ' config:"/uv/uv.config.js",\n' +
    ' sw:"/uv/uv.sw.js"\n' +
    '};\n';
fs.writeFileSync(CONFIG_PATH, config);
console.log('Created uv.config.js');
console.log('UV setup complete.');
