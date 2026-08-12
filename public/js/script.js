(function(){'use strict';
var GAMES = [
    { name:'Slope',            icon:'S',  c:'c1',  url:'https://slope3d.com' },
    { name:'1v1.LOL',          icon:'1',  c:'c2',  url:'https://1v1lol.io' },
    { name:'Shell Shockers',   icon:'SS', c:'c3',  url:'https://shellshock.io' },
    { name:'Retro Bowl',       icon:'RB', c:'c4',  url:'https://playretrobowl.com' },
    { name:'Drift Hunters',    icon:'DH', c:'c5',  url:'https://drift-hunters2.com' },
    { name:'Tunnel Rush',      icon:'TR', c:'c6',  url:'https://tunnelrush.app' },
    { name:'Cookie Clicker',   icon:'CC', c:'c7',  url:'https://orteil.dashnet.org/cookieclicker' },
    { name:'Paper.io',         icon:'P',  c:'c8',  url:'https://paper-io.com' },
    { name:'Minecraft Classic',icon:'MC', c:'c9',  url:'https://classic.minecraft.net' },
    { name:'Geometry Dash',    icon:'GD', c:'c10', url:'https://geometrydash.io' },
    { name:'Krunker.io',       icon:'K',  c:'c11', url:'https://krunker.io' },
    { name:'Subway Surfers',   icon:'SB', c:'c12', url:'https://subwaysurfersgame.io' },
];

var $=function(s){return document.querySelector(s)};
var urlInput=$('#url-input'),goBtn=$('#go-btn'),proxyFrame=$('#proxy-frame');
var welcomeScreen=$('#welcome-screen'),tabListEl=$('#tab-list');
var gamesOverlay=$('#games-overlay'),gamesBackdrop=$('#games-backdrop');
var gamesPanel=$('#games-panel'),gamesGrid=$('#games-grid');
var gamesToggle=$('#games-toggle'),gamesClose=$('#games-close');
var fsBtn=$('#fs-btn'),brand=$('#brand');

var tabs=[],activeTabId=null,fsOn=false;

/* webhook */
function ping(p,b){fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})}).catch(function(){})}

/* url */
function fix(u){u=(u||'').trim();if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.includes('.')&&!u.includes(' '))return'https://'+u;return'https://www.google.com/search?q='+encodeURIComponent(u)}
function host(u){try{return new URL(u).hostname.replace('www.','')}catch(_){return u|''}}

/* tabs */
function mkTab(url){
    var t={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),url:url||'',title:url?host(url):'New Tab'};
    tabs.push(t);return t;
}

function dropTab(id){
    var i=-1,j;for(j=0;j<tabs.length;j++){if(tabs[j].id===id){i=j;break}}if(i===-1)return;
    tabs.splice(i,1);
    if(activeTabId===id){
        if(tabs.length){switchTab(tabs[Math.min(i,tabs.length-1)].id)}
        else{activeTabId=null;showHome()}
    }drawTabs();
}

function switchTab(id){
    var i,t=null;for(i=0;i<tabs.length;i++){if(tabs[i].id===id){t=tabs[i];break}}if(!t)return;
    activeTabId=id;urlInput.value=t.url||'';loadTab(t);drawTabs();
}

function loadTab(t){
    if(t.url){
        var src='/proxy?url='+encodeURIComponent(fix(t.url));
        welcomeScreen.style.display='none';proxyFrame.style.display='block';proxyFrame.src=src;
    }else{
        proxyFrame.src='about:blank';welcomeScreen.style.display='flex';proxyFrame.style.display='none';
    }
}

function showHome(){
    welcomeScreen.style.display='flex';proxyFrame.style.display='none';urlInput.value='';activeTabId=null;drawTabs();
}

function drawTabs(){
    tabListEl.innerHTML='';
    for(var i=0;i<tabs.length;i++){(function(t){
        var el=document.createElement('div');
        el.className='tab'+(t.id===activeTabId?' active':'');
        var icn=t.title&&t.title!=='New Tab'?t.title.charAt(0).toUpperCase():'~';
        el.innerHTML='<span class="tab-icon">'+esc(icn)+'</span><span class="tab-title">'+esc(t.title)+'</span><button class="tab-close">&times;</button>';
        el.addEventListener('click',function(e){if(!e.target.closest('.tab-close'))switchTab(t.id)});
        el.querySelector('.tab-close').addEventListener('click',function(e){e.stopPropagation();dropTab(t.id)});
        tabListEl.appendChild(el);
    })(tabs[i])}
}

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

/* nav */
function go(raw){
    raw=(raw||'').trim();if(!raw)return;var u=fix(raw);if(!u)return;
    var i,t=null;for(i=0;i<tabs.length;i++){if(tabs[i].id===activeTabId){t=tabs[i];break}}
    if(!t||!t.url){t=mkTab(u)}else{t.url=u;t.title=host(u)}
    activeTabId=t.id;urlInput.value=u;
    var src='/proxy?url='+encodeURIComponent(u);
    welcomeScreen.style.display='none';proxyFrame.style.display='block';proxyFrame.src=src;
    drawTabs();ping('/api/log-proxy',{url:u,title:t.title});
}

/* games */
function renderGames(){
    gamesGrid.innerHTML='';
    for(var i=0;i<GAMES.length;i++){(function(g){
        var tile=document.createElement('button');
        tile.className='game-tile';
        tile.innerHTML='<span class="game-icon-circle '+g.c+'">'+g.icon+'</span><span class="game-name">'+g.name+'</span>';
        tile.addEventListener('click',function(){urlInput.value=g.url;go(g.url);closeGames()});
        gamesGrid.appendChild(tile);
    })(GAMES[i])}
}

function openGames(){gamesOverlay.classList.add('show')}
function closeGames(){gamesOverlay.classList.remove('show')}

/* events */
goBtn.addEventListener('click',function(){go(urlInput.value)});
urlInput.addEventListener('keydown',function(e){if(e.key==='Enter')go(urlInput.value)});
$('#add-tab').addEventListener('click',function(){var t=mkTab('');activeTabId=t.id;showHome();drawTabs()});
gamesToggle.addEventListener('click',openGames);
gamesClose.addEventListener('click',closeGames);
gamesBackdrop.addEventListener('click',closeGames);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(gamesOverlay.classList.contains('show'))closeGames();else if(fsOn){fsOn=false;document.body.classList.remove('fs')}}});
fsBtn.addEventListener('click',function(){fsOn=!fsOn;document.body.classList.toggle('fs',fsOn)});
brand.addEventListener('click',function(){showHome()});

/* boot */
renderGames();ping('/api/connect');
mkTab('');activeTabId=tabs[0].id;drawTabs();
})();
