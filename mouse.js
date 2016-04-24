/**
 * Created by Aleksei on 23.03.2016.
 */
function Mouse(cell, matrix, startMoveInterval, moveStackCallback) {
    //Mouse cell jumps by field.
    // If it gets stack (meet cell which isn't free) it calls moveStackCallback
    var self = this;

    self._matrix = matrix;
    self._cell = cell;
    self.moveCallback = moveStackCallback;
    self._curses = [
        {_curse:'Up',    cssClass: 'mouse_up'},
        {_curse:'UpRight',   cssClass: 'mouse_ur'},
        {_curse:'Right', cssClass: 'mouse_right'},
        {_curse:'DownRight', cssClass: 'mouse_dr'},
        {_curse:'Down',  cssClass: 'mouse_down'},
        {_curse:'DownLeft',  cssClass: 'mouse_dl'},
        {_curse:'Left',  cssClass: 'mouse_left'},
        {_curse:'UpLeft',    cssClass: 'mouse_ul'}
    ];
    self.movingIntervalId = undefined;


    self.freeze = function(){
        if (self.movingIntervalId){
            window.clearInterval(self.movingIntervalId);
            self.movingIntervalId = undefined
        }
    };
    self.unfreeze = function(){
        if (self.__speed && !self.movingIntervalId){
            self.movingIntervalId = window.setInterval(self.__move, self.__speed)
        }
    };
    self.changeSpeed = function(speedInterval, letGo){
        self.__speed = speedInterval;
        self.freeze();
        if (letGo){
            self.unfreeze();
        }
    };

    self.die = function(){
        self.freeze();
        self._matrix.setCellFree(self._cell)
    };

    self.__move = function(){
        var nextCell = self.changeCurseRandomly();
        if (self._matrix.isCellFree(nextCell)){
            self.move(nextCell)
        } else {
            self.moveCallback(self._cell, nextCell)
        }
    };

    self.getNextCell = function () {
        var x = self._cell.x;
        var y = self._cell.y;

        switch (self._curse._curse) {
            case 'Up':
                y--; break;
            case 'UpRight':
                y--; x++; break;
            case 'Right':
                x++; break;
            case 'DownRight':
                x++; y++; break;
            case 'Down':
                y++; break;
            case 'DownLeft':
                y++; x--; break;
            case 'Left':
                x--; break;
            case 'UpLeft':
                x--; y--; break;
        }
        return {x: x, y: y}
    };

    self.move = function(cell){
        self._matrix.setCellFree(self._cell);
        self.setMouseClass(cell);
        self._cell = cell
    };

    self.changeCurseRandomly = function(){
        var notAvailableCurses = [];
        var nextCell;
        while (true){
            self._curse = self.getRandomCourse();
            if (self._curse in notAvailableCurses)
                continue;
            nextCell = self.getNextCell();
            if (self._matrix.isOutOfField(nextCell)){
                notAvailableCurses.push(self._curse)
            } else break
        }
        self.move(self._cell);
        return nextCell
    };

    self.getRandomCourse = function(){
        var currCurseInd = self._curses.indexOf(self._curse);
        // mouse doesn't goes back :)
        var swerving  = self._matrix.getRandomInt(0,4) - 2;
        var newCurseInd = currCurseInd + swerving;
        var _cursesLength = self._curses.length;
        if (newCurseInd < 0){
            newCurseInd += _cursesLength
        } else if(newCurseInd > _cursesLength) {
            newCurseInd -= _cursesLength
        }
        return self._curses[newCurseInd]
    };
    self.setMouseClass = function(cell){
        self._matrix.addCellClass(cell, 'mouse');
        self._matrix.addCellClass(cell, self._curse.cssClass )
    };
    self._curse = self.getRandomCourse();
    self.setMouseClass(self._cell);
    self.changeSpeed(startMoveInterval);
}

var BonusCell = function(cell, matrix, bonusClass, timeOut, death_callback){
    var self = this;
    self._matrix = matrix;
    self._cell = cell;
    self.bonusClass = bonusClass;
    self.disablingClass = 'disappearing_cell';
    self.timeOut = timeOut;
    self._togglingTime = 4000;
    self.deathCallback = death_callback;


    self.create = function(){
        //if timeout returns false it wont specify alive timeout
        self._matrix.addCellClass(self._cell, self.bonusClass);
        self.setAliveTimeout();

    };
    self.setAliveTimeout = function(){
        if (self.timeOut){
            self.aliveTimerId = window.setTimeout(self._die, self.timeOut);
            if (self.timeOut<self._togglingTime){
                window.setTimeout(self.startToggling, self.timeOut - self._togglingTime)
            }
            self._startTime = window.performance.now()
        }
    };
    self.startToggling = function(){
        self.toggleIntervalId = setInterval(self.toggle, 300)
    };

    self.freeze = function(){
        if (self.timeOut){
            var aliveTime = window.performance.now() - self._startTime;
            self.timeOut -= aliveTime;
            self.clearTimers()
        }
    };
    self.unfreeze = function(){
        if (self.timeOut){
            self.setAliveTimeout()
        }
    };

    self.toggle = function(){
        if (self._matrix.hasCellClass(self._cell, self.disablingClass)){
            self._matrix.removeCellClass(self._cell, self.disablingClass);
        } else {
            self._matrix.addCellClass(self._cell, self.disablingClass)
        }
    };
    self.clearTimers = function(){
        if (self.toggleIntervalId){
            clearInterval(self.toggleIntervalId);
            self.toggleIntervalId = undefined;
        }
        if (self.aliveTimerId){
            clearTimeout(self.aliveTimerId);
            self.aliveTimerId = undefined;
        }
    };

    self._die =  function(){
        self.die();
        self.deathCallback(self._cell);
    };
    self.die = function(){
        self.clearTimers();
        self._matrix.setCellFree(self._cell);
    };
    self.create();
};