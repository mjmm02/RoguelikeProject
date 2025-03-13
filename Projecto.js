const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', {alpha: false});

const TILE_SIZE = 50;
const MAP_WIDTH = 24;
const MAP_HEIGHT = 16;

const PLAYER = new Image();

const DOOR_SPRITE = new Image();
const DOOR2_SPRITE = new Image();
const GAME_OVER_IMG = new Image();
const FIREBALL_SPRITE = new Image();

const WALL = "#";
const FLOOR = '.';
const DOOR = "D";
const DOOR2 = "D2";

let aux2 = 0, newLevel = false, level = 0;
let wallArray = new Array(250);
let timeout = 600;

let sndStrike = new Audio("sword-sound-2-36274.mp3");
let sndGG = new Audio("8-bit-video-game-fail-version-2-145478.mp3");
let sndMnstr = new Audio("monster-death-grunt-131480.mp3");
let sndDemon = new Audio("goblin-death-6729.mp3");
let sndhurt = new Audio("male_hurt7-48124.mp3");
let sndDoor = new Audio("door-slam-172171.mp3");
let sndDmnGrowl = new Audio("creepy-moan-87456.mp3");
let sndDeath = new Audio("male-scream-81836.mp3");
let sndWin = new Audio("badass-victory-85546.mp3");
let sndFbll = new Audio("8-bit-explosion-95847.mp3");

for(let i = 0; i < wallArray.length; i++){
    wallArray[i] = new Image();
}

const door = {
    x: MAP_WIDTH - 1,
    y: Math.floor(Math.random() * (MAP_HEIGHT - 3) + 1),
    sprite: "door.png"
};

const player = {
    x: 1,
    y: door.y,
    hp: 6,
    at: false,
    direction: "right",
    foot: "right"
};

const sprite = {
    right1: "small-armor-knight-right1.png",
    right2: "small-armor-knight-right2.png",
    rightAtc: "small-armor-knight-right-attack.png",
    left1: "small-armor-knight-left1.png",
    left2: "small-armor-knight-left2.png",
    leftAtc: "small-armor-knight-left-attack.png"
};

class Fireball{
    constructor(x, y, direction, sprite){
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.sprite = sprite;
    }
}

class Monster{
    constructor(x, y, hp, spLeft, spRight){
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.sprite = new Image();
        this.spLeft = spLeft;
        this.spRight = spRight;
        this.lastPos = spRight;
    }
}

let ghost = new Monster(Math.floor(Math.random() * (MAP_WIDTH - 12)) + 10,
Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1, Math.floor(Math.random() * 3) + 1, 
"ghost_left.png", "ghost_right.png");

let pumpkinman = new Monster(Math.floor(Math.random() * (MAP_WIDTH - 12)) + 10,
Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1, Math.floor(Math.random() * 3) + 1,
"MS5pxR_left.png", "MS5pxR.png");

let ghost2 = new Monster(Math.floor(Math.random() * (MAP_WIDTH - 12)) + 10,
Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1, Math.floor(Math.random() * 3) + 1, 
"FAfTRr_left.png", "FAfTRr.png");

let treeman = new Monster(Math.floor(Math.random() * (MAP_WIDTH - 12)) + 10,
Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1, Math.floor(Math.random() * 3) + 1, 
"2cljF8-left.png", "2cljF8.png");

let spider = new Monster(Math.floor(Math.random() * (MAP_WIDTH - 12)) + 10,
Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1, Math.floor(Math.random() * 3) + 1, 
"spider.png", "spider.png");

let demon = new Monster(-1, -1, Math.floor(Math.random() * 5) + 5, 
"demon_left.png", "demon_right.png");

let fball = new Fireball(-1, -1, "left", "fireball.png");

const monsters = [ghost, ghost2, pumpkinman, treeman, spider, demon];

let aux = 0, rand = 0, rand1 = 0, rand2 = 0;
let lastDir = "";

let map = generateMap(MAP_WIDTH, MAP_HEIGHT);

//document.addEventListener('keydown', handleInput);

