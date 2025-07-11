
/*=================================
=            Variáveis            =
=================================*/

/* variáveis do personagem principal */
var mario, bricks,clouds,mountains,enemyMushrooms,pipes,platforms,coins;

/* Variáveis de controle */
var control={
  up: "UP_ARROW", // 32 = barra de espaço
  left: 'LEFT_ARROW',
  right: 'RIGHT_ARROW',
  revive: 32
}

//Status interno do jogo, pode afetar o balanceamento do jogo ou sua jogabilidade.
var gameConfig={
  
  // início, jogo, fim
  status: "start", 
  
  // vidas iniciais do Mario
  initialLifes: 4,

  // velocidade de movimento do personagem
  moveSpeed: 5,
  enemyMoveSpeed: 1,

  // velocidade da gravidade e pulo para todos os personagens
  gravity: 1,
  gravityEnemy: 10,
  jump:-15,

  // ponto de início do personagem
  startingPointX: 500,
  startingPointY: 0,

  // tamanho padrão do canvas
  screenX:1240,
  screenY:336,

  // pontuação
  timeScores: 0,
  scores: 0
}


/*=====  Fim das Variáveis  ======*/


/*====================================
=            Status do Jogo             =
====================================*/

noseX = "";
noseY = "";

GameStatus = "";


function game(){

  instializeInDraw();
  moveEnvironment(mario);
  drawSprites();
  
  if(gameConfig.status==='start'){

    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Pressione o botão JOGAR para iniciar o jogo", gameConfig.screenX/2, gameConfig.screenY/2);
    textSize(40);

    stroke(255);
    strokeWeight(7);
    noFill();

    changeGameStatud();
  }
  
  if(gameConfig.status==='play'){
    positionOfCharacter(mario);
    enemys(enemyMushrooms);
    checkStatus(mario);
    scores(mario);
    manualControl(mario);
  
    // versão opcional dos controles do jogo
    // autoControl(mario);
  
  }

    // Se o jogo acabar 
  if(gameConfig.status==='gameover'){
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", gameConfig.screenX/2, gameConfig.screenY/2+105);
    textSize(15);
    text("Pressione a barra de espaço para recomeçar", gameConfig.screenX/2, gameConfig.screenY/2+135);
    textSize(40);
    text(round(gameConfig.scores),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("Pontos",gameConfig.screenX/2,gameConfig.screenY/2);

    stroke(255);
    strokeWeight(7);
    noFill();
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,160,160)
    changeGameStatud(mario)
  }
}  
function startGame () {
  GameStatus = "start";
  document.getElementById("status").innerHTML = "carregando";
}

// modifique o status do jogo se qualquer tecla for pressionada
function changeGameStatud(character){
  if(GameStatus == "start" && noseX != "" && gameConfig.status==="start") {
    world_start.play();
    initializeCharacterStatus(mario);
    gameConfig.status= "play";
  }
  if(gameConfig.status==="gameover" && keyDown(control.revive)) {
    gameConfig.status= "start";        
  }
}




/*=====  Fim do Status do Jogo   ======*/



/*=============================================
=                 Inicialização                  =
=============================================*/

//inicialização
function instializeInSetup(character){
	frameRate(120);
	
	character.scale=0.35;
	initializeCharacterStatus(character)

  bricks.displace(bricks);
	platforms.displace(platforms);
	coins.displace(coins);
	coins.displace(platforms);
	coins.collide(pipes);
	coins.displace(bricks);		

  // modifique a escala das nuvens
	clouds.forEach(function(element){
		element.scale=random(1,2);
	})
}

function initializeCharacterStatus(character){
  // defina as configurações iniciais do personagem  
  character.scale=0.35;
  character["killing"]=0; //enquanto mata o inimigo
  character["kills"]=0;
  character["live"]=true;
  character["liveNumber"]=gameConfig.initialLifes;
  character["status"]='live';
  character["coins"]=0;
  character["dying"]=0;
  character.position.x=gameConfig.startingPointX;
  character.position.y=gameConfig.startingPointY;
}

