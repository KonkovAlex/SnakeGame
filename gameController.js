/**
 * Created by Aleksei on 14.03.2016.
 */

KEYS = {
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down'
};

function SnakeGame(workField, startSpeed, fiveRecords){
    var self = this;
    self.running = false;
    self.workField = workField;
    self.startSpeed = startSpeed;
    self.__maxSpeed = 100;
    self.__minSpeed = 5;
    self.currentSpeed = self.startSpeed;

    if (fiveRecords && fiveRecords.length == 5){
        self.fiveRecords = fiveRecords
    } else {
        self.fiveRecords = [0,0,0,0,0];
    }
    self.score = 0; // counts like snake.body.length()*self.speed

    self.max_bonuses = 5;
    self.mouses = [];
    self.bonuses = [];
    self.newBonusInterval = 10000;

    self.initialize = function(){
        var snakeSpeed = self.convertTimeoutSpeed(self.currentSpeed);
        self.snake = new Snake({x:1, y:1}, self.workField, 3, snakeSpeed, self.onSnakeStack);
        self.runMany(self.addMouse, 3);
        self.runMany(self.addBonus, 5);
    };
    self.initialize();

    self.startAll = function (){
        if (!self.running) {
            self.running = true;
            self.snake.startMoving();
            self._freezeMouses(false);
            self._freezeBonuses(false);
            self.setBonusAddingOn(true);
        }
    };

    self.pauseAll = function(){
        if (self.running){
            self.running = false;
            self.snake.stopMoving();
            self._freezeMouses(true);
            self._freezeBonuses(true);
            self.setBonusAddingOn(false);
        }
    };

    self._freezeMouses = function(val){
        var operation = 'freeze' ? val : 'unfreeze';
        for (var m in self.mouses){
            m[operation]()
        }
    };
    self._freezeBonuses = function(val){
        var operation = 'freeze' ? val : 'unfreeze';
        for (var b in self.bonuses){
            b[operation]();
        }
    };
    self.setBonusAddingOn = function(val){
        if (self.bonusIntervalId){
            window.clearInterval(self.bonusIntervalId);
            self.bonusIntervalId = undefined;
        }
        if (val){
            self.bonusIntervalId = window.setInterval(self.addBonuses, self.newBonusInterval)
        }
    };
    self.addBonuses = function(){

    };

    self.finish = function(){
        self.stop();
        if (isVictory){
            alert('Victory! Congratulations!!!\n Play one more time?')
        } else if (attempts > 0){
            attempts--;
            alert('You have '+ self.attempts + ' attempts remaining. Game continue...')
        } else
        {
            alert('Sorry, You loose :( \nGameOver')
        }
    };
    self.restartGame = function(){
        self.finish();
        self.initialize()
    };

    self.onSnakeStack = function(message, step_cell){
        switch (message){
            case 'gameOver':
                self.gameOver();
                break;
            case 'lifeLost':
                self.lifeLost();
                break;
            case 'outOfField':
                alert("You're out of field space :(");
                break;
            case 'ok':
                self.checkSnakeMove(step_cell)
        }
    };


    self.changeSpeed = function(newSpeed, startOk){
        self.stop();
        self.speed = newSpeed;
        if (startOk) {
            self.start()
        }
    };

    self.onKeyPress = function(pressedKey){
        if (pressedKey in KEYS.values){
            if (!self.running){
                self.start()
            }
            self.snake.changeCurse(KEYS[pressedKey])
        }
    };
    self.setExtraSpeed = function(val){
        self._extraSpeed = val;
        self.changeSpeed()
    };
    self.checkSnakeMove = function(cell){
        if (self._matrix.hasCellClass(cell, 'poison_cell')){
            self.poisonEaten(cell);
        } else if (self._matrix.hasCellClass(cell, 'life_cell')){
            self.lifeEaten(cell);
        } else if (self._matrix.hasCellClass(cell, 'mouse_cell')){
            self.mouseEaten(cell);
        }
    };
    self.checkMouseMove = function(mouseCell, stackCell){
        var hasClass = function(cls){
            return self._matrix.hasCellClass(stackCell, cls)
        };
        if (hasClass('poison_cell')){
        //    kill mouse and poison
        } else if (hasClass('life_cell')){
        //    add mouse drop life
        } else if (hasClass('mouse_cell')){

        }
    };
    self.runMany = function(amount, bonusFunc){
        for (var i = 0; i < amount; i++){
            bonusFunc();
        }
    };
    self._addPoison = function(){};
    self._addLife = function(){};
    self.addMouse = function(){
        var mouseBonusSpeed = 20;
        var newMouse = Mouse(self._matrix.getRandomFreeCell(), self._matrix, self.convertTimeoutSpeed(self.startSpeed+mouseBonusSpeed), self.checkMouseMove );
        self.mouses.push(newMouse)
    };
    self.addBonus = function(){
    };

    self.poisonEaten = function(){};
    self.lifeEaten = function(){};
    self.mouseEaten = function(mouseCell){
        self.snake.eatFood()
    };
    self.convertTimeoutSpeed = function(timeout){
        return 10000/timeout
    };
};


window.onload = function(){
    var m1 = new Matrix ('#matrix1', 20, 20);
    m1.create();
    var game = new SnakeGame(m1, 200);
    var input = $('inp1');
    game.start();
    input.oninput = game.setExtraSpeed;
    document.onkeydown = game.onKeyPress;

    //function(){
    //    snakeSpeed = 520-input.value;
    //    window.clearInterval(document.intervalId)
    //};
};
