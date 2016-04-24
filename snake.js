/**
 * Created by Aleksei on 14.03.2016.
 */


function Snake(startCell, matrix, lifes, startMoveInterval, onStackCallback){
    var self = this;
    self._matrix = matrix;
    self.__lifes = lifes;
    self.moveInterval = startMoveInterval;
    self.__onMoveCallback = onStackCallback;
    self.__cutedTail = undefined;
    self.maxLength = 20;
    self.snakeCellClass = 'snake';
    self._curses = [
        {   title: 'Right',
            tailClass: 'snake_tail_right',
            headClass: 'snake_head_right'
        },
        {   title: 'Up',
            tailClass: 'snake_tail_up',
            headClass: 'snake_head_up'
        },
        {   title: 'Left',
            tailClass: 'snake_tail_left',
            headClass: 'snake_head_left'
        },
        {   title: 'Down',
            tailClass: 'snake_tail_down',
            headClass: 'snake_head_down'
        }
    ];
    self._reservedCurses = self._curses.map(function(el){return el.title});
    self._curse = self._curses[0];
    self._lastreceivedCurses = [];
    self.body = [];
    self.events = {
        gameOver :  'gameOver',
        lifeLost :  'lifeLost',
        outOfField: 'outOfField',
        catchSelf: 'catchSelf',
        moveStack: 'moveStack',
        ok: 'ok'
    };

    self.formStartBody =  function(startCell){
        //Method creates snake with 3 body objects
        self.body = [];
        var bodyCell = startCell;

        function getValidCell(baseCell){
            for (var c in self._curses){
                self._curse = self._curses[c];
                var cell = self.getNextCell(baseCell);
                if (!self._matrix.isOutOfField(cell)) return cell;
            }
            self.destroySnake()
        }
        while (self.body.length < 4){
            self._addBodyPart(bodyCell, false);
            bodyCell = getValidCell(bodyCell)
        }
        self.setBodyHead(true);
        self.setBodyTail(true);
        self.move();
        self.move();
        self.move();

    };

    self.getNextCell = function(baseCell){
        if (!baseCell){
            baseCell = self.body[0].cell
        }
        var x = baseCell.x;
        var y = baseCell.y;
        switch (self._curse.title){
            case 'Up':
                y--; break;
            case 'Down':
                y++; break;
            case 'Right':
                x++; break;
            case 'Left':
                x--; break;
        }
        return {x: x, y: y}
    };

    self.startMoving = function(){
        if (!self._moveIntervalId){
            self._moveIntervalId = window.setInterval(self.move(), self.speed);
        }
    };

    self.stopMoving = function(){
        window.clearInterval(self._moveIntervalId);
        self._moveIntervalId = undefined;
    };

    self._addBodyPart = function(bodyCell, hasFood){
        self.body.unshift({
            cell: bodyCell,
            hasFood: hasFood,
            curse: self._curse
        });
        self._matrix.addCellClass(bodyCell, self.snakeCellClass);
    };

    self.setBodyHead = function(val){
        var bodyPart = self.body[0];
        if (val){
            self._matrix.addCellClass(bodyPart.cell, bodyPart.curse.headClass)
        } else {
            self._matrix.removeCellClass(bodyPart.cell, bodyPart.curse.headClass)
        }
    };

    self.setBodyTail = function(val){
        var bodyPart = self.body.slice(-1)[0];
        if (val){
            self._matrix.addCellClass(bodyPart.cell, bodyPart.curse.tailClass )
        } else {
            self._matrix.removeCellClass(bodyPart.cell, bodyPart.curse.tailClass)
        }
    };

    self.showMouseInside = function(bodyPart, val){
        var cell = bodyPart.cell;
        if (val && bodyPart.hasFood){
            self._matrix.addCellClass(cell, 'snake_mouse_inside')
        } else {
            self._matrix.removeCellClass(cell, 'snake_mouse_inside')
        }
    };

    self.changeCurse = function(newCurse){
        if (!(newCurse in self._reservedCurses))
            return;
        if (self._curse.title == newCurse){
            self.move()
        } else {
            var ind = self._reservedCurses.indexOf(newCurse);
            self._curse = self._curses[ind];
        }
    };

    self.dropOneLife = function(){
        if (self.__lifes>0){
            self.stopMoving();
            self.__lifes --;
            self.__onMoveCallback(self.events.lifeLost);
            self.resetBody();
            alert(self.__lifes + ' lifes left. Press control keys to continue playing ;)')

        } else {
            self.destroySnake();
        }
    };

    self.isCellInBody = function(cell){
        for (var i = 0; i < self.body.length; i++){
            if (_.isEqual(cell, body[i].cell))
                return false;
        }
        return true
    };

    self.move = function(){
        //Snake is moving in all cases, but returns the _cell it has been moved
        var newCell = self.getNextCell();
        if (self._matrix.isOutOfField(newCell)){
            self.__onMoveCallback(self.events.outOfField);
            self.dropOneLife();
        } else if (self._matrix.isCellFree(newCell)){
            self.__move(newCell); //moving without some actions. That's no need to work with events.ok
            self.__onMoveCallback(self.events.ok, newCell)
        } else if (self.isCellInBody(newCell)){
            self.dropOneLife();
            self.__onMoveCallback(self.events.catchSelf)
        } else{
            //moving with little stack :)
            self.__move(newCell);
            self.__onMoveCallback(self.events.moveStack, newCell)

        }
    };
    self.__move = function(nextCell){
        self._shiftHead(nextCell);
        self.cutTail();
    };

    self._shiftHead = function(nextCell){
        self.setBodyHead(false);
        self._addBodyPart(nextCell, false);
        self.setBodyHead(true);
    };


    self.eatFood = function(){
        self.body[0].hasFood = true;
        self.growTail()
    };
    self.growTail = function(){
        self.setBodyTail(false);
        self.body.push(self.__cutedTail);
        self._matrix.addCellClass(self.__cutedTail.cell, self.snakeCellClass);
        self.setBodyTail(true)

    };
    self.cutTail = function(){
        if (self.body.length > 3){
            self.setBodyTail(false);
            self.__cutedTail = self.body.pop();
            self._matrix.setCellFree(self.__cutedTail.cell);
            self.setBodyTail(true);
        }
    };

    self.clearAllTails = function(){
        //call this method when snake lose one life
        while (self.body.length > 3){
            self.cutTail()
        }

    };
    self.resetBody = function(){
        self.clearAllTails()
    };

    self.clearBody = function(){
        _.map(self.body, function(bodyPart){
            self._matrix.setCellFree(bodyPart.cell, true)
        });
        self.body = [];
    };

    self.destroySnake = function(){
        self.stopMoving();
        self.clearBody();
        self.__onMoveCallback(self.events.gameOver);
        alert('Your Snake is DEAD :(\nGame Over')
    };
    self.addLife = function(){
        self.__lifes++
    };
    self.formStartBody(startCell);
}
