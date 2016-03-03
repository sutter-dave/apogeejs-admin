/** This is the workspace. */
visicomp.core.Workspace = function(nameOrJson,actionResponseForJson) {
    //base init
    visicomp.core.EventManager.init.call(this);
    visicomp.core.Owner.init.call(this);
    
    //set the context manager
    this.contextManager = new visicomp.core.ContextManager(null);
    //global variables from window object
    var globalVarEntry = {};
    globalVarEntry.isLocal = false;
    globalVarEntry.data = window;
    this.contextManager.addToContextList(globalVarEntry);
    
    var inputArgType = visicomp.core.util.getObjectType(nameOrJson);
    
    if(inputArgType === "String") {
        this.name = nameOrJson;
        this.rootFolder = new visicomp.core.Folder(this,nameOrJson);
    }
    else {
        this.loadFromJson(nameOrJson,actionResponseForJson);
    }
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Workspace,visicomp.core.EventManager);
visicomp.core.util.mixin(visicomp.core.Workspace,visicomp.core.Owner);

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getFullName = function() {
    return this.name;
}

/** this method gets the root package for the workspace. */
visicomp.core.Workspace.prototype.getRootFolder = function() {
    return this.rootFolder;
}

/** This method returns the contextManager for this parent.  */
visicomp.core.Workspace.prototype.getContextManager = function() {
    return this.contextManager;
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being added. */
visicomp.core.Workspace.prototype.updateForAddedVariable = function(object,recalculateList) {
    this.rootFolder.updateForAddedVariable(object,recalculateList);
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being deleted. */
visicomp.core.Workspace.prototype.updateForDeletedVariable = function(object,recalculateList) {
    this.rootFolder.updateForDeletedVariable(object,recalculateList);
}

/** This method removes any data from this workspace on closing. */
visicomp.core.Workspace.prototype.close = function() {
}

//------------------------------
// Owner Methods
//------------------------------

/** this method is implemented for the Owner component/mixin. */
visicomp.core.Workspace.prototype.getWorkspace = function() {
   return this;
}

/** this method is implemented for the Owner component/mixin. */
visicomp.core.Workspace.prototype.getBaseName = function() {
    return this.name;
}

//============================
// Save Functions
//============================

/** This is the supported file type. */
visicomp.core.Workspace.SAVE_FILE_TYPE = "visicomp workspace";

/** This is the supported file version. */
visicomp.core.Workspace.SAVE_FILE_VERSION = 0.1;

visicomp.core.Workspace.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.fileType = visicomp.core.Workspace.SAVE_FILE_TYPE;
    json.version = visicomp.core.Workspace.SAVE_FILE_VERSION;
    
    //components
    json.data = this.rootFolder.toJson();
    
    return json;
}


/** This is loads data from the given json into this workspace. 
 * @private */
visicomp.core.Workspace.prototype.loadFromJson = function(json,actionResponse) {
    var fileType = json.fileType;
	if(fileType !== visicomp.core.Workspace.SAVE_FILE_TYPE) {
		throw visicomp.core.util.createError("Bad file format.");
	}
    if(json.version !== visicomp.core.Workspace.SAVE_FILE_VERSION) {
        throw visicomp.core.util.createError("Incorrect file version.");
    }
    
    this.name = json.name;
	
	//recreate the root folder
	var updateDataList = [];
    this.rootFolder = visicomp.core.Folder.fromJson(this,json.data,updateDataList);
    
    //set the data on all the objects
    if(updateDataList.length > 0) {
        actionResponse = visicomp.core.updatemember.updateObjects(updateDataList,actionResponse);
    }
}

//================================
// Member generator functions
//================================

visicomp.core.Workspace.memberGenerators = {};

/** This methods retrieves the member generator for the given type. */
visicomp.core.Workspace.getMemberGenerator = function(type) {
    return visicomp.core.Workspace.memberGenerators[type];
}

/** This method registers the member generator for a given named type. */
visicomp.core.Workspace.addMemberGenerator = function(generator) {
    visicomp.core.Workspace.memberGenerators[generator.type] = generator;
}