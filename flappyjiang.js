



const teaW = 48;
const teaH = 48;
const cjjW = 36;
const cjjH = 36;
const r = {
    t: 0,
    gravity: 8,
    impulse: 4,
    gameState: 'title',
    lines: [],
    development: false,
    mobile: /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    sounds: {},
};
const w = r.mobile ? window.innerWidth : 480;
const h = r.mobile ? window.innerHeight : 480;

const app = new PIXI.Application({ 
    width: w,
    height: h,
    backgroundColor: 0x1099bb 
});
document.body.appendChild(app.view);


//
const context = new AudioContext();

let sounds = ['gan', 'ntmd', 'woc'];
sounds.forEach(sound => {

    let url = `./${sound}.mp3`

    window.fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      r.sounds[sound] = audioBuffer;
    });
})

const play = (sound) => {
    const source = context.createBufferSource();
    source.buffer = r.sounds[sound];
    source.connect(context.destination);
    source.start();
}


// create cjj
r.cjj = PIXI.Sprite.from('cjj.png');
r.cjj.anchor.set(0.5);
r.cjj.x = w * 0.5;
r.cjj.baseY = h * 0.65;
r.cjj.y = r.cjj.baseY;
r.cjj.v = 0;
app.stage.addChild(r.cjj);
r.cjj.update = () => {
    
    switch(r.gameState) {
        case 'title': 
        
        if (r.cjj.dead) {

            r.cjj.y -= 2;
            r.cjj.rotation -= 0.01;

            if (r.cjj.y < r.cjj.baseY) r.cjj.y = r.cjj.baseY
            if (r.cjj.rotation < 0) r.cjj.rotation = 0;
                
            if (r.cjj.y == r.cjj.baseY && r.cjj.rotation == 0) {
                r.cjj.dead = false;
                r.t = 0;
            }

        } else {

            r.cjj.y = r.cjj.baseY + Math.sin(r.t * 2) * 20;

        }

            break;
        case 'game':
        case 'dying':
            
            if (r.gameState == 'game') {
                r.cjj.rotation -= 0.01;
                if (r.cjj.rotation < 0) r.cjj.rotation = 0;
            }
            if (r.gameState == 'dying') {
                r.cjj.rotation += 0.01;
            }

            r.cjj.v += r.gravity / r.delta / 60;
            r.cjj.y += r.cjj.v * r.delta;
            if (r.cjj.y > h - cjjH / 2) {
                if (r.gameState == 'game') play('woc');
                r.cjj.y = h - cjjH / 2;
                r.cjj.v = 0;
                r.gameState = 'gameover'
                r.cjj.dead = true;
            }
            
            break;
            
    }
    
}


// create title

r.title = new PIXI.Text('陈姜姜喝奶茶', new PIXI.TextStyle({
    fontSize: r.mobile ? 45 : 60,
    fill: '#000',
    stroke: '#fff',
    strokeThickness: 3,
}));
r.title.anchor.set(0.5);
r.title.rotation = 0.2;
r.title.scale.x = 1;
r.title.alpha = 1;
r.title.x = w * 0.5
r.title.y = h * 0.25;
app.stage.addChild(r.title);
r.title.update = () => {

    if (!r.titleStamp) r.titleStamp = r.t;
    if (r.titleStamp > r.t) r.titleStamp = r.t;

    if (r.t - r.titleStamp > 0.5) {
        r.titleStamp = r.t;
        r.title.rotation *= -1;
    }

    
    switch(r.gameState) {
        case 'title':

            r.title.alpha += 0.02;
            if (r.title.alpha > 1) r.title.alpha = 1;
            r.title.text = '陈姜姜喝奶茶'
            break;
        case 'game':
            r.title.alpha -= 0.02;
            if (r.title.alpha < 0) r.title.alpha = 0;
            break;
        case 'gameover':
            
            r.title.text = '陈凉凉凉凉了';

            r.title.alpha += 0.02;
            if (r.title.alpha > 1) r.title.alpha = 1;
            break;


            
            

    }
    
}

// score
r.score = new PIXI.Text('0', new PIXI.TextStyle({
    fontSize: 36,
    fill: '#fff', // gradient
    stroke: '#000',
    strokeThickness: 3,
}));
r.score.x = 5;
r.score.update = () => {
    if (r.gameState == 'title') r.score.text = '0';
}
app.stage.addChild(r.score);

r.text = new PIXI.Text(r.mobile ? '触摸屏幕狂喝奶茶' : '任意键狂喝奶茶', new PIXI.TextStyle({
    fontSize: 20,
    align: 'center',
}));
r.text.anchor.set(0.5);
r.text.x = w / 2;
r.text.y = h / 2;
r.text.alpha = 1;
app.stage.addChild(r.text);
r.text.update = () => {
    switch(r.gameState) {
        case 'title':
            r.text.text = r.mobile ? '触屏狂喝奶茶' : '任意键狂喝奶茶';
            break;
        case 'game':
            r.text.alpha -= 0.05;
            if (r.text.alpha < 0) r.text.alpha = 0;
            break;
        case 'gameover':
            r.text.alpha += 0.05;
            if (r.text.alpha > 1) r.text.alpha = 1;
            let score = parseInt(r.score.text);
            let comment;
            if (score == 0) {
                comment = '某种意义上你是个天才，嗯，0 杯。'
            } else if (score == 1) {
                comment = '做个人吧，才 1 杯。'
            } else if (score <= 5) {
                comment = `太差劲了，才 ${score} 杯。`
            } else if (score <= 10) {
                comment = `还行吧，普普通通喝个 ${score} 杯。`
            } else if (score <= 20) {
                comment = `哇，牛吖，${score} 杯！`
            } else if (score <= 50) {
                comment = `好帅啊！！！！陈姜姜喝了 ${score} 杯奶茶！`
            } else if (score <= 99) {
                comment = `你说，你是不是开了修改器！居然喝 ${score} 杯！`
            } else {
                comment = `呃， ${socre} 杯，燃烧你的卡路里！陈胖胖。`
            }
            r.text.text = `${comment}\n${r.mobile ? '触屏' : '任意键'}原地复活`
            break;
    }
}