function GameOver(){
    //ctx.clearRect(0, 0, MAP_WIDTH*TILE_SIZE, MAP_HEIGHT*TILE_SIZE);
    
    //ctx.remove();
    canvas.remove();
    
    if(player.hp == 0){
        sndGG.play();
        document.getElementById("gameOverScreen").innerHTML = '<img src="game_over_screen.jpg"' + 
        'alt="game over" width="800" height="500"></img>';
    }
    else if(demon.hp == 0){
        sndWin.play();
        document.getElementById("gameOverScreen").innerHTML = '<img src="winner_screen.jpg"' + 
        'alt="game over" width="800" height="500"></img>';
    }
}

function Hit(monster){
    if((player.x + 1 == monster.x || player.x - 1 == monster.x ) && 
    player.y == monster.y && player.at == true){
        monster.hp--;
        if(monster.spRight == "demon_right.png"){
            sndDemon.play();
        }
        else{
            sndMnstr.play();
        }
        if(monster.spRight == "demon_right.png" && monster.hp == 0){
            GameOver();
        }
        if(monster.hp <= 0){
            RemoveSprite(monster);
        }
    }
}

function RemoveSprite(sprite){
    sprite.x = -1;
    sprite.y = -1;
}

function Damage(monster){
    if(player.x == monster.x && player.y == monster.y){
        player.hp--;
        if(monster.sprite == "fireball.png"){
            RemoveSprite(monster);
        }
        if(player.hp > 0){
            sndhurt.play();
        }
        else if(player.hp == 0){
            sndDeath.play();
            GameOver();
        }
    }
}

function ThrowFireball(fb){
    if(demon.hp > 0){
        fb.x = demon.x;
        fb.y = demon.y;
        if(demon.x > player.x){
            fb.direction = "left";
        }
        else if(demon.x < player.x){
            fb.direction = "right";
        }
        sndFbll.play();
        FireballMovement(fb);
    }
}

function FireballMovement(fb){

    if(map[fb.y][fb.x - 1] == WALL || map[fb.y][fb.x + 1] == WALL){
        RemoveSprite(fb);
    }
    else{
        if(fb.direction == "left"){
            fb.x--;
        }
        else if(fb.direction == "right"){
            fb.x++;
        }
        FIREBALL_SPRITE.src = fb.sprite;
        FIREBALL_SPRITE.onload = () =>{
            ctx.drawImage(FIREBALL_SPRITE, fb.x * TILE_SIZE, 
                fb.y * TILE_SIZE, 50, 50);
        }
    }

    Damage(fb);

    draw();
}

function DoorInit(){
    DOOR_SPRITE.src = door.sprite;
    DOOR_SPRITE.onload = () => {
        ctx.drawImage(DOOR_SPRITE, door.x * TILE_SIZE, door.y * TILE_SIZE, 50, 50);
    }
}

function DoorEntInit(){
    DOOR2_SPRITE.src = door.sprite;
    DOOR2_SPRITE.onload = () => {
        ctx.drawImage(DOOR2_SPRITE, 0 * TILE_SIZE, door.y * TILE_SIZE, 50, 50);
    }
}

function MonsterInit(monster, MONSTER_SPRITE){
    MONSTER_SPRITE.src = monster.lastPos;
    MONSTER_SPRITE.onload = () => {
        ctx.drawImage(MONSTER_SPRITE, monster.x * TILE_SIZE, monster.y * TILE_SIZE, 50, 50);
    }
}

function DamageHit(){

    for(let i = 0; i < monsters.length; i++){
        Damage(monsters[i]);
        Hit(monsters[i]);
    }

    draw();
}

function MonstersSpriteRefresh(){

    for(let i = 0; i < monsters.length - 1; i++){
        MonsterInit(monsters[i], monsters[i].sprite);
    }
    
    if(level == 3){
        MonsterInit(demon, demon.sprite);
    }

    draw();
}

