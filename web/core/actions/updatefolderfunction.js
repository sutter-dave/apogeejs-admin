/** This namespace contains functions to process an update the object function
 *for a folderFunction. */
visicomp.core.updatefolderFunction = {};

visicomp.core.updatefolderFunction.updatePropertyValues = function(folderFunction,argList,returnValueString,optionalActionResponse) {
    var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    try {
        folderFunction.setArgList(argList);
        folderFunction.setReturnValueString(returnValueString);

        var recalculateList = [];
        visicomp.core.calculation.addToRecalculateList(recalculateList,folderFunction);
        visicomp.core.calculation.callRecalculateList(recalculateList,actionResponse);
        
        //fire updated events
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}
