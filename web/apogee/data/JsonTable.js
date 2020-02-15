import base from "/apogeeutil/base.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import CodeableMember from "/apogee/datacomponents/CodeableMember.js";

/** This class encapsulatees a data table for a JSON object */
export default class JsonTable extends CodeableMember {

    constructor(name,owner,initialData) {
        super(name,JsonTable.generator);

        //mixin init where needed
        this.contextHolderMixinInit();
        
        this.initOwner(owner);
        
        //set initial data
        if(!initialData) {
            //default initail value
            initialData = {};
            initialData.data = "";
        }  

        if(initialData.functionBody !== undefined) {
            this.applyCode(initialData.argList,
                initialData.functionBody,
                initialData.supplementalCode);
        }
        else {
            if(initialData.data === undefined) initialData.data = "";
            
            this.setData(initialData.data);
        }
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    /** This method returns the argument list. We override it because
     * for JsonTable it gets cleared when data is set. However, whenever code
     * is used we want the argument list to be this value. */
    getArgList() {
        return [];
    }
        
    processMemberFunction(memberGenerator) {
        
        //first initialize
        var initialized = this.memberFunctionInitialize();
        
        var data;
        if(initialized) {
            //the data is the output of the function
            var memberFunction = memberGenerator();
            data = memberFunction();
        }
        else {
            //initialization issue = error or pending dependancy
            data = undefined;
        }
        
        if(data === apogeeutil.INVALID_VALUE) {
            //value is invalid if return is this predefined value
            this.setResultInvalid(true);
        }
        else if(data instanceof Promise) {
            //if the return value is a Promise, the data is asynch asynchronous!
            this.applyPromiseData(data);
        }
        else {
            //result is normal synchronous data
            this.setData(data); 
        }
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method extends set data from member. It also
     * freezes the object so it is immutable. (in the future we may
     * consider copying instead, or allowing a choice)*/
    setData(data) {
        
        //make this object immutable
        base.deepFreeze(data);

        //store the new object
        return super.setData(data);
    }

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(owner,json) {
        return new JsonTable(json.name,owner,json.updateData);
    }
}


//add components to this class
base.mixin(JsonTable,ContextHolder);

//============================
// Static methods
//============================

JsonTable.generator = {};
JsonTable.generator.displayName = "Table";
JsonTable.generator.type = "apogee.JsonTable";
JsonTable.generator.createMember = JsonTable.fromJson;
JsonTable.generator.setDataOk = true;
JsonTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(JsonTable.generator);