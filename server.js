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

const GAMES = {
    'slope':           { name: 'Slope',            url: 'https://slopegame.io' },
    '1v1lol':          { name: '1v1.LOL',          url: 'https://1v1lol.io' },
    'shellshockers':   { name: 'Shell Shockers',   url: 'https://shellshock.io' },
    'retrobowl':       { name: 'Retro Bowl',       url: 'https://playretrobowl.com' },
    'drifthunters':    { name: 'Drift Hunters',    url: 'https://drift-hunters.io' },
    'tunnelrush':      { name: 'Tunnel Rush',      url: 'https://tunnelrush.com' },
    'cookieclicker':   { name: 'Cookie Clicker',   url: 'https://orteil.dashnet.org/cookieclicker' },
    'paperio':         { name: 'Paper.io',         url: 'https://paper-io.com' },
    'minecraft':       { name: 'Minecraft Classic',url: 'https://classic.minecraft.net' },
    'geometrydash':    { name: 'Geometry Dash',    url: 'https://geometrydash.io' },
    'krunker':         { name: 'Krunker.io',       url: 'https://krunker.io' },
    'subwaysurfers':   { name: 'Subway Surfers',   url: 'https://subwaysurfersgame.io' },
    'steal-brainrots': { name: 'Steal Brainrots',  url: 'https://cloud.onlinegames.io/games/2026/unity/steal-brainrots-multiplayer/game.html' },
    'gta-simulator':   { name: 'GTA Simulator',    url: 'https://www.onlinegames.io/games/2023/unity2/gta-simulator/index.html' },
    'stack-fire-ball': { name: 'Stack Fire Ball',  url: 'https://www.onlinegames.io/games/2021/unity/stack-fire-ball/index.html' },
    'stickman-gta':    { name: 'Stickman GTA City',url: 'https://cloud.onlinegames.io/games/2024/unity3/stickman-gta-city/index-og.html' },
    'flight-sim':      { name: 'Flight Simulator', url: 'https://cloud.onlinegames.io/games/2023/unity2/real-flight-simulator/index.html' },
    'drift-king':      { name: 'Drift King',       url: 'https://www.onlinegames.io/games/2024/unity/drift-king/index.html' },
    'masked-sf':       { name: 'Masked SF',        url: 'https://www.onlinegames.io/games/2022/unity2/masked-special-forces/index.html' },
    'cs-online':       { name: 'CS Online',        url: 'https://www.onlinegames.io/games/2023/unity2/cs-online/index.html' },
    'dublix':          { name: 'Dublix',           url: 'https://cloud.onlinegames.io/games/2025/unity4/dublix/game-og.html' },
    'stickman-parkour':{ name: 'Stickman Parkour', url: 'https://cloud.onlinegames.io/games/2024/construct/219/stickman-parkour/index-og.html' },
    'snaker-io':       { name: 'Snaker.io',        url: 'https://cloud.onlinegames.io/games/2026/more/snaker-io/game.html' },
    'cube-worlds':     { name: 'Cube Worlds',      url: 'https://cloud.onlinegames.io/games/2025/html/cube-worlds/index-og.html' },
    'cubecraft':       { name: 'CubeCraft Survival',url: 'https://cloud.onlinegames.io/games/2025/unity4/cubecraft-survival/index-og.html' },
    'get-on-top':      { name: 'Get On Top',       url: 'https://www.onlinegames.io/games/2024/code/6/get-on-top/index.html' },
    'drift-hunters-pro':{ name: 'Drift Hunters Pro',url: 'https://www.onlinegames.io/games/2023/unity/drift-hunters-pro/index.html' },
    'super-car':       { name: 'Super Car Driving',url: 'https://cloud.onlinegames.io/games/2024/unity2/super-car-driving/index-og.html' },
    'edys-car':        { name: 'Edys Car Sim',     url: 'https://www.onlinegames.io/games/2022/unity/edys-car-simulator/index.html' },
    'warstrike':       { name: 'WarStrike',        url: 'https://cloud.onlinegames.io/games/2024/unity3/warstrike/index-og.html' },
    'madalin-stunt':   { name: 'Madalin Stunt Cars',url: 'https://www.onlinegames.io/games/2023/unity/madalin-stunt-cars-pro/index.html' },
    'armedforces':     { name: 'ArmedForces.io',   url: 'https://www.onlinegames.io/games/2021/unity3/armedforces-io/index.html' },
    '99-nights':       { name: '99 Nights Forest', url: 'https://cloud.onlinegames.io/games/2026/unity/99-nights-in-the-forest-survival/game.html' },
    'escape-car':      { name: 'Escape Car',       url: 'https://cloud.onlinegames.io/games/2025/unity2/escape-car/index-og.html' },
    'strike-force':    { name: 'Crazy Strike Force',url: 'https://www.onlinegames.io/games/2023/unity/crazy-strike-force/index.html' },
    'cat-sim':         { name: 'Cat Simulator',    url: 'https://www.onlinegames.io/games/2022/unity4/cat-simulator/index.html' },
    'fast-food-rush':  { name: 'Fast Food Rush',   url: 'https://cloud.onlinegames.io/games/2025/unity/fast-food-rush/index-og.html' },
    'golf-bit':        { name: 'Golf Bit',         url: 'https://cloud.onlinegames.io/games/2026/construct/328/golf-bit/game.html' },
    'pixelmon-town':   { name: 'Pixelmon Town',    url: 'https://cloud.onlinegames.io/games/2025/html/pixelmon-town/game.html' },
    'legendary-sniper':{ name: 'Legendary Sniper', url: 'https://www.onlinegames.io/games/2021/unity3/legendary-sniper/index.html' },
    'tank-arena':      { name: 'Tank Arena',       url: 'https://cloud.onlinegames.io/games/2025/construct/293/tank-arena/index-og.html' },
    '2048':            { name: '2048',             url: 'https://cloud.onlinegames.io/games/2025/html/2048/index.html' },
    'burnout-city':    { name: 'Burnout City',     url: 'https://cloud.onlinegames.io/games/2024/unity/burnout-city/index-og.html' },
    'block-blast':     { name: 'Block Blast',      url: 'https://cloud.onlinegames.io/games/2024/unity3/block-blast/index-og.html' },
    'stickman-destruct':{ name: 'Stickman Destruction',url: 'https://www.onlinegames.io/games/2021/unity3/stickman-destruction/index.html' },
    'highway-racer':   { name: 'Highway Racer Pro',url: 'https://www.onlinegames.io/games/2024/unity/highway-racer-pro/index.html' },
    'fast-food-mgr':   { name: 'Fast Food Manager',url: 'https://cloud.onlinegames.io/games/2025/unity4/fast-food-manager/index-og.html' },
    'mini-cars':       { name: 'Mini Cars Racing', url: 'https://cloud.onlinegames.io/games/2021/unity/mini-cars-racing/index-og.html' },
    'police-chase':    { name: 'Police Chase',     url: 'https://www.onlinegames.io/games/2021/3/police-chase-drifter/index.html' },
    '8-ball-pool':     { name: '8 Ball Pool',      url: 'https://www.onlinegames.io/games/2022/unity3/8-ball-pool-billiard/index.html' },
    'fps-strike':      { name: 'FPS Strike',       url: 'https://cloud.onlinegames.io/games/2024/unity2/fps-strike/index-og.html' },
    'basket-hoop':     { name: 'Basket Hoop',      url: 'https://cloud.onlinegames.io/games/2024/construct/311/basket-hoop/index-og.html' },
    'army-combat':     { name: 'Army Combat',      url: 'https://www.onlinegames.io/games/2021/unity/army-combat/index.html' },
    'velocity-rush':   { name: 'Velocity Rush',    url: 'https://cloud.onlinegames.io/games/2026/unity/velocity-rush/game.html' },
    'troll-level':     { name: 'Troll Level',      url: 'https://cloud.onlinegames.io/games/2024/unity2/troll-level/index-og.html' },
    'taxi-sim':        { name: 'Taxi Simulator',   url: 'https://www.onlinegames.io/games/2022/unity/taxi-simulator/index.html' },
    'fire-and-water':  { name: 'Fire and Water',   url: 'https://www.onlinegames.io/games/2023/construct/179/fire-and-water/index.html' },
    'geometry-vector': { name: 'Geometry Vector',  url: 'https://cloud.onlinegames.io/games/2026/construct/329/geometry-vector/game.html' },
    'poop-clicker':    { name: 'Poop Clicker',     url: 'https://www.onlinegames.io/games/2024/construct/292/poop-clicker/index.html' },
    'survival-island': { name: 'Survival Island',  url: 'https://cloud.onlinegames.io/games/2024/unity2/survival-island/index-og.html' },
    'drift-rider':     { name: 'Drift Rider',      url: 'https://www.onlinegames.io/games/2023/unity3/drift-rider/index.html' },
    'backflip':        { name: 'Backflip Challenge',url: 'https://cloud.onlinegames.io/games/2026/unity/backflip-challenge/game.html' },
    'crazy-drifter':   { name: 'Crazy Drifter',    url: 'https://www.onlinegames.io/games/2022/unity3/crazy-drifter/index.html' },
    'kick-dummy':      { name: 'Kick The Dummy',   url: 'https://www.onlinegames.io/games/2022/construct/153/kick-the-dummy/index.html' },
    'car-football':    { name: 'Car Football',     url: 'https://www.onlinegames.io/games/2023/construct/198/car-football/index.html' },
    'airplane-racer':  { name: 'Airplane Racer',   url: 'https://www.onlinegames.io/games/2022/unity/airplane-racer/index.html' },
    'solitaire':       { name: 'Solitaire',        url: 'https://cloud.onlinegames.io/games/2025/html/solitaire/index-og.html' },
    'urban-sniper':    { name: 'Urban Sniper',     url: 'https://www.onlinegames.io/games/2022/unity2/urban-sniper/index.html' },
    'cattle-3d':       { name: 'Crazy Cattle 3D',  url: 'https://cloud.onlinegames.io/games/2025/unity3/crazy-cattle-3d/index-og.html' },
    'bandits-pvp':     { name: 'Bandits PvP',      url: 'https://www.onlinegames.io/games/2021/unity2/bandits-multiplayer-pvp/index.html' },
    'zombie-survival': { name: 'Zombie Survival',  url: 'https://www.onlinegames.io/games/2021/unity3/masked-forces-zombie-survival/index.html' },
    'moto-traffic':    { name: 'Motorbike Traffic',url: 'https://www.onlinegames.io/games/2021/unity/motorbike-traffic/index.html' },
    'super-mini':      { name: 'Super Mini Racing',url: 'https://www.onlinegames.io/games/2022/unity4/super-mini-racing/index.html' },
    'poly-racing':     { name: 'Poly Racing Cars', url: 'https://cloud.onlinegames.io/games/2022/unity3/poly-racing-cars/index-og.html' },
    'rome-sim':        { name: 'Rome Simulator',   url: 'https://www.onlinegames.io/games/2021/unity/rome-simulator/index.html' },
    'crazy-car-arena': { name: 'Crazy Car Arena',  url: 'https://www.onlinegames.io/games/2022/unity3/crazy-car-arena/index.html' },
    'hero-rush-td':    { name: 'Hero Rush TD',     url: 'https://www.onlinegames.io/games/2023/unity/hero-rush-tower-defense/index.html' },
    'police-traffic':  { name: 'Police Traffic',   url: 'https://www.onlinegames.io/games/2021/unity/police-traffic/index.html' },
    'piece-match':     { name: 'Piece Match Puzzle', url: 'https://www.y8.com/embed/piece_match_puzzle' },
    'color-ball-sort': { name: 'Color Ball Sort',  url: 'https://www.y8.com/embed/color_ball_sort' },
    'paint-swipe':     { name: 'Paint Swipe 3D',   url: 'https://www.y8.com/embed/paint_swipe_3d' },
    'bubble-pop':      { name: 'Bubble Pop Battle',url: 'https://www.y8.com/embed/bubble_challenge_pop_battle' },
    'spin-shot':       { name: 'Spin Shot Master', url: 'https://www.y8.com/embed/spin_shot_master' },
    'moto-flip':       { name: 'Moto Flip Race',   url: 'https://www.y8.com/embed/moto_flip_race' },
    'pin-spin':        { name: 'Pin Spin Master',  url: 'https://www.y8.com/embed/pin_spin_master_puzzle' },
    'circle-jump':     { name: 'Circle Jump',      url: 'https://www.y8.com/embed/circle_jump' },
    'cut-tower':       { name: 'Cut Tower 3D',     url: 'https://www.y8.com/embed/cut_tower_3d' },
    'slap-battle':     { name: 'Slap Battle',      url: 'https://www.y8.com/embed/slap_battle' },
    'perfect-shot':    { name: 'Perfect Shot',     url: 'https://www.y8.com/embed/perfect_shot' },
    'color-war':       { name: 'Color War Rainbow',url: 'https://www.y8.com/embed/color_war_rainbow' },
    'cannon-shot':     { name: 'Cannon Shot 3D',   url: 'https://www.y8.com/embed/cannon_shot_3d' },
    'ball-connect':    { name: 'Ball Connect Puzzle',url: 'https://www.y8.com/embed/ball_connect_puzzle' },
    'turn-and-hit':    { name: 'Turn and Hit',     url: 'https://www.y8.com/embed/turn_and_hit' },
    'block-link':      { name: 'Block Link Puzzle',url: 'https://www.y8.com/embed/block_link_puzzle_3d' },
    'draw-logic':      { name: 'Draw Logic Puzzle',url: 'https://www.y8.com/embed/draw_logic_puzzle' },
    'snake-puzzle':    { name: 'Snake Puzzle 3D',  url: 'https://www.y8.com/embed/snake_puzzle_3d' },
    'pull-the-ring':   { name: 'Pull the Ring 3D', url: 'https://www.y8.com/embed/pull_the_ring_3d' },
    'piano-tiles':     { name: 'Piano Tiles Beat', url: 'https://www.y8.com/embed/piano_tiles_beat' },
    'monopoly':        { name: 'Monopoly',         url: 'https://www.y8.com/embed/monopoly' },
    'ball-rise':       { name: 'Ball Rise',        url: 'https://www.y8.com/embed/ball_rise' },
    'shape-race':      { name: 'Shape Race',       url: 'https://www.y8.com/embed/shape_race' },
    'digit-shooter':   { name: 'Digit Shooter',    url: 'https://www.y8.com/embed/digit_shooter' },
    'hiding-master':   { name: 'Hiding Master',    url: 'https://www.y8.com/embed/hiding_master' },
    'puppy-match':     { name: 'Puppy Match',      url: 'https://www.y8.com/embed/puppy_match' },
    'color-hyper':     { name: 'Color Hyper Battle',url: 'https://www.y8.com/embed/color_hyper_battle_3d' },
    'slice-it-up':     { name: 'Slice It Up',      url: 'https://www.y8.com/embed/slice_it_up' },
    'color-shooter':   { name: 'Color Shooter',    url: 'https://www.y8.com/embed/color_shooter' },
    'stealth-assassin':{ name: 'Stealth Assassin', url: 'https://www.y8.com/embed/stealth_assassin' },
    'wall-jump':       { name: 'Wall Jump',        url: 'https://www.y8.com/embed/wall_jump' },
    'roll-master':     { name: 'Roll Master 3D',   url: 'https://www.y8.com/embed/roll_master_3d' },
    'spikes':          { name: 'Spikes',           url: 'https://www.y8.com/embed/spikes' },
    'zombie-fps':      { name: 'Zombie FPS Survival',url: 'https://www.y8.com/embed/zombie_fps_survival_3d' },
    'shape-fit':       { name: 'Shape Fit',        url: 'https://www.y8.com/embed/shape_fit' },
    'slices':          { name: 'Slices',           url: 'https://www.y8.com/embed/slices' },
    'crowd-hunt':      { name: 'Crowd Hunt 3D',    url: 'https://www.y8.com/embed/crowd_hunt_3d' },
    'run-clash':       { name: 'Run and Clash',    url: 'https://www.y8.com/embed/run_clash' },
    'spiky-circle':    { name: 'Spiky Circle',     url: 'https://www.y8.com/embed/spiky_circle' },
};

