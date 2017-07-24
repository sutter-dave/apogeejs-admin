/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
apogeeapp.app.EditComponent = function(workspaceUI,object,generator,options) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,object,generator,options);
}

apogeeapp.app.EditComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.EditComponent.prototype.constructor = apogeeapp.app.EditComponent;

apogeeapp.app.EditComponent.prototype.instantiateWindowDisplay = function() {
    return new apogeeapp.app.EditWindowComponentDisplay(this,this.windowDisplayStateJson);
}

/** This is used when an alternate UI is used for the workspace. This replaces the window display 
 *  used in the standard UI. */
apogeeapp.app.EditComponent.prototype.setAlternateWindowDisplay = function(windowDisplay) {
    this.alternateWindowDisplay = windowDisplay;
    this.windowDisplay = windowDisplay;
    windowDisplay.setBannerState(this.bannerState,this.bannerMessage);
}

//===============================
// Protected Functions
//===============================

//Implement this in extending class
///**  This method retrieves the table edit settings for this component instance
// * @protected */
//apogeeapp.app.EditComponent.prototype.getTableEditSettings = function();

apogeeapp.app.EditComponent.prototype.hasTabDisplay = function() {    
    return false;
}

apogeeapp.app.EditComponent.prototype.instantiateTabDisplay = function() {
    return null;
}

apogeeapp.app.EditComponent.prototype.getMenuItems = function(optionalMenuItemList) {
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];    
    
    //call base class
    var menuItemList = apogeeapp.app.Component.prototype.getMenuItems.call(this,menuItemList);
    
    //initialize the "clear function" menu entry, used only when there is code
     if((this.object.isCodeable)&&(this.object.hasCode())) {
         var settings = this.getTableEditSettings();
        if(settings.clearFunctionMenuText !== undefined) {
            var itemInfo = {};
            itemInfo.title = settings.clearFunctionMenuText;
            itemInfo.callback = this.getClearFunctionCallback(settings.emptyDataValue);
            menuItemList.push(itemInfo);
        }   
    }
			
    return menuItemList;
}

apogeeapp.app.EditComponent.prototype.getClearFunctionCallback = function(emptyDataValue) {
    var actionData = {};
    actionData.member = this.object;
    actionData.data = emptyDataValue;
    actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME
    return function() {
        var actionResponse = apogee.action.doAction(actionData); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}


