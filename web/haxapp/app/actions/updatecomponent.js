

haxapp.app.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.updatecomponent.getAddComponentCallback = function(app,generator,optionalInitialValues,optionalComponentOptions) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getActiveWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.updatecomponent.getDialogLayout(workspaceUI,generator,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            
            //need to test if fields are valid!

            var actionResponse =  generator.createComponent(workspaceUI,result,optionalComponentOptions);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        haxapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

haxapp.app.updatecomponent.getUpdateComponentCallback = function(component,generator) {
    
    var createCallback = function() {
        
        var workspaceUI = component.getWorkspaceUI();       
        var initialValues = component.getPropertyValues();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.updatecomponent.getDialogLayout(workspaceUI,generator,false,initialValues);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {
            
            //see if there were no changes
            var change = false;
            for(var key in newValues) {
                if(newValues[key] !== initialValues[key]) change = true;
            }
            if(!change) {
                return true;
            }
            
            //need to test if fields are valid!

            //update
            var actionResponse = component.updatePropertyValues(initialValues,newValues);
              
            //print an error message if there was an error
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        haxapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

//this is for a create or update dialog
haxapp.app.updatecomponent.getDialogLayout = function(workspaceUI,generator,doCreate,initialValues) {
    
    var additionalLines = hax.util.deepJsonCopy(generator.propertyDialogLines);  
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + generator.displayName;
    }
    else {
        titleLine.title = "Update " + generator.displayName; 
    }
    lines.push(titleLine);

    var parentLine = {};
    parentLine.type = "dropdown";
    parentLine.heading = "Folder: ";
    parentLine.entries = workspaceUI.getFolderList();
    parentLine.resultKey = "parentKey"; 
    lines.push(parentLine);

    var nameLine = {};
    nameLine.type = "inputElement";
    nameLine.heading = "Name: ";
    nameLine.resultKey = "name";
    lines.push(nameLine);
    
    //add additioanl lines, if applicable
    if(additionalLines) {
        for(var i = 0; i < additionalLines.length; i++) {
            lines.push(additionalLines[i]);
        }
    }

    //submit
    var submitLine = {};
    submitLine.type = "submit";
    if(doCreate) {
        submitLine.submit = "Create";
    }
    else {
        submitLine.submit = "Update";
    }
    submitLine.cancel = "Cancel";
    lines.push(submitLine);
    
    //set the initial values
    if(initialValues) {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.resultKey) {
                line.initial = initialValues[line.resultKey];
            }
        }
    }
    
    return dialogLayout;
}

//=====================================
// Action
//=====================================

//action is in the component generator