const GAME_IMAGES = {
    'steal-brainrots': 'https://www.onlinegames.io/media/posts/1340/responsive/steal-brainrots-multiplayer-2-xs.webp',
    'gta-simulator': 'https://www.onlinegames.io/media/posts/416/responsive/GTA-Simulator-xs.jpg',
    'stack-fire-ball': 'https://www.onlinegames.io/media/posts/184/responsive/Stack-Fire-Ball-Game-xs.jpg',
    'stickman-gta': 'https://www.onlinegames.io/media/posts/900/responsive/stickman-gta-city-free-xs.jpg',
    'flight-sim': 'https://www.onlinegames.io/media/posts/342/responsive/Real-Flight-Simulator-2-xs.jpg',
    'drift-king': 'https://www.onlinegames.io/media/posts/729/responsive/Drift-King-xs.jpg',
    'masked-sf': 'https://www.onlinegames.io/media/posts/310/responsive/Masked-Special-Forces-FPS-xs.jpg',
    'cs-online': 'https://www.onlinegames.io/media/posts/434/responsive/CS-Online-xs.jpg',
    'dublix': 'https://www.onlinegames.io/media/posts/1126/responsive/dublix-xs.webp',
    'stickman-parkour': 'https://www.onlinegames.io/media/posts/871/responsive/stickman-parkour-OG-xs.jpg',
    'snaker-io': 'https://www.onlinegames.io/media/posts/1261/responsive/snaker-io-xs.webp',
    'cube-worlds': 'https://www.onlinegames.io/media/posts/986/responsive/Cube-Worlds-xs.jpg',
    'cubecraft': 'https://www.onlinegames.io/media/posts/1113/responsive/cubecraft-survival-xs.webp',
    'get-on-top': 'https://www.onlinegames.io/media/posts/697/responsive/Get-on-Top-xs.jpg',
    'drift-hunters-pro': 'https://www.onlinegames.io/media/posts/397/responsive/Drift-Hunters-Pro-xs.jpg',
    'super-car': 'https://www.onlinegames.io/media/posts/854/responsive/supercardriving-2-xs.jpg',
    'edys-car': 'https://www.onlinegames.io/media/posts/238/responsive/Edys-Car-Simulator-Online-xs.jpg',
    'warstrike': 'https://www.onlinegames.io/media/posts/870/responsive/WarStrike-Online-xs.jpg',
    'madalin-stunt': 'https://www.onlinegames.io/media/posts/401/responsive/Madalin-Stunt-Cars-Pro-Game-xs.jpg',
    'armedforces': 'https://www.onlinegames.io/media/posts/234/responsive/Armed-Forces-io-xs.jpg',
    '99-nights': 'https://www.onlinegames.io/media/posts/1190/responsive/99-nights-in-the-forest-xs.webp',
    'escape-car': 'https://www.onlinegames.io/media/posts/1000/responsive/Escape-Car-xs.jpg',
    'strike-force': 'https://www.onlinegames.io/media/posts/366/responsive/Crazy-Strike-Force-xs.jpg',
    'cat-sim': 'https://www.onlinegames.io/media/posts/330/responsive/Cat-Simulator-Online-xs.jpg',
    'fast-food-rush': 'https://www.onlinegames.io/media/posts/979/responsive/fast-food-rush-xs.jpg',
    'golf-bit': 'https://www.onlinegames.io/media/posts/1289/responsive/golf-bit-xs.webp',
    'pixelmon-town': 'https://www.onlinegames.io/media/posts/1214/responsive/pixelmon-town-xs.webp',
    'legendary-sniper': 'https://www.onlinegames.io/media/posts/596/responsive/Legendary-Sniper-xs.jpg',
    'tank-arena': 'https://www.onlinegames.io/media/posts/956/responsive/Tank-Arena-Online-xs.jpg',
    '2048': 'https://www.onlinegames.io/media/posts/916/responsive/2048-xs.jpg',
    'burnout-city': 'https://www.onlinegames.io/media/posts/861/responsive/burnoutcity-xs.jpg',
    'block-blast': 'https://www.onlinegames.io/media/posts/876/responsive/block-blast-xs.jpg',
    'stickman-destruct': 'https://www.onlinegames.io/media/posts/233/responsive/Stickman-Destruction-xs.jpg',
    'highway-racer': 'https://www.onlinegames.io/media/posts/822/responsive/Highway-Racer-Pro-xs.jpg',
    'fast-food-mgr': 'https://www.onlinegames.io/media/posts/1114/responsive/fast-food-manager-xs.webp',
    'mini-cars': 'https://www.onlinegames.io/media/posts/1010/responsive/Mini-Cars-Racing-xs.jpg',
    'police-chase': 'https://www.onlinegames.io/media/posts/155/responsive/Police-Chase-Drifter-Online-xs.jpg',
    '8-ball-pool': 'https://www.onlinegames.io/media/posts/442/responsive/8-Ball-Pool-Billiard-xs.jpg',
    'fps-strike': 'https://www.onlinegames.io/media/posts/902/responsive/fps-strike-online-xs.jpg',
    'basket-hoop': 'https://www.onlinegames.io/media/posts/843/responsive/Basket-Hoop-xs.jpg',
    'army-combat': 'https://www.onlinegames.io/media/posts/664/responsive/Army-Combat-xs.jpg',
    'velocity-rush': 'https://www.onlinegames.io/media/posts/1265/responsive/velocity-rush-xs.webp',
    'troll-level': 'https://www.onlinegames.io/media/posts/857/responsive/troll-level-online-xs.jpg',
    'taxi-sim': 'https://www.onlinegames.io/media/posts/465/responsive/Taxi-Simulator-xs.jpg',
    'fire-and-water': 'https://www.onlinegames.io/media/posts/469/responsive/Fire-and-Water-xs.jpg',
    'geometry-vector': 'https://www.onlinegames.io/media/posts/1246/responsive/geometry-vector-xs.webp',
    'poop-clicker': 'https://www.onlinegames.io/media/posts/742/responsive/Poop-Clicker-xs.jpg',
    'survival-island': 'https://www.onlinegames.io/media/posts/970/responsive/Survival-Island-xs.jpg',
    'drift-rider': 'https://www.onlinegames.io/media/posts/553/responsive/Drift-Rider-xs.jpg',
    'backflip': 'https://www.onlinegames.io/media/posts/1203/responsive/backflip-challenge-xs.webp',
    'crazy-drifter': 'https://www.onlinegames.io/media/posts/314/responsive/Crazy-Drifter-xs.jpg',
    'kick-dummy': 'https://www.onlinegames.io/media/posts/414/responsive/Kick-The-Dummy-Game-xs.jpg',
    'car-football': 'https://www.onlinegames.io/media/posts/405/responsive/Car-Football-xs.jpg',
    'airplane-racer': 'https://www.onlinegames.io/media/posts/268/responsive/Airplane-Racer-xs.jpg',
    'solitaire': 'https://www.onlinegames.io/media/posts/1007/responsive/solitaire-xs.jpg',
    'urban-sniper': 'https://www.onlinegames.io/media/posts/322/responsive/Urban-Sniper-Game-xs.jpg',
    'cattle-3d': 'https://www.onlinegames.io/media/posts/1004/responsive/Crazy-Cattle-3D-xs.jpg',
    'bandits-pvp': 'https://www.onlinegames.io/media/posts/487/responsive/Bandits-Multiplayer-PvP-xs.jpg',
    'zombie-survival': 'https://www.onlinegames.io/media/posts/225/responsive/Masked-Forces-Zombie-Survival-Online-xs.jpg',
    'moto-traffic': 'https://www.onlinegames.io/media/posts/419/responsive/Motorbike-Traffic-Game-xs.jpg',
    'super-mini': 'https://www.onlinegames.io/media/posts/819/responsive/Super-Mini-Racing-xs.jpg',
    'poly-racing': 'https://www.onlinegames.io/media/posts/835/responsive/Poly-racing-cars-image-xs.jpg',
    'rome-sim': 'https://www.onlinegames.io/media/posts/634/responsive/Rome-Simulator-2-xs.jpg',
    'crazy-car-arena': 'https://www.onlinegames.io/media/posts/317/responsive/Crazy-Car-Arena-Game-xs.jpg',
    'hero-rush-td': 'https://www.onlinegames.io/media/posts/491/responsive/Hero-Rush-Tower-Defense-Play-xs.jpg',
    'police-traffic': 'https://www.onlinegames.io/media/posts/187/responsive/Pollice-Traffic-xs.jpg',
};