function instializeInDraw(){
  background(109,143,252);
  
  //enquanto mata
  if(mario.killing>0){
    mario.killing-=1;
  }else{
    mario.killing=0;
  }
  
  // evite que objetos se sobreponham.
  pipes.displace(pipes);
  enemyMushrooms.displace(enemyMushrooms);
  enemyMushrooms.collide(pipes);
  clouds.displace(clouds);

  // evite que o personagem se sobreponha sobre os objetos
  if(mario.live){
    bricks.displace(mario);
    pipes.displace(mario);
    enemyMushrooms.displace(mario);
    platforms.displace(mario);
  }
  
  // inicialização das configurações do personagem
  mario["standOnObj"]=false;
  mario.velocity.x=0;
  mario.maxSpeed=20;

}

/*=====       Fim da Inicialização        ======*/



/*============================================
=            Elementos Interativos            =
============================================*/

// Personagem coleta moedas
function getCoins(coin,character){
  if( character.overlap(coin) && character.live && coin.get==false){
    character.coins+=1;
    coin.get=true;
    mario_coin.play();
  };
}
    
// Gerar novas moedas após serem coletadas.
function coinVanish(coin){
  if(coin.get){
    coin.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
    coin.get=false;
  };
}

/*=====  Fim dos elementos interativos  ======*/


/*=============================================
=    Controles e configurações do personagem principal       =
=============================================*/

/* Fazer o personagem principal ficar sobre objetos */
function positionOfCharacter(character){
  
  // Fora da plataforma
  if(character.live){
    
    // Observar se está sobre os blocos
    platforms.forEach(function(element){ standOnObjs(character,element); });
    bricks.forEach(function(element){ standOnObjs(character,element); });
    pipes.forEach(function(element){ standOnObjs(character,element); });
    
    // Efeito da gravidade sobre o personagem
    falling(character);

    // Se o personagem consegue pular apenas se estiver sobre objetos
    if(character.standOnObj) jumping(character);
      
  }

  // Evento de interação com as moedas
  coins.forEach(function(element){
    getCoins(element,mario);
    coinVanish(element);
  });

  // Evento de interação com os inimigos enemyMushrooms
  enemyMushrooms.forEach(function(element){
    StepOnEnemy(character,element);
    if((element.touching.left||element.touching.right)&&character.live&&character.killing===0) die(mario);
    
  })

  // Deixá-lo visívelna tela
  dontGetOutOfScreen(mario);

}

/* Movimentação automática dos personagens  */
function autoControl(character){
    character.velocity.x+=gameConfig.moveSpeed;
    character.changeAnimation('move');
    character.mirrorX(1);
}

/* Controle manual do personagem */
function manualControl(character){
  
  if(character.live){
    if(noseX<300){
      character.velocity.x-=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(-1);
    }

    if(noseX>300){
      character.velocity.x+=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(1);
    }

    if(!keyDown(control.left)&&!keyDown(control.right)&&!keyDown(control.up)){ 
      character.changeAnimation('stand');
    }
  }
 
}

/* Movimentos do personagem */
function jumping(character){
	if( (noseY<200&&character.live) || (touchIsDown&&character.live) ){
		character.velocity.y+=gameConfig.jump;
    mario_jump.play();
	}
}


/* Movimentos do personagem */
function falling(character){
	character.velocity.y += gameConfig.gravity;
  character.changeAnimation('jump');
}


/* Observar se obj1 está sobne obj2, para verificar se está sobre um objeto*/
function standOnObjs(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
		// println("SIM");
		obj1.velocity.y = 0;
		obj1.position.y=obj2_Up-(obj1.height/2)-1;
		obj1.standOnObj= true;
	}
}

