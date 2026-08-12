(function(){'use strict';

var MASKS=[
    {name:'Google Classroom',icon:'https://ssl.gstatic.com/classroom/favicon.png',title:'Home'},
    {name:'Google Drive',icon:'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',title:'My Drive - Google Drive'},
    {name:'Google Docs',icon:'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',title:'Google Docs'},
    {name:'Google Slides',icon:'https://ssl.gstatic.com/docs/presentations/images/favicon5.ico',title:'Google Slides'},
    {name:'Khan Academy',icon:'https://cdn.kastatic.org/images/favicon.ico',title:'Khan Academy'},
    {name:'Desmos',icon:'https://www.desmos.com/favicon.ico',title:'Desmos | Graphing Calculator'},
    {name:'Quizlet',icon:'https://quizlet.com/favicon.ico',title:'Quizlet'},
    {name:'EdPuzzle',icon:'https://edpuzzle.com/favicon.ico',title:'Edpuzzle'},
    {name:'Clever',icon:'https://clever.com/favicon.ico',title:'Clever | Portal'},
    {name:'Schoology',icon:'https://www.schoology.com/favicon.ico',title:'Schoology'},
    {name:'Canvas',icon:'https://www.instructure.com/favicon.ico',title:'Canvas'},
    {name:'Nearpod',icon:'https://nearpod.com/favicon.ico',title:'Nearpod'},
];

var GAMES=[];
var ORIGINAL_GAME_SLUGS={
    'slope':'slope','1v1lol':'1v1lol','shellshockers':'shellshockers',
    'retrobowl':'retrobowl','drifthunters':'drifthunters','tunnelrush':'tunnelrush',
    'cookieclicker':'cookieclicker','paperio':'paperio','minecraft':'minecraft',
    'geometrydash':'geometrydash','krunker':'krunker','subwaysurfers':'subwaysurfers'
};

var $=function(s){return document.querySelector(s)};
var proxyFrame=$('#proxy-frame'),welcome=$('#welcome-screen');
var urlInput=$('#url-input'),goBtn=$('#go-btn'),tabListEl=$('#tab-list');
var gamesOverlay=$('#games-overlay'),gamesBackdrop=$('#games-backdrop'),gamesGrid=$('#games-grid');
var socialsOverlay=$('#socials-overlay'),socialsBackdrop=$('#socials-backdrop'),socialsGrid=$('#socials-grid');
var maskOverlay=$('#mask-overlay'),maskGrid=$('#mask-grid');
var fullscreenBtn=$('#fullscreen-btn');

var tabs=[],activeTabId=null,fsOn=false;

function applyCloak(m){
    document.getElementById('page-title').textContent=m.title;
    document.getElementById('page-favicon').href=m.icon;
    document.getElementById('cloak-label').textContent=m.name;
    try{localStorage.setItem('curly_cloak',JSON.stringify(m))}catch(_){}
}

function loadCloak(){
    try{var raw=localStorage.getItem('curly_cloak');if(raw)return JSON.parse(raw)}catch(_){}
    return null;
}

function renderMaskSelector(){
    maskGrid.innerHTML='';
    for(var i=0;i<MASKS.length;i++){(function(m){
        var btn=document.createElement('button');
        btn.className='mask-tile';
        btn.innerHTML='<img src="'+m.icon+'" alt="" onerror="this.style.display=\'none\'"><span>'+m.name+'</span>';
        btn.addEventListener('click',function(){applyCloak(m);maskOverlay.classList.add('hidden')});
        maskGrid.appendChild(btn);
    })(MASKS[i])}
}

function fix(u){u=(u||'').trim();if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.includes('.')&&!u.includes(' '))return'https://'+u;return'https://www.google.com/search?q='+encodeURIComponent(u)}
function host(u){try{return new URL(u).hostname.replace('www.','')}catch(_){return u||''}}

function mkTab(url){var t={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),url:url||'',title:url?host(url):'New Tab'};tabs.push(t);return t}
function dropTab(id){
    var i=-1,j;for(j=0;j<tabs.length;j++){if(tabs[j].id===id){i=j;break}}if(i===-1)return;
    tabs.splice(i,1);
    if(activeTabId===id){if(tabs.length){switchTab(tabs[Math.min(i,tabs.length-1)].id)}else{activeTabId=null;showHome()}}
    drawTabs();
}
function switchTab(id){var i,t=null;for(i=0;i<tabs.length;i++){if(tabs[i].id===id){t=tabs[i];break}}if(!t)return;activeTabId=id;urlInput.value=t.url||'';loadTab(t);drawTabs()}
function loadTab(t){if(t.url){proxyFrame.src='/proxy?url='+encodeURIComponent(fix(t.url));welcome.style.display='none';proxyFrame.style.display='block'}else{proxyFrame.src='about:blank';welcome.style.display='flex';proxyFrame.style.display='none'}}
function showHome(){welcome.style.display='flex';proxyFrame.style.display='none';urlInput.value='';activeTabId=null;drawTabs()}
function drawTabs(){
    tabListEl.innerHTML='';
    for(var i=0;i<tabs.length;i++){(function(t){
        var el=document.createElement('div');
        el.className='tab'+(t.id===activeTabId?' active':'');
        el.innerHTML='<span class="tab-title">'+esc(t.title)+'</span><button class="tab-close">&times;</button>';
        el.addEventListener('click',function(e){if(!e.target.closest('.tab-close'))switchTab(t.id)});
        el.querySelector('.tab-close').addEventListener('click',function(e){e.stopPropagation();dropTab(t.id)});
        tabListEl.appendChild(el);
    })(tabs[i])}
}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function go(raw){
    raw=(raw||'').trim();if(!raw)return;var u=fix(raw);if(!u)return;
    var i,t=null;for(i=0;i<tabs.length;i++){if(tabs[i].id===activeTabId){t=tabs[i];break}}
    if(!t||!t.url){t=mkTab(u)}else{t.url=u;t.title=host(u)}
    activeTabId=t.id;urlInput.value=u;
    proxyFrame.src='/proxy?url='+encodeURIComponent(u);
    welcome.style.display='none';proxyFrame.style.display='block';
    drawTabs();
}