app.get('/api/games', function (req, res) {
    var list = [];
    for (var k in GAMES) { list.push({ slug: k, name: GAMES[k].name, img: GAME_IMAGES[k] || '' }); }
    res.json(list);
});

app.get('/games', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CurlyProxy - Games</title><style>' + GAMES_CSS + '</style></head><body><div class="top"><button class="back" onclick="location.href=\'/\'"><svg viewBox="0 0 24 24" width="18" height="18"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back</button><h1>Games</h1><input id="search" placeholder="Search games..." autocomplete="off"></div><div class="grid" id="grid"></div><script>var G=' + JSON.stringify(Object.keys(GAMES).map(function(k){return {slug:k,name:GAMES[k].name,img:GAME_IMAGES[k]||''}})) + ';var g=document.getElementById("grid"),s=document.getElementById("search");function draw(){var q=(s.value||"").toLowerCase();g.innerHTML="";G.forEach(function(x){if(q&&x.name.toLowerCase().indexOf(q)===-1)return;var a=document.createElement("a");a.className="card";a.href="/game/"+x.slug;if(x.img){var im=document.createElement("img");im.src=x.img;im.loading="lazy";im.onerror=function(){this.style.display="none";a.classList.add("noimg")};a.appendChild(im)}else{var ph=document.createElement("div");ph.className="ph";ph.textContent=x.name.charAt(0).toUpperCase();a.appendChild(ph)}var nm=document.createElement("div");nm.className="name";nm.textContent=x.name;a.appendChild(nm);g.appendChild(a)})}s.addEventListener("input",draw);draw();</script></body></html>');
});

