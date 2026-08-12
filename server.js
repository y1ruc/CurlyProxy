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
        var skip = ['content-encoding','content-length','transfer-encoding','x-frame-options','content-security-policy','x-content-type-options','cross-origin-embedder-policy','cross-origin-opener-policy','cross-origin-resource-policy','permissions-policy'];
        fetchRes.headers.forEach(function (v, k) {
            if (skip.indexOf(k.toLowerCase()) === -1) { resHeaders[k] = v; }
        });

        var isHtml = ct.indexOf('text/html') !== -1;
        var isCss = ct.indexOf('text/css') !== -1;

        if (isHtml || isCss) {
            var body = await fetchRes.text();
            if (isHtml) {
                body = body.replace(/<head[^>]*>/i, '$&<base href="/proxy?url=' + enc(finalUrl) + '">');
                body = rewriteUrls(body, finalUrl);
            }
            if (isCss) {
                body = rewriteCssUrls(body, finalUrl);
            }
            for (var h in resHeaders) { res.setHeader(h, resHeaders[h]); }
            res.setHeader('cache-control', 'public, max-age=30');
            res.send(body);
            if (body.length < 500000) {
                if (cache.size >= MAX_CACHE) { cache.delete(cache.keys().next().value); }
                cache.set(target, { ts: Date.now(), headers: resHeaders, body: body });
            }
        } else {
            var buf = await fetchRes.arrayBuffer();
            for (var h2 in resHeaders) { res.setHeader(h2, resHeaders[h2]); }
            res.send(Buffer.from(buf));
        }
    } catch (e) {
        res.status(502).send('proxy error');
    }
});

function enc(s) { return encodeURIComponent(s); }

function rewriteUrls(html, baseUrl) {
    var base = new URL(baseUrl);
    var proxy = '/proxy?url=';
    html = html.replace(/(\s)(src|href|action|data)=(["'])([^"'\s>]+?)(["'])/gi, function (m, sp, attr, q1, url, q2) {
        if (/^(data:|#|javascript:|mailto:|blob:|about:)/i.test(url)) return m;
        try { return sp + attr + q1 + proxy + enc(new URL(url, base).href) + q2; }
        catch (_) { return m; }
    });
    html = html.replace(/srcset=["']([^"']+)["']/gi, function (m, val) {
        var parts = val.split(/\s*,\s*/), out = [];
        for (var i = 0; i < parts.length; i++) {
            var bits = parts[i].trim().split(/\s+/), u = bits[0];
            if (/^(data:|https?:\/\/)/i.test(u)) {
                try { bits[0] = proxy + enc(new URL(u, base).href); } catch (_) {}
            }
            out.push(bits.join(' '));
        }
        return 'srcset="' + out.join(', ') + '"';
    });
    return html;
}

function rewriteCssUrls(css, baseUrl) {
    var base = new URL(baseUrl), proxy = '/proxy?url=';
    return css.replace(/url\(\s*["']?\s*([^)"'\s][^)"']*?)\s*["']?\s*\)/gi, function (m, url) {
        if (/^(data:|#)/i.test(url)) return m;
        try { return 'url("' + proxy + enc(new URL(url, base).href) + '")'; }
        catch (_) { return m; }
    });
}

var server = http.createServer(app);
server.listen(PORT, function () { console.log('CurlyProxy :' + PORT); });
