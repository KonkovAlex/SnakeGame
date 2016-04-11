/**
 * Created by Aleksei on 14.03.2016.
 */

var Matrix = function(containerId, rowCount, colCount){
    var self = this;
    self._matrix = $(containerId);
    self.maxRows = rowCount;
    self.maxCols = colCount;
    self.create = function () {
        var n = self.maxRows * self.maxCols;
        for (var i = 0; i<n; i++){
            self._matrix.append('<div class="_cell"></div>');
        }
    };
    self.getCellInd = function(cell){
        return cell.y*self.maxCols + cell.x
    };

    self.getCell = function(cell){
        var ind = self.getCellInd(cell);
        return self._matrix.find('._cell:eq('+ind+')')
    };

    self.isCellFree = function(cell){
        var $cell = self.getCell(cell);
        var classes = $cell.attr('class');
        return classes == '_cell';
    };

    self.setCellFree = function(cell){
        var $cell = self.getCell(cell);
        $cell.attr('class', '_cell')
    };

    self.hasCellClass = function(cell, cName){
        var $cell = self.getCell(cell);
        return $cell.hasClass(cName)
    };

    self.setSnakeCell = function(cell, val){
        var $cell = self.getCell(cell);
        if (val){
            $cell.addClass('snake_cell');
        } else {
            $cell.removeClass('snake_cell');
        }
    };

    self.addCellClass = function(cell, className){
        var $cell = self.getCell(cell);
        $cell.addClass(className)
    };
    self.removeCellClass = function(cell, className){
        var $cell = self.getCell(cell);
        $cell.removeClass(className)
    };

    self.getRandomFreeCell = function(){
        var cell;
        while (true){
            cell = {
                x: self.getRandomInt(0, self.maxCols),
                y: self.getRandomInt(0, self.maxRows)
            };
            if (self.isCellFree(cell)){
                return cell
            }
        }
    };

    self.checkIsOutOfField = function(cell) {
        if (0 > cell.y || cell.y >= self.maxCols)
            return false;
        else return !(0 > cell.x || cell.x >= self.maxRows);
    };
    self.getRandomInt = function(min, max){
        return Math.floor(Math.random()*(max-min+1)) + min;
    }
};