const GAMES_CSS = '*{margin:0;padding:0;box-sizing:border-box}body{background:#0b0b12;color:#e4e4e7;font-family:"Segoe UI",system-ui,sans-serif;min-height:100vh}.top{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;padding:14px 20px;background:rgba(11,11,18,.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}.top h1{font-size:18px;font-weight:600}.back{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#e4e4e7;cursor:pointer;font-size:13px;font-family:inherit}.back:hover{background:rgba(255,255,255,.08)}#search{flex:1;max-width:300px;margin-left:auto;padding:9px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#e4e4e7;font-size:13px;outline:none}#search:focus{border-color:rgba(139,92,246,.4)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;padding:20px}.card{position:relative;display:flex;flex-direction:column;gap:8px;text-decoration:none;color:#e4e4e7;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);transition:transform .15s,border-color .15s}.card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.4)}.card img{width:100%;aspect-ratio:16/10;object-fit:cover;background:linear-gradient(135deg,#1a1a2e,#16213e)}.card.noimg{background:linear-gradient(135deg,#8b5cf6,#06b6d4)}.card.noimg::before{content:"";display:block;aspect-ratio:16/10;width:100%}.card .ph{width:100%;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:700;color:#fff;background:linear-gradient(135deg,#8b5cf6,#06b6d4)}.card .name{padding:0 10px 12px;font-size:13px;font-weight:500;text-align:center}@media(max-width:600px){.grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;padding:12px}}';