/* Observar se obj1 pisou em obj2 para matá-lo*/
function StepOnEnemy(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7 && obj2.live==true && obj2.touching.top){
		obj2.live=false;
    obj1.killing=30;
    obj1.kills++;
    if(obj1.velocity.y>=gameConfig.jump*0.8){
      obj1.velocity.y=gameConfig.jump*0.8;
    }else{
      obj1.velocity.y+=gameConfig.jump*0.8;
    }
    mario_kick.play();
	}
}


// Matar personagem se tocar ou for tocado pelo inimigo
function die(character){
    character.live=false;
    character.dying+=120;
    character.liveNumber--;
    character.status="dead";
    character.changeAnimation('dead');
    character.velocity.y-=2;
    if(character.liveNumber > 0) {
      mario_die.play();
    }
}

// Verificar o status e resposta do personagem ao status do sprite e jogo
function checkStatus(character){    
  if(character.live==false){
    character.changeAnimation('dead');
    character.dying-=1;
    reviveAfterMusic(character);
  }
  if(character.live==false && character.liveNumber==0){
    gameConfig.status="gameover"
    mario_gameover.play();
  }

}

// reviver após morrer e fim da música
function reviveAfterMusic(character){
  if( character.live === false && mario.liveNumber !==0 && character.dying===0 ){
    character.live=true;
    character.status="live";
    character.position.x=500;
    character.position.y=40;
    character.velocity.y=0;
  }
}


/* Manter o personagem na tela */
function dontGetOutOfScreen(character){
  
  //Se Mario cair nos buracos 
  if(character.position.y>gameConfig.screenY&&character.live && character==mario){
  	die(mario);
  }

  if(character.position.x>gameConfig.screenX-(character.width*0.5)){
  	character.position.x=gameConfig.screenX-(character.width*0.5);
  }else if(character.position.x<character.width*0.5){
    if(character==mario){
      character.position.x=character.width*0.5;
    }else{ 
      character.live=false; 
    }
  }

}

/*=====  Fim das configurações e controles do personagem ======*/


/*=============================================
=          Controles e configurações do inimigo          =
=============================================*/


function enemys(enemys){
    enemys.forEach(function(enemy){
      stateOfEnemy(enemy);
	    positionOfEnemy(enemy);
	    enemy.position.x-=gameConfig.enemyMoveSpeed;
  });
} 

// Verificar staus do inimigo
function stateOfEnemy(enemy){
  if (enemy.live==false||enemy.position.y>gameConfig.screenY+50){
    enemy.position.x=random(gameConfig.screenX*1.5,2*gameConfig.screenX+50);
    enemy.position.y=random(gameConfig.screenY*0.35,gameConfig.screenY*0.75);
    enemy.live=true;
  }
}

/* Permitir que o inimigo fique sobre objetos */
function positionOfEnemy(enemy){

	platforms.forEach(function(element){ enemyStandOnObjs(enemy, element); });
	bricks.forEach(function(element){ enemyStandOnObjs(enemy, element);});
  pipes.forEach(function(element){ enemyStandOnObjs(enemy, element); })
	
	enemy.position.y+=gameConfig.gravityEnemy;

	dontGetOutOfScreen(enemy);
}


/* Observar se obj1 está sobre obj2, para verificar se está sobre um objeto*/
function enemyStandOnObjs(obj1,obj2){
  
  var obj1_Left=leftSide(obj1);
  var obj1_Right=rightSide(obj1);
  var obj1_Up=upSide(obj1);
  var obj1_Down=downSide(obj1);

  var obj2_Left=leftSide(obj2);
  var obj2_Right=rightSide(obj2);
  var obj2_Up=upSide(obj2);
  var obj2_Down=downSide(obj2);

  if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
    // println("SIM");
    obj1.velocity.y = 0;
    obj1.position.y=obj2_Up-(obj1.height);
  }
}



/*=====  Fim das configurações e controles do inimigo ======*/


/*===================================
=            Ambiente            =
===================================*/

