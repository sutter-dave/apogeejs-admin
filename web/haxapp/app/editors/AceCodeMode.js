/** This is a code editor. It expects the body of the object function. Optionally
 * a code wrapper can be passed in to wrap and unwrap the code text before and
 * after editing. There is also an option to pass in an instruction for setting data
 * when the code is the empty string. This can be used to set the data value rather than the
 * code, such as on a data object. The data will be set asn optionalOnBlankData.value if the
 * code is set to the empty string. If no action is desired, false or any value that evaluates to
 * false can be sent in.
 */
haxapp.app.AceCodeMode = function(componentDisplay,optionalOnBlankData,optionalEditorCodeWrapper) {
    haxapp.app.ViewMode.call(this,componentDisplay);
	
	this.onBlankData = optionalOnBlankData;
	this.editorCodeWrapper = optionalEditorCodeWrapper;
}

haxapp.app.AceCodeMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceCodeMode.prototype.constructor = haxapp.app.AceCodeMode;
	
haxapp.app.AceCodeMode.prototype.showData = function() {
		
	var codeText = this.member.getFunctionBody();
	
    if(!this.editor) {
        this.editor = new haxapp.app.AceTextEditor(this,"ace/mode/javascript");
    }
	this.editor.showData(codeText,true);
}

haxapp.app.AceCodeMode.prototype.onSave = function(text) {	
	
    var actionData = {};
	
	if((this.onBlankData)&&(text === "")) {
		//special case - clear code
        actionData.action = "updateData";
        actionData.member = this.member;
        actionData.data = this.onBlankData.dataValue;
		
	}
	else {
		//standard case - edit code
        actionData.action = "updateCode";
        actionData.member = this.member;
        actionData.argList = this.member.getArgList();
		actionData.functionBody = text;

        actionData.supplementalCode = this.member.getSupplementalCode();  
	}
    
    var actionResponse =  hax.action.doAction(this.member.getWorkspace(),actionData);
        
	return true;  
}