// debug
r.debug = new PIXI.Text('debuging', new PIXI.TextStyle({fontSize: 12}));
r.debug.y = h - 36;
r.debug.text = window.innerWidth;
r.debug.update = () => {
    r.debug.text = r.mobile;
}

if (r.development) app.stage.addChild(r.debug);


// create line (pipe and tea)
const addLine = () => {

    let line = new PIXI.Container();
    r.lines.push(line);
    app.stage.addChild(line);


    let gapH = teaH * ( r.mobile ? 4.5 : 3 );
    let halfGap = gapH / 2;
    let min = halfGap + teaH * (r.mobile ? 2 : 1 );
    let max = h - halfGap - teaH * (r.mobile ? 2 : 1 );
    let center = Math.random() * (max - min) + min;
    
    let topY = center - halfGap;
    let bottomY = center + halfGap;

    let pipe = PIXI.Sprite.from('pipe.png');
    pipe.height = h;
    pipe.anchor.set(0.5);
    pipe.x = teaW / 2
    pipe.y = h / 2;
    
    let mask = new PIXI.Graphics();
    pipe.mask = mask;
    mask.beginFill('black')
    mask.drawRect(0, 0, teaW, topY)
    mask.drawRect(0, bottomY, teaW, h)

    let topHead = PIXI.Sprite.from('pipeHead.png');
    topHead.scale.x = 1.2;
    topHead.anchor.set(0.5);
    topHead.x = teaW / 2;
    topHead.y = topY - 12;

    let bottomHead = PIXI.Sprite.from('pipeHead.png');
    bottomHead.scale.x = 1.2;
    bottomHead.anchor.set(0.5);
    bottomHead.x = teaW / 2;
    bottomHead.y = bottomY + 12;

    let flip = Math.random() > 0.5;
    if (flip) {
        pipe.scale.x *= -1;
        topHead.scale.x *= -1;
        bottomHead.scale.x *= -1;
    }
    
    let tea = PIXI.Sprite.from('tea.png');
    tea.anchor.set(0.5);
    tea.y = center;
    tea.x = teaW / 2;
    tea.scale.x = Math.random() > 0.5 ? 1 : -1;

    line.x = h;
    line.tea = tea;
    line.center = center;


    line.addChild(pipe);
    line.addChild(mask);
    line.addChild(topHead);
    line.addChild(bottomHead);
    line.addChild(tea);
    
    line.update = () => {

        switch (r.gameState) {
            case 'game':

                line.x -= r.mobile ? 2.5 : 3;
                tea.rotation = Math.sin(r.t) * 0.2



                if (line.x < -100) {
                    app.stage.removeChild(line);
                    r.lines.shift();
                }
                
                let cY = r.cjj.y;
                let xCollide = Math.abs(line.x - w / 2) < 18
                let yCollide = cY < topY || cY > bottomY;
                let collide = xCollide && yCollide;

                if (collide) {
                    r.gameState = 'dying';
                    play('woc');
                }

                let teaCollide = Math.abs(cY - line.center) < 36;
                
                if (xCollide && teaCollide && !line.teaCollided) {
                    line.teaCollided = true;
                    play('ntmd');
                    r.score.text = parseInt(r.score.text) + 1;
                }

                if (line.teaCollided) {

                    tea.alpha -= 0.05;

                }



                break;
            case 'title':
            case 'gameover':

                line.alpha -= 0.05;
                if (line.alpha < 0) {
                    app.stage.removeChild(line);
                    r.lines.shift();
                }

                break;
        }



    }

}




app.ticker.add((delta) => {

    r.t += delta / 60;
    r.delta = delta;

    if (r.gameState == 'game') {
        
        if (!r.timeStamp || r.timeStamp > r.t) {
            r.timeStamp = r.t;
            addLine();
        }

        if (r.t - r.timeStamp > (r.mobile ? 2.2 : 1.8) ) {
            r.timeStamp = r.t;
            addLine();
        }
        
    }

    r.cjj.update();
    r.title.update();
    r.text.update();
    r.score.update();
    // r.debug.update();
    r.lines.forEach(line => line.update() )

});

const action = (ev) => {

    switch (r.gameState) {
        case 'title': r.gameState = 'game'; break;
        case 'game': r.cjj.v = -r.impulse; play('gan'); break;
        case 'gameover': r.gameState = 'title'; break;
    }

    
}

document.addEventListener('keydown', ev => action(ev) ) ;
document.addEventListener('mousedown', ev => {
    if (!action.touch) action(ev);
    action.touch = false;
});
document.addEventListener('touchstart', ev => {
    action.touch = true;
    action(ev);
} );





