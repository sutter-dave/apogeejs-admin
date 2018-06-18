/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurableElement = class {
    constructor(form,elementInitData,optionalContainerClassName = apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_STANDARD) {
        this.form = form;
        this.key = elementInitData.key;
        this.domElement = apogeeapp.ui.createElement("div",{"className":optionalContainerClassName});
    }
    
    /** This method returns the key for this ConfigurableElement within this panel. */
    getKey() {
        return this.key;
    }

    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return undefined;
    }  
    
    getState() {
        return this.state;
    }

    /** This hides or shows the given element within the panel. */
    setState(state) {
        this.state = state;
         
        switch(state) {
            case apogeeapp.ui.ConfigurableElement.STATE_NORMAL:
                this._setVisible(true);
                this._setDisabled(false);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_DISABLED:
                this._setVisible(true);
                this._setDisabled(true);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_HIDDEN:
                this._setVisible(false);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_INACTIVE:
                this._setVisible(false);
                break;
        }
        
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
    }

    /** This method returns the DOM element for this configurable element. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the parent form for this configurable element. */
    getForm() {
        return this.form;
    }
    
    /** This allows this element to control visibility of the given child.
     * When the value of the element is set, the child will be made visible depending
     * if its childs target valud matches the current element value. */
    addSelectionChild(childElement,value,keepActiveOnHide) {
        if(!this.childSelectionElements) {
            this._initAsParent();
        }
        var childData = {};
        childData.element = childElement;
        childData.value = value;
        childData.keepActiveOnHide = keepActiveOnHide;
        this.childSelectionElements.push(childData);
        
        this.setChildState(childData,this.getValue());
    }
    
    checkChildSelection(value) {
        if((this.childSelectionElements)&&(this.setChildState)) {
            this.childSelectionElements.forEach( childData => this.setChildState(childData,value));
        } 
    }
    
//    /* Implement this if the element can selector children */
//    setChildState(childData,value) {
//        
//    }

    //---------------------------------
    //set child state implementations
    //---------------------------------
    
    /** This is a function that can be used to set values when the parent element has a single value. */
    static setChildStateSingleValue(childData,value) {
        if(childData.value == value) {
            childData.element.setState(apogeeapp.ui.ConfigurableElement.STATE_NORMAL);
        }
        else {
            var state = childData.keepActiveOnHide ? apogeeapp.ui.ConfigurableElement.STATE_HIDDEN : apogeeapp.ui.ConfigurableElement.STATE_INACTIVE;
            childData.element.setState(state);
        }
    }
    
    /** This is a function that can be used to set values when the parent element has an array value. */
    static setChildStateArrayValue(childData,value) {
        if(value.indexOf(childData.value) >= 0) {
            childData.element.setState(apogeeapp.ui.ConfigurableElement.STATE_NORMAL);
        }
        else {
            var state = childData.keepActiveOnHide ? apogeeapp.ui.ConfigurableElement.STATE_HIDDEN : apogeeapp.ui.ConfigurableElement.STATE_INACTIVE;
            childData.element.setState(state);
        }
    }
    
    
    //===================================
    // internal Methods
    //==================================
    
    /** This method does standard initialization which requires the element be created. 
     * Any extending method should call this at the end of the constructor. */
    _postInstantiateInit(elementInitData) {
        
        //standard fields
        if(elementInitData.value !== undefined) {
            this.setValue(elementInitData.value);
        }
        
        var state = (elementInitData.state != undefined) ? elementInitData.state : apogeeapp.ui.ConfigurableElement.STATE_NORMAL;
        this.setState(state);
        
        //standard events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
        }
        
        //accont for parent elements
        if(elementInitData.selector) {
            if(!elementInitData.selector.parentKey) throw new Error("Parent key is required for a selectable child element:" + elementInitData.key);
            if(elementInitData.selector.parentValue === undefined) throw new Error("A child selectable element must contain a value: " + elementInitData.key)
            var parentElement = this.form.getEntry(elementInitData.selector.parentKey);
            if(!parentElement) throw new Error("Parent element " + elementInitData.selector.parentKey + " not found for selectable child element " + elementInitData.key);
            if(!parentElement.setChildState) throw new Error("Parent element " + elementInitData.selector.parentKey + " does not support selection of a child element - in element = " + elementInitData.key);
            
            parentElement.addSelectionChild(this,elementInitData.selector.parentValue,elementInitData.keepActiveOnHide);
        }
    }
    
    _setDisabled(isDisabled) {};
    
    _setVisible(isVisible) {
        if(isVisible) {
            this.domElement.style.display = "";
        }
        else {
            this.domElement.style.display = "none";
        }
    }
    
    _initAsParent() {
        this.childSelectionElements = [];
        this.parentOnChangeHandler = (value,form) => this.childSelectionElements.forEach( childElement => this.setChildState(childElement,value));
        this.addOnChange(this.parentOnChangeHandler);
    }
}

apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_STANDARD = "apogee_configurablePanelLine_standard";
apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_NO_MARGIN = "apogee_configurablePanelPanelLine_noMargin";
apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_INVISIBLE = "apogee_configurablePanelPanelLine_hidden";

apogeeapp.ui.ConfigurableElement.STATE_NORMAL = "normal";
apogeeapp.ui.ConfigurableElement.STATE_DISABLED = "disabled";
apogeeapp.ui.ConfigurableElement.STATE_HIDDEN = "hidden";
apogeeapp.ui.ConfigurableElement.STATE_INACTIVE = "inactive";

