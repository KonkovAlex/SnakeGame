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
        self.achievedRecords = fiveRecords
    } else {
        self.achievedRecords = [0,0,0,0,0];
    }
    self.score = 0; // counts like snake.body.length()*self.speed

    self.max_bonuses = self.workField.area*0.02;  //2% of all field area
    self.max_mouses = self.workField.area*0.015;
    self.mouses = [];
    self.bonuses = [];
    self.newBonusInterval = 10000;

    self.initialize = function(){
        var snakeSpeed = self.convertTimeoutSpeed(self.currentSpeed);
        self.snake = new Snake({x:1, y:1}, self.workField, 3, snakeSpeed, self.onSnakeStack);
        self.runMany(self.addMouse, 4);
        self.runMany(self.addBonus, 5);
    };

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
        var operation = val ? 'freeze' : 'unfreeze';
        for (var m in self.mouses){
            m[operation]()
        }
    };
    self._freezeBonuses = function(val){
        var operation =val ? 'freeze' : 'unfreeze';
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
            self.bonusIntervalId = window.setInterval(function(){
                if (self.bonuses.length <= self.max_bonuses){
                    self.addBonus()
                }
                if (self.mouses.length <= self.max_mouses) {
                    self.addMouse()
                }
            }, self.newBonusInterval)
        }
    };

    self.addBonus = function(){
        //possibility of throwing life bonus is equal 20%
        var simple_array = [0,0,0,1,0];
        var bonus_ind = self.getRandInt(0, simple_array.length);
        var bonusName = simple_array[bonus_ind] ? 'life' : 'poison';
        var newBonus = new BonusCell(self.workField.getRandomFreeCell(),self.workField, bonusName, 50000, self.killBonus);
        self.bonuses.push(newBonus);
    };
    self.addMouse = function(){
        var mouseBonusSpeed = 20;
        var freeCell = self.workField.getRandomFreeCell();
        var m_speed =  self.convertTimeoutSpeed(self.startSpeed+mouseBonusSpeed);
        var newMouse = new Mouse(freeCell, self.workField, m_speed, self.checkMouseMove);
        self.mouses.push(newMouse)
    };
    self.killBonus = function(cell){
        for (var i=0; i<self.bonuses.length; i++){
            if (self.bonuses[i]._cell === cell){
                self.bonuses[i].die();
                self.bonuses.pop(i);
                break;
            }
        }
    };
    self.killMouse = function(cell){
        for (var i=0; i<self.mouses.length; i++){
            if (self.mouses[i]._cell === cell){
                self.mouses[i].die();
                self.mouses.delete(i);
                break;
            }
        }
    };

    self.finish = function(){
        self.pauseAll();
        self.clearWindow();
        var place = self.getPlace();
        if (place){
            alert('Congratulations!!!\nYou are ' + place +'-th! \nYou can brake this record, try one more time!!!')
        } else {
            alert('Sorry, You loose :( Best results are untouchable\nGameOver')
        }
    };
    self.restartGame = function(){
        self.finish();
        self.initialize()
    };
    self.clearWindow = function(){};
    self.clearAllBonuses = function(){};
    self.clearAllMouses = function(){};

    self.getPlace = function(){
        var recLen = self.achievedRecords.length;
        for (var i = 0; i<=recLen; i++){
            if (self.achievedRecords[i]<self.score){
                self.achievedRecords.splice(i-1, 0, self.score);
                break;
            }
        }
        return i< recLen ? i  : undefined
    };

    self.onSnakeStack = function(message, step_cell){
        switch (message){
            case 'ok':
                break;
            case 'lifeLost':
                alert("You're out of field space :(");
                break;
            case 'outOfField':
                alert("You're out of field space :(");
                break;
            case 'moveStack':
                self.checkSnakeMove(step_cell);
                break;
            case 'gameOver':
                self.finish();
                break;
        }
    };

    self.changeSpeed = function(newSpeed, startOk){
        self.pauseAll();
        self.speed = newSpeed;
        if (startOk) {
            self.startAll()
        }
    };

    self.onKeyPress = function(pressedKey){
        console.log(Object.keys(KEYS));
        if (pressedKey in Object.keys(KEYS)){
            if (!self.running){
                self.startAll()
            }
            self.snake.changeCurse(KEYS[pressedKey])
        }
    };
    self.setExtraSpeed = function(val){
        self._extraSpeed = val;
        self.changeSpeed()
    };
    self.checkSnakeMove = function(cell){
        if (self.workField.hasCellClass(cell, 'poison')){
            self.poisonEaten(cell);
        } else if (self.workField.hasCellClass(cell, 'life')){
            self.lifeEaten(cell);
        } else if (self.workField.hasCellClass(cell, 'mouse')){
            self.mouseEaten(cell);
        }
    };
    self.checkMouseMove = function(mouseCell, stackCell){
        var hasClass = function(cls){
            return self.workField.hasCellClass(stackCell, cls)
        };
        if (hasClass('poison')){
        //    kill mouse and poison
        } else if (hasClass('life')){
        //    add mouse drop life
        } else if (hasClass('mouse')){

        }
    };
    self.runMany = function(bonusFunc, amount){
        for (var i = 0; i < amount; i++){
            bonusFunc();
        }
    };

    self.poisonEaten = function(cell){
        self.snake.dropOneLife();
        self.killBonus(cell);
    };

    self.lifeEaten = function(cell){
        self.snake.addLife();
        self.killBonus(cell)
    };

    self.mouseEaten = function(cell){
        self.score+=self.snake.body.length;
        self.snake.eatFood();
        self.killMouse(cell);
    };


    self.getObjByCell = function(objArray, cell){
        for (var obj in objArray){
            if (obj._cell === cell) return obj
        }
    };

    self.convertTimeoutSpeed = function(timeout){
        return 10000/timeout
    };

    self.getRandInt = function(min, max){
        return self.workField.getRandomInt(min, max);
    };
    self.initialize();
}

$(document).ready(function(){
    var m1 = new Matrix ('#matrix1', 20, 20);
    m1.create();
    var game = new SnakeGame(m1, 200);
    var input = $('inp1');
    input.oninput = game.setExtraSpeed;
    document.onkeydown = function(e){game.onKeyPress(e.keyCode.toString())};
    }
);

