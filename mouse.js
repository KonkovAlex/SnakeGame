/**
 * Created by Aleksei on 23.03.2016.
 */
function Mouse(cell, matrix, startSpeed, moveStackCallback) {
    //Mouse cell jumps by field.
    // If it gets stack (meet cell which isn't free) it calls moveStackCallback
    var self = this;

    self._matrix = matrix;
    self._cell = cell;
    self.moveCallback = moveStackCallback;
    self._curses = [
        {_curse:'Up',    cssClass: 'mouse_up'},
        {_curse:'UpRight',   cssClass: 'mouse_up_right'},
        {_curse:'Right', cssClass: 'mouse_right'},
        {_curse:'DownRight', cssClass: 'mouse_down_right'},
        {_curse:'Down',  cssClass: 'mouse_down'},
        {_curse:'DownLeft',  cssClass: 'mouse_down_left'},
        {_curse:'Left',  cssClass: 'mouse_left'},
        {_curse:'UpLeft',    cssClass: 'mouse_up_left'}
    ];
    self._curse = self.getRandomCourse();
    self.movingIntervalId = undefined;
    self.create(startSpeed);
    self.setMoving = function(speed){
        if (self.movingIntervalId){
            clearInterval(self.movingIntervalId)
        }
        self.movingIntervalId = setInterval(self.move, speed);
    };


    self.create = function(startSpeed){
        self.setMouseClass(self._cell);
        self.setMoving(startSpeed);
    };

    self.die = function(){
        if (self.movingIntervalId){
            clearInterval(self.movingIntervalId)
        }
        self._matrix.setCellFree(self._cell)
    };

    self.move = function(){
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
            if (self._matrix.checkIsOutOfField(nextCell)){
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
        self._matrix.addCellClass(cell, 'mouse_cell');
        self._matrix.addCellClass(cell, self._curse.cssClass )
    };
};

function BonusCell(cell, matrix, bonusClass, timeOut, death_callback){
    var self = this;
    self._matrix = matrix;
    self._cell = cell;
    self.bonusClass = bonusClass;
    self.disablingClass = 'disappearing_cell';

    self._togglingTime = 4000;
    self.create(timeOut);

    self.create = function(cell, cssClass, timeOut){
        self._matrix.addCellClass(cell, cssClass);
        if (timeOut){
            self.aliveTimerId = setTimeout(self.destroy, timeOut);
            if (timeOut>self._togglingTime){
                setTimeout(self.startToggling, timeOut - self._togglingTime)
            }
        }
    };
    self.startToggling = function(){
        self.toggleIntervalId = setInterval(self.toggle, 300)
    };

    self.toggle = function(){
        if (self._matrix.hasCellClass(self._cell, self.disablingClass)){
            self._matrix.removeCellClass(self._cell, self.disablingClass);
        } else {
            self._matrix.addCellClass(self._cell, self.disablingClass)
        }
    };
    self.destroy = function(){
        if (self.toggleIntervalId){
            clearInterval(self.toggleIntervalId);
            self.toggleIntervalId = undefined;
        }
        if (self.aliveTimerId){
            clearTimeout(self.aliveTimerId);
            self.aliveTimerId = undefined;
        }
        self._matrix.setCellFree(self._cell);
        death_callback(cell);
    };
};