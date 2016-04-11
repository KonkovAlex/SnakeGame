/**
 * Created by Aleksei on 14.03.2016.
 */

KEYS = {
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down'
};

function SnakeGame(workField, startSpeed, mst){
    var self = this;
    self.running = false;
    self.speed = startSpeed;
    self.maxSpeedTimeout = mst;
    self.workField = workField;
    self._moveIntervalId = undefined;
    self.snake = new Snake([{x:1, y:1}], self.workField);
    self.extraSpeed = 0;
    self.max_bonuses = 5;
    self.score = 0; // counts like snake.body.length()*self.speed
    self.scoreRecord = self.score;
    self.mouses = [];
    self.poisons = [];
    self.lifes = [];
    self.start = function (){
        if (!self.running) {
            self._moveIntervalId = window.setInterval(self.snake.move(self.onSnakeStack), self.speed);
            self.running = true
        }
    };
    self.stop = function(){
        if (self.running){
            window.clearInterval(self._moveIntervalId);
            self.running = false
        }
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

    self.finish = function(isVictory){
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
        //    add mouse drop 
        } else if (hasClass('mouse_cell')){

        }
    };

    self.addPoison = function(){};
    self.addMouse = function(){};
    self.addLife = function(){};

    self.poisonEaten = function(){};
    self.lifeEaten = function(){};
    self.mouseEaten = function(){};
    self.restart = function(){};

    self.createBonus = function(){

    };

}


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
