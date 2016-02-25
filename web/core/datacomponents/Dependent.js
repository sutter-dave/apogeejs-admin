/** This mixin encapsulates an object in the workspace that depends on another
 * object, and is recalculated based partilaly on that object.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Dependent must be a Child. The Child component must be installed before the
 * Dependent component.
 */
visicomp.core.Dependent = {};

/** This initializes the component */
visicomp.core.Dependent.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
    
    this.circRefError = null;
    this.selfRefError = null;
}

/** This property tells if this object is a dependent.
 * This property should not be implemented on non-dependents. */
visicomp.core.Dependent.isDependent = true;

/** This returns a list of the members that this member depends on. */
visicomp.core.Dependent.getDependsOn = function() {
    return this.dependsOnList;
}

/** This method sets the circular reference error for this dependent.*/
visicomp.core.Dependent.setCircRefError = function(circRefError) {
    this.circRefError = circRefError;
}

/** This method clears the circular reference error for this codeable.*/
visicomp.core.Dependent.clearCircRefError = function() {
    this.circRefError = null;
}

/** This returns true if there is a circular reference error. */
visicomp.core.Dependent.hasCircRefError = function() {
    return (this.circRefError != null);
}

/** This returns the circular reference error. */
visicomp.core.Dependent.getCircRefError = function() {
    return this.circRefError;
}

/** This method sets the self reference error for this dependent. An object
 * should not reference itself since an object should not be aware of its previous value. */
visicomp.core.Dependent.setSelfRefError = function(selfRefError) {
    this.selfRefError = selfRefError;
}

/** This method clears the self reference error for this codeable.*/
visicomp.core.Dependent.clearSelfRefError = function() {
    this.selfRefError = null;
}

/** This returns true if there is a self reference error. */
visicomp.core.Dependent.hasSelfRefError = function() {
    return (this.selfRefError != null);
}

/** This returns the self reference error. */
visicomp.core.Dependent.getSelfRefError = function() {
    return this.selfRefError;
}

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was added.  */
//visicomp.core.Dependent.updateForAddedVariable = function(object);

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was deleted.  */
//visicomp.core.Dependent.updateForDeletedVariable = function(object);


///** This is a check to see if the object should be checked for dependencies 
// * for recalculation.  
// * @private */
//visicomp.core.Dependent.needsExecuting = function();


///** This updates the member based on a change in a dependency.  */
//visicomp.core.Dependent.execute = function();

//===================================
// Private Functions
//===================================

/** This sets the dependencies based on the code for the member. */
visicomp.core.Dependent.updateDependencies = function(newDependsOn) {
    
    if(!newDependsOn) {
        newDependsOn = [];
    }
    
	//retireve the old list
    var oldDependsOn = this.dependsOnList;
	
    //create the new dependency list
	this.dependsOnList = [];
    this.clearSelfRefError();
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < newDependsOn.length; i++) {
        remoteMember = newDependsOn[i];
        
        //make sure this is a dependent - this is an application error if this happens
        if(!remoteMember.isImpactor) {
            throw visicomp.core.util.createError("The object " + remoteMember.getFullName() + " cannot be referenced as a dependent.");
        }
		
		if(remoteMember === this) {
			//it is an error to depend on itself (it doesn't exist yet)
			//ok to reference through a local varible - this is how recursive functions are handled.
			var message = "A data formula should not reference its own name.";
			var actionError = new visicomp.core.ActionError(message,this);
			this.setSelfRefError(actionError);
		}
		else {	
			
			this.dependsOnList.push(remoteMember);
			
			//update this member
			remoteMember.addToImpactsList(this);

			//create a set of new member to use below
			newDependencySet[remoteMember.getFullName()] = true;
		}
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteMember = oldDependsOn[i];
		
		var stillDependsOn = newDependencySet[remoteMember.getFullName()];
		
		if(!stillDependsOn) {
			//remove from imacts list
			remoteMember.removeFromImpactsList(this);
		}
    }
}