function renderGames(){
    gamesGrid.innerHTML='';
    if(!GAMES.length){gamesGrid.innerHTML='<div class="game-name" style="padding:10px">Loading games...</div>';return}
    for(var i=0;i<GAMES.length;i++){(function(g){
        var tile=document.createElement('button');
        tile.className='game-tile';
        var slug=g.slug;
        var hasIcon=ORIGINAL_GAME_SLUGS[slug];
        var icon=hasIcon?'<img src="/gicons/'+slug+'.svg" alt="">':'<span style="font-weight:700;color:#8b5cf6">'+g.name.charAt(0).toUpperCase()+'</span>';
        tile.innerHTML='<span class="game-icon">'+icon+'</span><span class="game-name">'+g.name+'</span>';
        tile.addEventListener('click',function(){openGame(slug)});
        gamesGrid.appendChild(tile);
    })(GAMES[i])}
}

function loadGames(){
    fetch('/api/games').then(function(r){return r.json()}).then(function(list){
        GAMES=list;renderGames();
    }).catch(function(){renderGames()});
}

function openGame(slug){
    var i,t=null;for(i=0;i<tabs.length;i++){if(tabs[i].id===activeTabId){t=tabs[i];break}}
    if(!t||!t.url){t=mkTab('/game/'+slug)}else{t.url='/game/'+slug;t.title=slug}
    activeTabId=t.id;
    urlInput.value='';
    proxyFrame.src='/game/'+slug;
    welcome.style.display='none';proxyFrame.style.display='block';
    drawTabs();closeGames();
}

function openGames(){gamesOverlay.classList.add('show')}
function closeGames(){gamesOverlay.classList.remove('show')}

var SOCIALS=[
    {name:'TikTok',url:'https://tiktok.com'},
    {name:'YouTube',url:'https://youtube.com'},
    {name:'Instagram',url:'https://instagram.com'},
    {name:'X / Twitter',url:'https://x.com'},
    {name:'Reddit',url:'https://reddit.com'},
    {name:'Discord',url:'https://discord.com'},
    {name:'Twitch',url:'https://twitch.tv'},
    {name:'Spotify',url:'https://open.spotify.com'},
    {name:'Snapchat',url:'https://snapchat.com'},
    {name:'Pinterest',url:'https://pinterest.com'},
    {name:'Tumblr',url:'https://tumblr.com'},
    {name:'WhatsApp',url:'https://web.whatsapp.com'},
];

function renderSocials(){
    socialsGrid.innerHTML='';
    for(var i=0;i<SOCIALS.length;i++){(function(s){
        var tile=document.createElement('button');
        tile.className='social-tile';
        tile.innerHTML='<span class="game-name">'+s.name+'</span>';
        tile.addEventListener('click',function(){urlInput.value=s.url;go(s.url);closeSocials()});
        socialsGrid.appendChild(tile);
    })(SOCIALS[i])}
}

function openSocials(){socialsOverlay.classList.add('show')}
function closeSocials(){socialsOverlay.classList.remove('show')}

goBtn.addEventListener('click',function(){go(urlInput.value)});
urlInput.addEventListener('keydown',function(e){if(e.key==='Enter')go(urlInput.value)});
$('#nav-back').addEventListener('click',function(){try{proxyFrame.contentWindow.history.back()}catch(_){}});
$('#nav-fwd').addEventListener('click',function(){try{proxyFrame.contentWindow.history.forward()}catch(_){}});
$('#nav-refresh').addEventListener('click',function(){if(proxyFrame.src&&proxyFrame.src!=='about:blank'){proxyFrame.src=proxyFrame.src}});
$('#add-tab').addEventListener('click',function(){var t=mkTab('');activeTabId=t.id;showHome();drawTabs()});
$('#games-toggle').addEventListener('click',function(){window.location.href='/games'});
$('#games-close').addEventListener('click',closeGames);
gamesBackdrop.addEventListener('click',closeGames);
$('#socials-toggle').addEventListener('click',openSocials);
$('#socials-close').addEventListener('click',closeSocials);
socialsBackdrop.addEventListener('click',closeSocials);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(gamesOverlay.classList.contains('show'))closeGames();else if(socialsOverlay.classList.contains('show'))closeSocials();else if(fsOn){fsOn=false;document.body.classList.remove('fs')}}});
fullscreenBtn.addEventListener('click',function(){fsOn=!fsOn;document.body.classList.toggle('fs',fsOn)});
$('#cloak-btn').addEventListener('click',function(){maskOverlay.classList.remove('hidden')});

function boot(){
    renderMaskSelector();
    loadGames();
    renderSocials();
    var saved=loadCloak();
    if(saved){applyCloak(saved);maskOverlay.classList.add('hidden')}
    mkTab('');activeTabId=tabs[0].id;drawTabs();
}

boot();
})();