app.get('/game/:slug', function (req, res) {
    var slug = req.params.slug;
    var game = GAMES[slug];
    if (!game) return res.status(404).send('Game not found');

    var proxyUrl = '/proxy?url=' + encodeURIComponent(game.url);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + game.name + '</title><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}iframe{width:100%;height:100%;border:none;position:fixed;inset:0}.bar{position:fixed;top:12px;left:12px;z-index:10;display:flex;align-items:center;gap:10px}.bar button{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#fff;cursor:pointer;font-size:13px;font-family:inherit;backdrop-filter:blur(8px)}.bar button:hover{background:rgba(0,0,0,.8)}.bar span{padding:8px 14px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#fff;font-size:13px;backdrop-filter:blur(8px)}</style></head><body><div class="bar"><button onclick="history.back()"><svg viewBox="0 0 24 24" width="16" height="16"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back</button><span>' + game.name + '</span></div><iframe src="' + proxyUrl + '" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-pointer-lock allow-top-navigation allow-presentation allow-orientation-lock allow-downloads"></iframe></body></html>');
});

app.all('/proxy', async function (req, res) {
    var target = req.query.url;
    if (!target) return res.status(400).send('missing url');
    if (!/^https?:\/\//i.test(target)) return res.status(400).send('bad url');

    var cached = cache.get(target);
    if (cached && Date.now() - cached.ts < CACHE_TTL && req.method === 'GET') {
        for (var k in cached.headers) { res.setHeader(k, cached.headers[k]); }
        return res.send(cached.body);
    }

    try {
        var fetchOpts = {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            redirect: 'follow',
            agent: function (u) { return u.protocol === 'https:' ? httpsAgent : httpAgent; },
        };
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            var chunks = [];
            req.on('data', function (c) { chunks.push(c); });
            await new Promise(function (resolve) { req.on('end', resolve); });
            if (chunks.length > 0) {
                fetchOpts.body = Buffer.concat(chunks);
                var ct2 = req.headers['content-type'];
                if (ct2) fetchOpts.headers['Content-Type'] = ct2;
            }
        }

        var fetchRes = await fetch(target, fetchOpts);

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
            body = body.replace(/<head[^>]*>/i, '<head><base href="/proxy?url=' + enc(finalUrl) + '"><script>new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.tagName==="SCRIPT"){var v=n.getAttribute("src");if(v&&v.indexOf(location.origin)===-1&&!/^(data|blob):/.test(v)){try{n.src="/proxy?url="+encodeURIComponent(new URL(v,location.href).href)}catch(e){}}}if(n.tagName==="LINK"&&n.rel==="stylesheet"){var h=n.getAttribute("href");if(h&&h.indexOf(location.origin)===-1&&!/^(data|blob):/.test(h)){try{n.href="/proxy?url="+encodeURIComponent(new URL(h,location.href).href)}catch(e){}}}if(n.tagName==="IMG"){var s=n.getAttribute("src");if(s&&s.indexOf(location.origin)===-1&&!/^(data|blob):/.test(s)){try{n.src="/proxy?url="+encodeURIComponent(new URL(s,location.href).href)}catch(e){}}}})});}).observe(document.documentElement,{childList:true,subtree:true});</script>');
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
