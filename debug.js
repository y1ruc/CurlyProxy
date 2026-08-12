var target = process.argv[2];
if (!target) { console.log('Usage: node debug.js <url> [--proxy]'); process.exit(1); }
if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

var useProxy = process.argv[3] === '--proxy';
var url = useProxy ? 'http://localhost:3000/proxy?url=' + encodeURIComponent(target) : target;

console.log('\n=== CurlyProxy Debug ===');
console.log('Target: ' + target);
console.log('Source: ' + (useProxy ? 'proxy' : 'direct') + '\n');

fetch(url, {
    redirect: 'follow',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
}).then(async function (res) {
    var body = await res.text();
    var ct = res.headers.get('content-type') || '';

    console.log('Status: ' + res.status);
    console.log('Content-Type: ' + ct);
    console.log('Final URL: ' + res.url);
    console.log('Body: ' + body.length + ' bytes\n');

    var injections = (body.match(/script.*_lp.*location/gi) || []).length;
    if (injections > 0) console.log('[proxy injection: present]\n');

    console.log('--- Suspicious Patterns ---');
    var patterns = [
        { re: /window\.location\.hostname\s*([!=]=+)\s*["']([^"']+)["']/g, label: 'hostname check' },
        { re: /window\.location\.origin\s*([!=]=+)\s*["']([^"']+)["']/g, label: 'origin check' },
        { re: /(?:location\.href|window\.location)\s*=\s*["']([^"']*\/404[^"']*)["']/gi, label: 'location = /404' },
        { re: /(?:location\.href|window\.location)\s*=\s*["']\/(blocked|captcha|login|signin)[^"']*["']/gi, label: 'location = block page' },
        { re: /location\.replace\s*\(\s*["']([^"']+)["']/gi, label: 'location.replace' },
        { re: /top\.location\s*[!=]/g, label: 'top.location check' },
        { re: /self\s*!==\s*top/g, label: 'self !== top' },
        { re: /frameElement/g, label: 'frameElement' },
    ];
    var found = false;
    for (var i = 0; i < patterns.length; i++) {
        var p = patterns[i];
        var matches = [];
        var m;
        p.re.lastIndex = 0;
        while ((m = p.re.exec(body)) !== null) {
            if (matches.length < 6) matches.push(m[0] + (m[1] ? ' (' + m[1] + ')' : ''));
        }
        if (matches.length > 0) {
            found = true;
            console.log('\n  [' + p.label + '] ' + matches.length + ' hits');
            for (var k = 0; k < matches.length; k++) console.log('    ' + matches[k]);
        }
    }
    if (!found) console.log('  No suspicious patterns found.\n');

    console.log('--- Scripts ---');
    var scripts = body.match(/<script[\s>][^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
    console.log('Total external scripts: ' + scripts.length);
    for (var j = 0; j < Math.min(scripts.length, 15); j++) {
        var src = scripts[j].match(/src=["']([^"']+)["']/);
        if (src) console.log('  ' + src[1]);
    }

    require('fs').writeFileSync('debug_output.html', body);
    console.log('\nSaved: debug_output.html');
}).catch(function (e) {
    console.error('Error: ' + e.message);
});
