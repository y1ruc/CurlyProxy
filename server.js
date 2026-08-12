const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');

const PORT = process.env.PORT || 3000;
const CACHE_TTL = 60000;
const MAX_CACHE = 200;
const cache = new Map();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

app.get('/proxy', async function (req, res) {
    var target = req.query.url;
    if (!target) return res.status(400).send('missing url');
    if (!/^https?:\/\//i.test(target)) return res.status(400).send('bad url');

    var cached = cache.get(target);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        for (var k in cached.headers) { res.setHeader(k, cached.headers[k]); }
        return res.send(cached.body);
    }

    try {
        var fetchRes = await fetch(target, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            redirect: 'follow',
            agent: function (u) { return u.protocol === 'https:' ? httpsAgent : httpAgent; },
        });

        var ct = fetchRes.headers.get('content-type') || '';
        var finalUrl = fetchRes.url;

        var resHeaders = {};
        var skip = [
            'content-encoding','content-length','transfer-encoding',
            'x-frame-options','content-security-policy','content-security-policy-report-only',
            'x-content-type-options','cross-origin-embedder-policy',
            'cross-origin-opener-policy','cross-origin-resource-policy','permissions-policy'
        ];
        fetchRes.headers.forEach(function (v, k) {
            if (skip.indexOf(k.toLowerCase()) === -1) { resHeaders[k] = v; }
        });

        var isHtml = ct.indexOf('text/html') !== -1;
        var isCss = ct.indexOf('text/css') !== -1;
        var isJs = ct.indexOf('javascript') !== -1 || ct.indexOf('ecmascript') !== -1;

        if (isHtml) {
            var body = await fetchRes.text();
            body = body.replace(/<base\s+[^>]*>/gi, '');
            body = rewriteHtml(body, finalUrl);
            body = body.replace(/<head[^>]*>/i, '<head><base href="/proxy?url=' + enc(finalUrl) + '"><script>!function(){var P="/proxy?url=",B=/\\b(?:404|403|blocked|captcha)\\b/;var b=function(u){return B.test(String(u||""))};try{var _as=Location.prototype.assign,_rp=Location.prototype.replace;Object.defineProperty(Location.prototype,"assign",{value:function(u){if(!b(u))return _as.call(this,u)}});Object.defineProperty(Location.prototype,"replace",{value:function(u){if(!b(u))return _rp.call(this,u)}})}catch(e){};try{var _ps=history.pushState,_rs=history.replaceState;history.pushState=function(s,t,u){if(!b(u))return _ps.apply(this,arguments)};history.replaceState=function(s,t,u){if(!b(u))return _rs.apply(this,arguments)}}catch(e){};var _open=window.open;window.open=function(u,n,f){if(b(u))return null;return _open.apply(this,arguments)};var base=document.querySelector("base").href;try{var _f=window.fetch;window.fetch=function(u,o){var t=String(u);if(t.indexOf(location.origin)===0||t.indexOf("blob:")===0||t.indexOf("data:")===0)return _f.apply(this,arguments);try{var n=new URL(t,base);return _f(P+encodeURIComponent(n.href),o)}catch(e){return _f.apply(this,arguments)}}}catch(e){};try{var _xhropen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){var t=String(u);if(t.indexOf(location.origin)!==0&&t.indexOf("blob:")!==0&&t.indexOf("data:")!==0){try{var n=new URL(t,base);u=P+encodeURIComponent(n.href)}catch(e){}}return _xhropen.call(this,m,u)}}catch(e){};try{var d=document.createElement.bind(document);document.createElement=function(t){var e=d(t);if(t.toLowerCase()==="script"){var _ss=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,"src")||Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,"src",true);if(_ss&&_ss.set){var os=_ss.set;Object.defineProperty(e,"src",{get:_ss.get,set:function(v){var t=String(v);if(t.indexOf(location.origin)!==0&&t.indexOf("blob:")!==0&&t.indexOf("data:")!==0){try{var n=new URL(t,base);v=P+encodeURIComponent(n.href)}catch(e){}}return os.call(this,v)}})}if(t.toLowerCase()==="link"){var _hs=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,"href")||Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,"href",true);if(_hs&&_hs.set){var oh=_hs.set;Object.defineProperty(e,"href",{get:_hs.get,set:function(v){var t=String(v);if(t.indexOf(location.origin)!==0&&t.indexOf("blob:")!==0&&t.indexOf("data:")!==0){try{var n=new URL(t,base);v=P+encodeURIComponent(n.href)}catch(e){}}return oh.call(this,v)}})}}if(t.toLowerCase()==="img"){var _is=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src")||Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src",true);if(_is&&_is.set){var oi=_is.set;Object.defineProperty(e,"src",{get:_is.get,set:function(v){var t=String(v);if(t.indexOf(location.origin)!==0&&t.indexOf("blob:")!==0&&t.indexOf("data:")!==0){try{var n=new URL(t,base);v=P+encodeURIComponent(n.href)}catch(e){}}return oi.call(this,v)}})}}return e}}catch(e){};var _di=Image;window.Image=function(w,h){var i=new _di(w,h);var _is2=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src")||Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src",true);if(_is2&&_is2.set){var oi2=_is2.set;Object.defineProperty(i,"src",{get:_is2.get,set:function(v){var t=String(v);if(t.indexOf(location.origin)!==0&&t.indexOf("blob:")!==0&&t.indexOf("data:")!==0){try{var n=new URL(t,base);v=P+encodeURIComponent(n.href)}catch(e){}}return oi2.call(this,v)}})}return i};setInterval(function(){try{if(b(location.href)){location.href=location.href.replace(/\\b(?:404|403|blocked|captcha)\\b.*/,"")}}catch(e){}},50)}();</script>');
            for (var h in resHeaders) { res.setHeader(h, resHeaders[h]); }
            res.send(body);
            if (body.length < 500000) {
                if (cache.size >= MAX_CACHE) { cache.delete(cache.keys().next().value); }
                cache.set(target, { ts: Date.now(), headers: resHeaders, body: body });
            }
        } else if (isCss) {
            var css = await fetchRes.text();
            css = rewriteCss(css, finalUrl);
            for (var h2 in resHeaders) { res.setHeader(h2, resHeaders[h2]); }
            res.setHeader('cache-control', 'public, max-age=300');
            res.send(css);
        } else {
            var buf = await fetchRes.arrayBuffer();
            for (var h3 in resHeaders) { res.setHeader(h3, resHeaders[h3]); }
            if (buf.byteLength < 1000000) {
                res.setHeader('cache-control', 'public, max-age=300');
            }
            res.send(Buffer.from(buf));
        }
    } catch (e) {
        res.status(502).send('proxy error');
    }
});