function MonsterTurn(){
    
    if(level < 3){
        for(let i = 0; i < monsters.length - 1; i++){
            MonsterInit(monsters[i], monsters[i].sprite);
            MonsterMovement(monsters[i], monsters[i].sprite);
        }
    }
    else if(level == 3){
        MonsterInit(demon, demon.sprite);
        MonsterMovement(demon, demon.sprite);
        if(fball.x == -1){
            ThrowFireball(fball);
        }
        else{
            FireballMovement(fball);
        }
    }

    DamageHit();

    draw();
}

function PlayerMovement(){

    PLAYER.onload = () => {
        ctx.drawImage(PLAYER, player.x * TILE_SIZE, player.y * TILE_SIZE, 50, 50);
    }

    if(player.x > aux){
        if(player.at == false){
            if(player.foot == "right"){
                PLAYER.src = sprite.right1;
            }
            else{
                PLAYER.src = sprite.right2;
            }
        }
        else{
            PLAYER.src = sprite.rightAtc;
        }
    }
    else if(player.x < aux){
        if(player.at == false){
            if(player.foot == "right"){
                PLAYER.src = sprite.left1;
            }
            else{
                PLAYER.src = sprite.left2;
            }
        }
        else{
            PLAYER.src = sprite.leftAtc;
        }
    }
    else if(player.x == aux){
        if(lastDir == "right"){
            if(player.at == false){
                if(player.foot == "right"){
                    PLAYER.src = sprite.right1;
                }
                else{
                    PLAYER.src = sprite.right2;
                }
            }
            else{
                PLAYER.src = sprite.rightAtc;
            }

        }
        else if(lastDir == "left"){
            if(player.at == false){
                if(player.foot == "right"){
                    PLAYER.src = sprite.left1;
                }
                else{
                    PLAYER.src = sprite.left2;
                }
            }
            else{
                PLAYER.src = sprite.leftAtc;
            }
        }
    }

    DamageHit();

    if(player.at == true){
        player.at = false;
    }

    draw();
}

function MonsterMovement(monster, MONSTER){

    if(monster.hp > 0){
        rand1 = Math.floor(Math.random() * 2);
        rand2 = Math.floor(Math.random() * 3);

        if(rand2 == 0 || rand2 == 2){
            if(map[monster.y][monster.x + 1] === WALL){
                monster.x--; 
                MONSTER.src = monster.spLeft;
             }
             else if(map[monster.y][monster.x - 1] === WALL){
                 monster.x++;
                 MONSTER.src = monster.spRight;
    
             }
             else if(rand1 == 0 && map[monster.y][monster.x + 1] === FLOOR){
                 monster.x++;
                 MONSTER.src = monster.spRight;
    
             }
             else if(rand1 == 1 && map[monster.y][monster.x - 1] === FLOOR){
                 monster.x--;
                 MONSTER.src = monster.spLeft;
             }
        }
        if(rand2 == 1 || rand2 == 2){
            rand1 = Math.floor(Math.random() * 2);
    
            if(map[monster.y + 1][monster.x1] === WALL){
                monster.y--;
            }
            else if(map[monster.y - 1][monster.x1] === WALL){
                monster.y++; 
            }
            else if(rand1 == 0 && map[monster.y + 1][monster.x] === FLOOR){
                monster.y++;
            }
            else if(rand1 == 1 && map[monster.y - 1][monster.x] === FLOOR){
                monster.y--;
            }
        }
        monster.lastPos = MONSTER.src;
    }
}

function GameLoop(){
    
    document.addEventListener('keydown', handleInput);
    PlayerMovement();
    MonsterTurn();
    /*if(level == 3){
        timeout = 550;
    }*/
    setTimeout(() => {
        window.requestAnimationFrame(GameLoop);    
    }, timeout);
    
}

