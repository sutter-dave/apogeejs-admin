/** This method shows the doalog to set the arg list for a function. */
visicomp.app.visiui.dialog.showUpdateArgListDialog = function(object,onSaveFunction) {

    var dialog = new visicomp.visiui.Dialog({"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Argument List"}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Argument List:"));
    var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    inputElement.value = object.getArgList().join(",");
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onSave = function() {
        //parse the arg list into an array
        var argListString = inputElement.value.trim();
        var argList = argListString.split(",");
        for(var i = 0; i < argList.length; i++) {
            argList[i] = argList[i].trim();
        }
        
        var result = onSaveFunction(argList);
        
        if(result.success) {
            dialog.hide();
        }
        else {
            alert("There was an error updating the arg list: " + result.msg);
        }
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onSave}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}

