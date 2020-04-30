import "/apogee/webGlobals.js";
import { ApogeeView, initIncludePath, WebComponentDisplay } from "/apogeeview/apogeeViewLib.js";
import WebAppConfigManager from "/applications/webclientlib/WebAppConfigManager.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

let apogeeWebClientLib = {};
let appView;

export {apogeeWebClientLib as default};

/** This method initializes the workspace. */
apogeeWebClientLib.initWebApp = function(workspaceUrl) { 

    //==========================
    //some global initialization
    //==========================

    window.apogeeutil = apogeeutil;

    const INCLUDE_BASE_PATH = "INCLUDE_BASE_PATH_VALUE";
    initIncludePath(INCLUDE_BASE_PATH);
                
    //==========================
    //app initialization
    //==========================

    var appConfigManager = new WebAppConfigManager();
    
    //create the application
    appView = new ApogeeView(null,appConfigManager);

    //apogeeutil.textRequest(this.workspaceUrl);

    // var openInitialWorkspace = workspaceText => {
    //     let workspaceJson = JSON.parse(workspaceText);

    //     //open workspace
    //     var commandData = {};
    //     commandData.type = "openWorkspace";
    //     commandData.workspaceJson = workspaceJson;
    //     commandData.fileMetadata = workspaceFileMetadata;

    //     this.executeCommand(commandData);
    // };

 //OOPS FIND THIS EVENT!!!
    let app = appView.getApp();
    app.addListener("workspaceComponentLoaded",onWorkspaceLoad);
    if(onWorkspaceLoadFailed) app.addListener("workspaceComponentLoadFailed",onWorkspaceLoadFailed);
}

/** This method attaches the apgee output display to the dom element. See the 
 * documentation for CSS requirements for the host element.
 * 
 * @param {type} memberName - The full name of the member to add to the web page (including the top level folder name)
 * @param {type} parentElementId - This is the DOM element ID into which the display should be added.
 * @param {type} isShowing - If the element is currently showing, this flag should be set to true. Otherwise, it 
 * should be set to false and the isShowing event used when the element becomes visible
 * @param {type} optionalViewType - For this component, the name of the data view can optionally be specified. Otherwise the default is used.
 * @returns {undefined} There is no return value
 */ 
apogeeWebClientLib.addDisplay = function(memberName,parentElementId,isShowing,optionalViewType) {
                
    var parentElement = document.getElementById(parentElementId);
    if(!parentElement) {
        console.error("DOM Element not found:" + parentElementId);
        return;
    }

    //show the display
    var componentDisplay = _createComponentDisplay(memberName,optionalViewType);
    if(!componentDisplay) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }

    //put the display element in the parent
    var element = componentDisplay.getElement();
    parentElement.appendChild(element);

    //the display frame method "setIsShowing" must be called when
    //the object is shown or hidden for proper operation
    if(isShowing) {
        componentDisplay.setIsShowing(true);
    }
}

/** If the DOM element is loaded or unloaded, this method should be called to update
 * the state. This state is available to all component displays and is used by some of them.
 */
apogeeWebClientLib.setIsShowing = function(memberName,isShowing) {
    var componentDisplay = _getComponentDisplay(memberName);
    if(!componentDisplay) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }
    
    componentDisplay.setIsShowing(isShowing);
}

/** If the DOM element is resized this method should be called. This information is available
 * to all component display and is sued by some of them.
 */
apogeeWebClientLib.onResize = function(memberName) {
    var componentDisplay = _getComponentDisplay(memberName);
    if(!componentDisplay) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }
    
    componentDisplay.onResize();
}

/** This method returns a WebComponentDisplay object which contains the component display object. 
* If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
function _createComponentDisplay(memberName,optionalViewType) {
    let app = appView.getApp();
    let modelManager = app.getWOrkspaceManager().getModelManager();
    let model = modelManager.getModel();

    let member = model.getMemberByFullName(model,memberName);
    if(!member) {
        console.error("Member not found: " + memberName);
        return;
    }
    let componentId = modelManager.getComponentIdByMemberId(member.getId());
    let componentView = modelView.getComponentViewByComponentId(componentId);

    let activeView = optionalViewType ? optionalViewType : component.constructor.TABLE_EDIT_SETTINGS.defaultView;
    let componentDisplay = new WebComponentDisplay(componentView, activeView);
    componentView.setComponentDisplay(componentDisplay);

   return componentDisplay;
}

/** This method returns a WebComponentDisplay object which contains the component display object. */
function _getComponentDisplay(memberName) {
    let app = appView.getApp();
    let modelManager = app.getWOrkspaceManager().getModelManager();
    let model = modelManager.getModel();

    let member = model.getMemberByFullName(model,memberName);
    if(!member) {
        console.error("Member not found: " + memberName);
        return;
    }
    let componentId = modelManager.getComponentIdByMemberId(member.getId());
    let componentView = modelView.getComponentViewByComponentId(componentId);

   return componentView.getComponentDisplay();
 }