function generateMap(width, height) {
    let map = [];

    level++;

    if(level < 3){

        for(let i = 0; i < monsters.length - 1; i++){
            monsters[i].x = Math.floor(Math.random() * (MAP_WIDTH - 4)) + 2;
            monsters[i].y = Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1;
            monsters[i].hp = Math.floor(Math.random() * 3) + 1;
        }
    }
    else if(level == 3){
        
        for(let i = 0; i < 5; i++){
            RemoveSprite(monsters[i]);
        }

        demon.x = Math.floor(Math.random() * (MAP_WIDTH - 4)) + 2;
        demon.y = Math.floor(Math.random() * (MAP_HEIGHT - 3)) + 1;
        MonsterInit(demon, demon.sprite);
    }
    

    for (let y = 0; y < height; y++) {
        let row = [];
        let randY = Math.floor(Math.random() * (height - 1)) + 1;
        
        for (let x = 0; x < width; x++) {
            if(x === 0 && y === door.y){
                row.push(DOOR2);
            }
            else if(x === door.x && y === door.y){
                if(level != 3){
                    row.push(DOOR);
                }
                else{
                    row.push(WALL);
                }
            }
            else if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                row.push(WALL);
            } else {
                row.push(FLOOR);
            }
        }
        for(let i = 0; i < 5; i++){
            rand = Math.floor(Math.random() * (MAP_WIDTH - 4)) + 2;
            
            if(randY == y){
                i = 5;
            }
            else if(randY != y && rand != ghost.x && rand != pumpkinman.x && 
                rand != ghost2.x && rand != treeman.x && 
                rand != spider.x && rand != demon.x){
                row[rand] = WALL;
            }
            else{
                i--;
            }
        }
        map.push(row);
        
    }    
    return map;
}

function handleInput(event) {
    let newX = player.x;
    let newY = player.y;
    let atc = player.at;
    let newDir = player.direction;
    switch (event.key) {
        case 'ArrowUp':
            newY--;
            atc = false;
            break;
        case 'ArrowDown':
            newY++;
            atc = false;
            break;
        case 'ArrowLeft':
            newX--;
            atc = false;
            newDir = "left";
            break;
        case 'ArrowRight':
            newX++;
            atc = false;
            newDir = "right";
            break;
        case 'a':
            atc = true;
            sndStrike.play();
            break;
        default:
            break;
    }
    if (map[newY][newX] === FLOOR) {
        aux = player.x;
        lastDir = player.direction;
        player.x = newX;
        player.y = newY;
        player.at = atc;
        player.direction = newDir;
        if(player.foot == "right"){
            player.foot = "left";
        }
        else{
            player.foot = "right";
        }
    }
    else if(map[newY][newX] === DOOR){
        if(level < 3){
            map = generateMap(MAP_WIDTH, MAP_HEIGHT);
            player.x = 1;
            player.y = door.y;
            sndDoor.play();    
        }
        if(level == 3){
            sndDmnGrowl.play();
        }
    }
    PlayerMovement();
    MonstersSpriteRefresh();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if(x === 0){
                DoorEntInit();
            }
            if (map[y][x] === DOOR) {
                DoorInit();
            }
            else if (map[y][x] === WALL) {
                let WOLL = new Image();
                /*WOLL.onload = () => {
                    ctx.drawImage(WOLL, x * TILE_SIZE, y * TILE_SIZE, 50, 50);
                }
                WOLL.src = "dungeon_brick_wall__8_bit__by_trarian_dez45u1-fullview.jpg";*/
                
                ctx.fillStyle = 'gray';
            } else {
                /*let FLOOR2 = new Image();
                FLOOR2.onload = () => {
                    ctx.drawImage(FLOOR2, x * TILE_SIZE, y * TILE_SIZE, 50, 50);
                }
                FLOOR2.src = "groundtile3.jpg";*/
                ctx.fillStyle = 'black';
            }
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            //ctx.strokeStyle = 'white';
            //ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
    ctx.font = "15px Arial";
    ctx.fillText("PLAYER HEALTH: " + player.hp, 0, 0);
    ctx.fillStyle = 'white';
    //ctx.fillText(PLAYER, player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2);
}

window.alert("Carregue cima, baixo, esquerda, direita para se movimentar e A para atacar");
GameLoop();