// chamar todas as funções environmentScroll (rolagem de ambiente) 
function moveEnvironment(character){
  var environmentScrollingSpeed=gameConfig.moveSpeed*0.3; 
  
  if(gameConfig.status==='play'){
    environmentScrolling(platforms,environmentScrollingSpeed);
    environmentScrolling(bricks,environmentScrollingSpeed);
    environmentScrolling(clouds,environmentScrollingSpeed*0.5);
    environmentScrolling(mountains,environmentScrollingSpeed*0.3); 
    environmentScrolling(pipes,environmentScrollingSpeed); 
    environmentScrolling(coins,environmentScrollingSpeed); 
    environmentScrolling(enemyMushrooms,environmentScrollingSpeed); 
    character.position.x-=environmentScrollingSpeed;
  }
}

// deslize elementos diferentes na tela
function environmentScrolling(group,environmentScrollingSpeed){
  group.forEach(function(element){
    if(element.position.x>-50){
      element.position.x-=environmentScrollingSpeed;
    }else{
      element.position.x=gameConfig.screenX+50;
      
      //Se o grupo for bricks (blocos), gere novas posições aleatórias de y
      if(group===bricks){
        element.position.y=random(gameConfig.screenY*0.35,gameConfig.screenY*0.75);
      }

      //se o grupo for bricks (blocos) ou mountains (montanhas), gere novas posições aleatórias de x
      if(group===pipes||group===mountains){
        element.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
      }

      //se o grupo for clouds (nuvens), gere novas posições aleatórias de x & y
      if(group===clouds){
        element.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
        element.position.y=random(0,gameConfig.screenY*0.5);
        element.scale=random(0.3,1.5);
      }

      if(group===coins){
        element.position.x=random(0,gameConfig.screenX)+gameConfig.screenX;
        element.position.y=random(gameConfig.screenY*0.2,gameConfig.screenY*0.8);
      }

    }

  })
}

/*=====  Fim do ambiente  ======*/


/*=====================================
=            Para Debugs            =
=====================================*/

/* para posição do personagem */
function debugging(character){
	strokeWeight(1);
	fill(255);
	textSize(12);
  text(character.dying, 20,20);
	text(gameConfig.status, 20,80);
	// text("v: "+character.velocity.y,150,20);
	noFill();
	// outline(tube01);
	stroke(251);
	strokeWeight(2);
	outline(character);

	pipes.forEach(function(element){ outline(element); });
  enemyMushrooms.forEach(function(element){ outline(element); });

}


// calcular pontos de cada jogo
function scores(character){

  strokeWeight(0);
  fill(255, 255, 255, 71);
  textSize(40);

  gameConfig.scores=character.coins+character.kills+gameConfig.timeScores;


  if(character.live&&gameConfig.status==='play') gameConfig.timeScores+=0.05;
  
  text("Pontos: "+round(gameConfig.scores),20,40);
  text("Vidas: "+character.liveNumber,20,80);

  if(mario.live==false && mario.liveNumber!=0){
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);
    
    strokeWeight(7);
    noFill();
    
    stroke(255);
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,150,150)

    stroke("red");
    var ratio=(character.liveNumber/gameConfig.initialLifes);
    arc(gameConfig.screenX/2,gameConfig.screenY/2-30,150,150, PI+HALF_PI,(PI+HALF_PI)+(TWO_PI*ratio));
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER);
    textSize(40);
    text(round(character.liveNumber),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("Vidas",gameConfig.screenX/2,gameConfig.screenY/2);

    
  }


}

/* destaque do objeto*/
function outline(obj){ rect(leftSide(obj),upSide(obj),rightSide(obj)-leftSide(obj),downSide(obj)-upSide(obj));}

/* obter cada direção do objeto*/
function leftSide(obj){ return obj.position.x-(obj.width/2);}
function rightSide(obj){ return obj.position.x+(obj.width/2);}
function upSide(obj){ return obj.position.y-(obj.height/2);}
function downSide(obj){ return obj.position.y+(obj.height/2);}

/*=====  Fim dos Debugs  ======*/


