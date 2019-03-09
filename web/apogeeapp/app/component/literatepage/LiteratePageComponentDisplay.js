/** This component represents a json table object. */
apogeeapp.app.LiteratePageComponentDisplay = function(component,member,folder) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    if(!apogeeapp.app.LiteratePageComponentDisplay.quillInitialized()) {
        apogeeapp.app.LiteratePageComponentDisplay.initializeQuill();
    }
    
    this.component = component;
    this.member = member;
    this.folder = folder;
    
    this.loadTabEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditDisplayContent.destroy);
};

//add components to this class
apogee.base.mixin(apogeeapp.app.LiteratePageComponentDisplay,apogee.EventManager);

/** This is the data to load an empty page. */
apogeeapp.app.LiteratePageComponentDisplay.EMPTY_PAGE_BODY = [];

apogeeapp.app.LiteratePageComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.closeTab = function() {
    if(this.tab) {
        this.tab.close();
        this.tab = null;
    }
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(bannerState == apogeeapp.app.banner.BANNER_TYPE_NONE) {
       this.tab.setHeaderContent(null);
    }
    else {
        var banner = apogeeapp.app.banner.getBanner(bannerMessage,bannerState);
        this.tab.setHeaderContent(banner);
    }
    
    if(this.tab) {
        var iconOverlay = apogeeapp.app.banner.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.tab.setIconOverlay(iconOverlay);
        }
        else {
            this.tab.clearIconOverlay();
        }
    }
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.updateData = function() {
    this.tab.setTitle(this.member.getName());
}

/** This method is used to bring the child component to the front. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.showChildComponent = function(childComponent) {
    var childComponentDisplay = childComponent.getComponentDisplay();
    if(childComponentDisplay) {
        alert("Not implemented!");
    }
}

/** This creates and adds a display for the child component to the parent container. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.addChildComponent = function(childComponent) {
    
    var childComponentDisplay;
    var componentDisplayOptions = childComponent.getComponentDisplayOptions();
    
    //create a new component display for this child
    if(childComponent.isEditComponent) {
        childComponentDisplay = new apogeeapp.app.PageChildComponentDisplay(childComponent,componentDisplayOptions);
    }
    else if(childComponent.isParentComponent) {
        //don't display the child parents!
    }
    else {
        throw new Error("Unrecognized child component type! " + childComponent.constructor)
    }
    
    if(childComponentDisplay) {
        //for now there is no state - just show in order
        childComponent.setComponentDisplay(childComponentDisplay);
        let range = this.quill.getSelection(true);
        var childMember = childComponent.getMember();
        let value = { 
            path: childMember.getFullName(),
            componentDisplay: childComponentDisplay
        };
        this.quill.insertText(range.index, '\n', Quill.sources.USER);
        this.quill.insertEmbed(range.index + 1, 'apogeedisplay', value, Quill.sources.USER);
        this.quill.insertText(range.index + 2, '\n', Quill.sources.USER);
        this.quill.setSelection(range.index + 3, Quill.sources.SILENT);
    }
}

/** This is to record any state in the tab object. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.getStateJson = function() {
    var json;
    if(this.quill) {
        json = this.readStateJson();
    }
    else if(this.storedContent) {
        json = this.storedContent;
    }
    return json;
}

/** This is to restore any state in the tab object. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.setStateJson = function(json) {
    if(this.quill) {
        this.applyStateJson(json);
    }
    else {
        this.storedContent = json;
    }
}

//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.readStateJson = function() {
    var json = {};
    json.pageBody = this.quill.getContents().ops;
    return json;
}

/** This method loads the given state json into the page text editor
 * @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.applyStateJson = function(json) {
    if(this.quill) {
        var pageBody;
        if((json)&&(json.pageBody)) {
            pageBody = json.pageBody;
        }
        else {
            pageBody = apogeeapp.app.LiteratePageComponentDisplay.EMPTY_PAGE_BODY;
        }
        this.quill.setContents(pageBody,'api');
        
        //clear the stored content, since it will get out of date
        this.storedContent = null;
    }
}

/** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.loadTabEntry = function() {
    this.tab = new apogeeapp.ui.Tab(this.member.getId());    
   
    //-----------------------
    //set the content
    //-----------------------
    this.createDisplayContent();
    this.tab.setContent(this.contentElement,apogeeapp.ui.FIXED_SIZE);
    
    this.tab.addListener(apogeeapp.ui.SHOWN_EVENT,() => this.tabShown);
    this.tab.addListener(apogeeapp.ui.HIDDEN_EVENT,() => this.tabHidden());
    
    //------------------
    // set menu
    //------------------
    var menu = this.tab.createMenu(this.component.getIconUrl());
    var instance = this;
    var createMenuItemsCallback = function() {
        return instance.component.getMenuItems();
    }
    menu.setAsOnTheFlyMenu(createMenuItemsCallback);
    
    //-----------------
    //set the tab title
    //-----------------
    this.tab.setTitle(this.member.getName());
    
    //-----------------------------
    //add the handlers for the tab
    //-----------------------------
    var instance = this;
    var onClose = function() {
        instance.component.closeTabDisplay();
        instance.destroy();
    }
    this.tab.addListener(apogeeapp.ui.CLOSE_EVENT,onClose);
}

apogeeapp.app.LiteratePageComponentDisplay.PARENT_CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px"
}

 /** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.createDisplayContent = function() {
   
    this.contentElement = apogeeapp.ui.createElement("div",null,apogeeapp.app.LiteratePageComponentDisplay.PARENT_CONTAINER_STYLE);

    //we ony use this context menu and child map for parents
    //modify if we use this elsewhere
    if(!this.folder.isParent) return;

    var container = document.createElement("div");
    this.contentElement.appendChild(container);
    var options = {};
    options.theme = 'snow';
    this.quill = new Quill(container,options);
    
    //add content if we have it
    if(this.storedContent) {
        this.applyStateJson(this.storedContent);
    }
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.destroy = function() {
    var children = this.folder.getChildMap();
    var workspaceUI = this.component.getWorkspaceUI();
    
    //TODO THIS LOGIC IS NOT GOOD! FIX IT!
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        if(childComponent) {
            childComponent.closeComponentDisplay();
        }
    }
    
    this.closeTab();
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.tabShown = function() {
    this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.tabHidden = function() {
    this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
}

//===========================
// Static methods for editor initialization
//===========================
apogeeapp.app.LiteratePageComponentDisplay.quillInitDone = false;
apogeeapp.app.LiteratePageComponentDisplay.quillInitialized = function() {
    return apogeeapp.app.LiteratePageComponentDisplay.quillInitDone;
}

apogeeapp.app.LiteratePageComponentDisplay.initializeQuill = function() {
    var BlockEmbed = Quill.import('blots/block/embed');
    //apogee custom  blot
    class ApogeeDisplayBlot extends BlockEmbed {
        static create(value) {
            var node = super.create();
            node.setAttribute('path',value.path);
            if(value.componentDisplay) {
                node.setComponentDisplay(value.componentDisplay);
            }
            else {
                //implement!
                alert("not implemented - component display lookup");
            }
            return node;
        }

        static value(node) {
            return {
                path: node.getAttribute('path')
            };
        }
    };
    ApogeeDisplayBlot.blotName = 'apogeedisplay';
    ApogeeDisplayBlot.tagName = 'apogee-element';
    Quill.register(ApogeeDisplayBlot);	
    
    apogeeapp.app.LiteratePageComponentDisplay.quillInitDone = true;
}



