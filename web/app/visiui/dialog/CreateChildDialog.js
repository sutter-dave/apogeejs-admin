/** This method shows a create child dialog. */
visicomp.app.visiui.dialog.showCreateChildDialog = function(objectTitle,app,onCreateFunction) {

////////////////////////////////////////////////////////
//for now, load only the active
//later we should allow for multiple
var workspaceUI = app.getActiveWorkspaceUI();
if(!workspaceUI) {
	alert("No workspace is loaded!");
	return;
}
////////////////////////////////////////////////////////

	var controlMap = workspaceUI.getControlMap();

    var dialogParent = visicomp.visiui.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"New " + objectTitle}));
    content.appendChild(line);
    
    //folder selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Folder:"));
    var select = visicomp.visiui.createElement("select");
    line.appendChild(select);
    for(var key in controlMap) {
		var controlInfo = controlMap[key];
		if(controlInfo.parentContainer) { 
			select.add(visicomp.visiui.createElement("option",{"text":key}));
//			if(key == activeFolderKey) {
//				select.value = key;
//			}
		}
    }
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Name:"));
    var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onCreate = function() {
		var folderKey = select.value;
        var parentObject = controlMap[folderKey].object;
        var objectName = inputElement.value.trim();
        if(objectName.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var closeDialog = onCreateFunction(workspaceUI,parentObject,objectName);
        if(closeDialog) {
            dialog.hide();
        }
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    var coords = dialogParent.getCenterOnPagePosition(dialog);
    dialog.setPosition(coords[0],coords[1]);
}

