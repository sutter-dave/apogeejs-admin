
visicomp.jsonedit.JsonEditArea = function(divElement,initialValue,isEditable) {
    this.body = divElement;
	this.isEditable = isEditable;
    
	this.valueEntry = new visicomp.jsonedit.ValueEntry(this,initialValue,this.isEditable);
    this.valueEntry.setExpanded(true);
 
	this.formatBody();
}

visicomp.jsonedit.JsonEditArea.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

visicomp.jsonedit.JsonEditArea.prototype.getElement = function() {
	return this.body;
}

visicomp.jsonedit.JsonEditArea.prototype.getParentValueObject = function() {
	return undefined;
}

visicomp.jsonedit.JsonEditArea.prototype.getIndentLevel = function() {
	return 0;
}

visicomp.jsonedit.JsonEditArea.prototype.formatBody = function() {
    var elementList = this.valueEntry.getElementList();
    for(var i = 0; i < elementList.length; i++) {
        this.body.appendChild(elementList[i]);
    }
    
    this.loadContextMenu();
}


visicomp.jsonedit.JsonEditArea.prototype.loadContextMenu = function() {

    var instance = this;
    var element = this.body;
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new visicomp.visiui.MenuBody();
        
        contextMenu.addCallbackMenuItem("Get Value",function() {alert(JSON.stringify(valueEntry.getCurrentValue()));});
        
		if(this.isEditable) {
			if(valueType == "value") {
				contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.valueToObject()});
				contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.valueToArray()});
			}
			else if(valueType == "object") {
				contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
				contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.objectToArray()});
			}
			else if(valueType == "array") {
				contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
				contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.arrayToObject()});
			}
		}
        
        visicomp.visiui.Menu.showContextMenu(contextMenu,event);
    }
  
}

visicomp.jsonedit.JsonEditArea.prototype.updateValueElements = function() {
    //remove all from element
	visicomp.core.util.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}



