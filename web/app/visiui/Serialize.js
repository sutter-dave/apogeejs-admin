/* 
 * Serialization and deserialization are put in the app because the UI is holding
 * special information to create and edit the objects, as opposed to the data that
 * is held by thee objects themselves. The child object allows for the object to store 
 * some unspecified data to be used by the editor.
 * 
 * IO am not 100% sure about this right now, but it is the most sesible thign for the time being.
 */

/** PLAN
 * - read all the objects
 * - create all named objects
 * - do a single multi object update event to set all data as needed 

/** This is used for saving the workspace. */
visicomp.app.visiui.workspaceToJson = function(app, workspace) {
    var json = {};
    json.name = workspace.getName();
    json.fileType = "visicomp workspace";
    
    //links - this is part of app, not workspace, but for now we sav it with workspace!!!
    var jsLinks = app.getJsLinks();
    if((jsLinks)&&(jsLinks.length > 0)) {
        json.jsLinks = jsLinks;
    }
    var cssLinks = app.getCssLinks();
    if((jsLinks)&&(jsLinks.length > 0)) {
        json.cssLinks = cssLinks;
    }
    
    //children
    json.data = {};
	var childMap = workspace.getRootFolder().getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
		json.data[key] = visicomp.app.visiui.childToJson(child);
	}
    
    
    return json;
}

/** This mehtod serializes a child object. 
 * @private */
visicomp.app.visiui.childToJson = function(child) {
    var json = {};
    json.name = child.getName();
    json.type = child.getType();
    
    var temp;
    
    switch(json.type) {
        case "folder":
            json.children = {};
            var childMap = child.getChildMap();
            for(var key in childMap) {
                var childChild = childMap[key];
                json.children[key] = visicomp.app.visiui.childToJson(childChild);
            }
            break;
            
        case "table":
            temp = child.getFunctionBody();
            if(temp) {
                json.functionBody = temp;
                json.supplementalCode = child.getSupplementalCode();
            }
            else {
                json.data = child.getData();
            }
            break;
            
        case "function":
            json.argParens = child.getArgParensList();
            json.functionBody = child.getFunctionBody();
			if((json.functionBody === null)||(json.functionBody === undefined)) json.functionBody = "";
            json.supplementalCode = child.getSupplementalCode();
            break;
            
        case "control":
            json.html = child.getHtml();
            json.onLoadBody = child.getOnLoadBody();
            json.supplementalCode = child.getSupplementalCode();
            json.css = child.getCss();
            break;
            
    }
    
    return json;
}


/** This is used for saving the workspace. */
visicomp.app.visiui.workspaceFromJson = function(app, json) {
    var name = json.name;
    var fileType = json.fileType;
	if((fileType !== "visicomp workspace")||(!name)) {
		alert("Error openging file");
		return null;
	}
    
    //add links
// we really need to wait for them to load
    if(json.jsLinks) {
        app.setJsLinks(json.jsLinks);
    }
    if(json.csssLinks) {
        app.setCssLinks(json.cssLinks);
    }
	
	//create the workspace
    app.createWorkspace(name);
	var workspace = app.getWorkspace();
    var workspaceUI = app.getWorkspaceUI();
	
	//create children
	var parent = workspace.getRootFolder();
	var childMap = json.data;
	var dataToUpdate = {};
    dataToUpdate.members = [];
    dataToUpdate.controls = [];
	for(var key in childMap) {
		var childJson = childMap[key];
		visicomp.app.visiui.childFromJson(workspaceUI, parent, childJson, dataToUpdate);
	}
    
    //set the data on all the objects
    var result;
    if(dataToUpdate.members.length > 0) {
        result = visicomp.core.updatemember.updateObjects(dataToUpdate.members);
            
        if(!result.success) {
            return result;
        }
    }
    
    for(var i = 0; i < dataToUpdate.controls.length; i++) {
        var controlData = dataToUpdate.controls[i];
        result = visicomp.core.updatecontrol.updateObject(controlData.control,
            controlData.html,
            controlData.onLoadBody,
            controlData.supplementalCode,
            controlData.css);
            
        if(!result.success) {
            return result;
        }
    }
    
//figure out a better return
	return result;
}

/** This mehtod serializes a child object. 
 * @private */
visicomp.app.visiui.childFromJson = function(workspaceUI,parent,childJson,dataToUpdate) {
    var name = childJson.name;
    var type = childJson.type;
	
	var childObject;
	var childUpdateData;
    var result;
    
	//create the object
    switch(type) {
        case "folder":
            result = visicomp.core.createfolder.createFolder(parent,name);
            
            //add the contents of this folder
            if(result.success) {
                childObject = result.folder;
                var grandchildrenJson = childJson.children;
                for(var key in grandchildrenJson) {
                    var grandchildJson = grandchildrenJson[key];
                    visicomp.app.visiui.childFromJson(workspaceUI, childObject, grandchildJson, dataToUpdate);
                }
            }
            else {
                throw visicomp.core.util.createError("Error creating folder " + name); 
            }
            break;
            
        case "table":
			result = visicomp.core.createtable.createTable(parent,name);

            if(result.success) {
                //lookup the child and create the update event objecct for it
                childObject = result.table;
                childUpdateData = visicomp.core.updatemember
            }
            else {
                throw visicomp.core.util.createError("Error creating table " + name); 
            }
            break;
            
        case "function":
			var argParens = childJson.argParens;
            result = visicomp.core.createfunction.createFunction(parent,name,argParens);
			
            if(result.success) {
                //lookup the child and create the update event objecct for it
                childObject = result.functionObject;
                childUpdateData = visicomp.core.updatemember.getUpdateDataWrapper(childObject,undefined,childJson.functionBody,childJson.supplementalCode);
                dataToUpdate.members.push(childUpdateData);
            }
            else {
                throw visicomp.core.util.createError("Error creating function " + name); 
            }
            break;
            
        case "control":
			result = visicomp.core.createcontrol.createControl(parent,name);
			
            if(result.success) {
                //lookup the child and create the update event objecct for it
                childObject = result.control;
                childUpdateData = {};
                childUpdateData.control = childObject;
                childUpdateData.html = childJson.html;
                childUpdateData.onLoadBody = childJson.onLoadBody;
                childUpdateData.supplementalCode = childJson.supplementalCode;
                childUpdateData.css = childJson.css;
                dataToUpdate.controls.push(childUpdateData);
            }
            else {
                throw visicomp.core.util.createError("Error creating control " + name); 
            }
            break;
            
    }
}

