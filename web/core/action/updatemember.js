/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.updatemember = {};

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.updatemember.OBJECT_UPDATED_EVENT = "memberUpdated";

visicomp.core.updatemember.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.updatemember.MEMBER_UPDATED_EVENT,member);
}

/** This is the listener for the update member event. */
visicomp.core.updatemember.updateObject = function(member,data,functionBody,supplementalCode) {
    var returnValue;
    
    try {
		//update member content
		visicomp.core.updatemember.setContent(member,data,functionBody,supplementalCode);

		//recalculate
		var recalculateList = [];
		visicomp.core.calculation.addToRecalculateList(recalculateList,member);
		visicomp.core.calculation.recalculateObjects(recalculateList);

		//return success
		returnValue = {"success":true};
	}
	finally {
        //for now we will not catch errors but let the broswer take care of them
        //in the future we want the debugger handling for user code errors.
        if(!returnValue) {
            alert("There was an error. See the browser debugger.");
            returnValue = {"success":false};
        }
    }
    
    return returnValue;
}


/** This is the listener for the update members event. */
visicomp.core.updatemember.updateObjects = function(updateDataList) {
    var recalculateList = [];

    //update members and add to recalculate list
    for(var i = 0; i < updateDataList.length; i++) {
        var argData = updateDataList[i];
        var member = argData.member;
        var data = argData.data;
        var functionBody = argData.functionBody;
        var supplementalCode = argData.supplementalCode;
        visicomp.core.updatemember.setContent(member,data,functionBody,supplementalCode);
        visicomp.core.calculation.addToRecalculateList(recalculateList,member);
    }

    //recalculate members
    visicomp.core.calculation.recalculateObjects(recalculateList);

    //return success
    return {
        "success":true
    };
}

/** This method responds to a "new" menu event. */
visicomp.core.updatemember.getUpdateDataWrapper = function(member,data,functionBody,supplementalCode) {
	
	var updateDataWraapper = {};
    updateDataWraapper.member = member;
    if((data !== undefined)||(data !== null)) {
        updateDataWraapper.data = data;
    }
	updateDataWraapper.functionBody = functionBody;
	updateDataWraapper.supplementalCode = supplementalCode;
	
	return updateDataWraapper;
}


/** This method updates the data for the member. It should be implemented by
 * the member.
 * @protected */
visicomp.core.updatemember.setContent = function(member,data,functionBody,supplementalCode) {
	
    //set forumula or value, not both
    if(functionBody) {
		
        //set code
        member.setCode(functionBody,supplementalCode);
		
		member.calculateDependencies();
    }
    else {
        
        //set data
        member.setData(data);
		
		//clear the formula
        member.clearCode();
		
		//fire this for the change in value
		visicomp.core.updatemember.fireUpdatedEvent(member);
    }
}	




