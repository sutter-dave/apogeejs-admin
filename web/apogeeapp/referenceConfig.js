import EsModuleEntry from "/apogeeapp/references/EsModuleEntry.js";
import NpmModuleEntry from "/apogeeapp/references/NpmModuleEntry.js";
import JsScriptEntry from "/apogeeapp/references/JsScriptEntry.js";
import CssEntry from "/apogeeapp/references/CssEntry.js";

import ReferenceManager from "/apogeeapp/references/ReferenceManager.js";

/** This file initializes the reference class types available. */

let referenceClassArray = [];
if(__APOGEE_ENVIRONMENT__ == "WEB") referenceClassArray.push(EsModuleEntry);
if(__APOGEE_ENVIRONMENT__ == "NODE") referenceClassArray.push(NpmModuleEntry);
referenceClassArray.push(JsScriptEntry);
referenceClassArray.push(CssEntry);
ReferenceManager.setReferenceClassArray(referenceClassArray);