function enc(s) { return encodeURIComponent(s); }

function rewriteHtml(html, baseUrl) {
    var proxy = '/proxy?url=';
    var base = new URL(baseUrl);

    /* split into script blocks (skip rewriting inside) and non-script blocks */
    var parts = html.split(/(<script[\s>][\s\S]*?<\/script>)/gi);
    for (var i = 0; i < parts.length; i++) {
        if (/^<script/i.test(parts[i])) continue; /* skip script tag content */
        parts[i] = parts[i].replace(/(\s)(src|href|action)\s*=\s*(["'])([^"'\s>]+?)(["'])/gi,
            function (m, sp, attr, q1, url, q2) {
                if (/^(data:|#|javascript:|mailto:|blob:|about:|\/proxy\?url=)/i.test(url)) return m;
                try { return sp + attr + '=' + q1 + proxy + enc(new URL(url, base).href) + q2; }
                catch (_) { return m; }
            }
        );
        parts[i] = parts[i].replace(/srcset\s*=\s*(["'])([^"']+?)(["'])/gi,
            function (m, q1, val, q2) {
                var chunks = val.split(/\s*,\s*/), out = [];
                for (var j = 0; j < chunks.length; j++) {
                    var bits = chunks[j].trim().split(/\s+/), u = bits[0];
                    if (/^(data:|https?:\/\/)/i.test(u)) {
                        try { bits[0] = proxy + enc(new URL(u, base).href); } catch (_) {}
                    }
                    out.push(bits.join(' '));
                }
                return 'srcset=' + q1 + out.join(', ') + q2;
            }
        );
    }
    return parts.join('');
}

function rewriteCss(css, baseUrl) {
    var proxy = '/proxy?url=';
    var base = new URL(baseUrl);
    return css.replace(/url\(\s*(["']?)([^)"']+?)\1\s*\)/gi,
        function (m, q, url) {
            if (/^(data:|#)/i.test(url)) return m;
            try { return 'url("' + proxy + enc(new URL(url, base).href) + '")'; }
            catch (_) { return m; }
        }
    );
}

var server = http.createServer(app);
server.listen(PORT, function () { console.log('CurlyProxy :' + PORT); });
