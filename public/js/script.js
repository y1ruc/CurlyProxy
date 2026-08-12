(function(){'use strict';
var SLUGS={
    'Slope':'slope','1v1.LOL':'1v1lol','Shell Shockers':'shellshockers',
    'Retro Bowl':'retrobowl','Drift Hunters':'drifthunters','Tunnel Rush':'tunnelrush',
    'Cookie Clicker':'cookieclicker','Paper.io':'paperio','Minecraft Classic':'minecraft',
    'Geometry Dash':'geometrydash','Krunker.io':'krunker','Subway Surfers':'subwaysurfers'
};
var GAMES=[
    {name:'Slope',url:'https://slope3d.com'},
    {name:'1v1.LOL',url:'https://1v1lol.io'},
    {name:'Shell Shockers',url:'https://shellshock.io'},
    {name:'Retro Bowl',url:'https://playretrobowl.com'},
    {name:'Drift Hunters',url:'https://drift-hunters2.com'},
    {name:'Tunnel Rush',url:'https://tunnelrush.app'},
    {name:'Cookie Clicker',url:'https://orteil.dashnet.org/cookieclicker'},
    {name:'Paper.io',url:'https://paper-io.com'},
    {name:'Minecraft Classic',url:'https://classic.minecraft.net'},
    {name:'Geometry Dash',url:'https://geometrydash.io'},
    {name:'Krunker.io',url:'https://krunker.io'},
    {name:'Subway Surfers',url:'https://subwaysurfersgame.io'},
];

var $=function(s){return document.querySelector(s)};
var urlInput=$('#url-input'),goBtn=$('#go-btn'),refreshBtn=$('#refresh-btn');
var proxyFrame=$('#proxy-frame'),welcomeScreen=$('#welcome-screen');
var tabListEl=$('#tab-list'),gamesOverlay=$('#games-overlay');
var gamesBackdrop=$('#games-backdrop'),gamesGrid=$('#games-grid');
var gamesToggle=$('#games-toggle'),gamesClose=$('#games-close');
var fsBtn=$('#fs-btn'),brand=$('#brand');
var tabs=[],activeTabId=null,fsOn=false;

function ping(p,b){fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})}).catch(function(){})}

function fix(u){u=(u||'').trim();if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.includes('.')&&!u.includes(' '))return'https://'+u;return'https://www.google.com/search?q='+encodeURIComponent(u)}
function host(u){try{return new URL(u).hostname.replace('www.','')}catch(_){return u||''}}

/* tabs */
function mkTab(url){var t={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),url:url||'',title:url?host(url):'New Tab'};tabs.push(t);return t}

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
        proxyFrame.src='/proxy?url='+encodeURIComponent(fix(t.url));
        welcomeScreen.style.display='none';proxyFrame.style.display='block';
    }else{
        proxyFrame.src='about:blank';welcomeScreen.style.display='flex';proxyFrame.style.display='none';
    }
}

function showHome(){welcomeScreen.style.display='flex';proxyFrame.style.display='none';urlInput.value='';activeTabId=null;drawTabs()}

function drawTabs(){
    tabListEl.innerHTML='';
    for(var i=0;i<tabs.length;i++){(function(t){
        var el=document.createElement('div');
        el.className='tab'+(t.id===activeTabId?' active':'');
        var l=t.title&&t.title!=='New Tab'?t.title.charAt(0).toUpperCase():'~';
        el.innerHTML='<span class="tab-icon">'+esc(l)+'</span><span class="tab-title">'+esc(t.title)+'</span><button class="tab-close">&times;</button>';
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
    proxyFrame.src='/proxy?url='+encodeURIComponent(u);
    welcomeScreen.style.display='none';proxyFrame.style.display='block';
    drawTabs();ping('/api/log-proxy',{url:u,title:t.title});
}

function refresh(){
    var i,t=null;for(i=0;i<tabs.length;i++){if(tabs[i].id===activeTabId){t=tabs[i];break}}
    if(t&&t.url){proxyFrame.src=proxyFrame.src}
}

/* games */
function renderGames(){
    gamesGrid.innerHTML='';
    for(var i=0;i<GAMES.length;i++){(function(g){
        var tile=document.createElement('button');
        tile.className='game-tile';
        var slug=SLUGS[g.name]||g.name.toLowerCase().replace(/\s+/g,'');
        tile.innerHTML='<span class="game-icon"><img src="/gicons/'+slug+'.svg" alt=""></span><span class="game-name">'+g.name+'</span>';
        tile.addEventListener('click',function(){urlInput.value=g.url;go(g.url);closeGames()});
        gamesGrid.appendChild(tile);
    })(GAMES[i])}
}

function openGames(){gamesOverlay.classList.add('show')}
function closeGames(){gamesOverlay.classList.remove('show')}

/* events */
goBtn.addEventListener('click',function(){go(urlInput.value)});
urlInput.addEventListener('keydown',function(e){if(e.key==='Enter')go(urlInput.value)});
refreshBtn.addEventListener('click',refresh);
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
