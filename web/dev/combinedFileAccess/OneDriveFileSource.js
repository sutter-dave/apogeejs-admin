import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {uiutil}  from "/apogeeui/apogeeUiLib.js";
import OneDriveFileSystem from "./OneDriveFileSystem.js";
import * as fileAccessConstants from "./fileAccessConstants.js";

let OneDriveFileSourceGenerator = {
    getSourceId: function() {
        return OneDriveFileSystem.SOURCE_ID;
    },

    getDisplayName: function() {
        return OneDriveFileSystem.DISPLAY_NAME;
    },

    directSaveOk: function(fileMetadata) {
        return OneDriveFileSystem.directSaveOk(fileMetadata);
    },

    getInstance(action,fileMetadata,fileData,onComplete) {
        return new OneDriveFileSource(action,fileMetadata,fileData,onComplete)
    }
}

export {OneDriveFileSourceGenerator as default};

/** This is the remote file system source */
class OneDriveFileSource {
    /** constructor */
    constructor(action,fileMetadata,fileData,onComplete) {
        this.action = action;
        this.initialFileMetadata = fileMetadata;
        this.fileData = fileData;
        this.onComplete = onComplete;

        //this object is the interface to OneDrive
        this.remoteFileSystem = new OneDriveFileSystem();

        // this.drivesInfo
        // this.selectedDriveId
        this.driveSelectionElementMap = {}

        // this.folderInfo
        // this.selectedFileId
        this.fileElementMap = {};

        this.loginState = null


        // this.actionElement
        // this.configElement

        // this.saveFileNameField
        // this.openFileNameField
        // this.pathCell
        // this.fileListTable
        // this.drivesListElement
        // this.allRadio
        // this.jsonRadio
        // this.loggedOutShield

        // this.loginElement
        // this.userElement
        // this.logoutElement
    }

    //============================
    // Public Methods
    //============================

    getGenerator() {
        return OneDriveFileSourceGenerator;
    }

    //-----------------------------
    // File Actions
    //-----------------------------

    updateFile() {
        let fileInfo = this.initialFileMetadata.fileInfo;
        let saveFilePromise = this.remoteFileSystem.updateFile(fileInfo.driveId,fileInfo.fileId,this.fileData);

        saveFilePromise.then( fileMetadata => {
            //success
            if(this.onComplete) this.onComplete(null,true,fileMetadata); 
        }).catch(errorMsg => {
            //error
            if(this.onComplete) this.onComplete(errorMsg,false,null);
        }) ;
    }

    createFile(driveId,folderId,fileName) {
        let saveFilePromise = this.remoteFileSystem.createFile(driveId,folderId,fileName,this.fileData);

        saveFilePromise.then( fileMetadata => {
            //success
            if(this.onComplete) this.onComplete(null,true,fileMetadata); 
        }).catch(errorMsg => {
            //error
            if(this.onComplete) this.onComplete(errorMsg,false,null);
        }) ;
    }

    openFile(driveId,fileId) {
        let openFilePromise = this.remoteFileSystem.openFile(driveId,fileId);

        openFilePromise.then( result => {
            //success
            if(this.onComplete) this.onComplete(null,result.data,result.fileMetadata); 
        }).catch(errorMsg => {
            //error
            if(this.onComplete) this.onComplete(errorMsg,false,null);
        }) ;
    }

    cancelAction() {
        if(this.onComplete) this.onComplete(null,false,null);
    }

    /** This method is called externally after the dialog box using the soruce closes. */
    close() {
        this.remoteFileSystem.close();

        //FILL THIS IN!!!
        if(this.configElement) {
            this.configElement = null;
        }
        if(this.actionElement) {
            this.actionElement = null;
        }
    }

    //-----------------------------
    // UI Interface
    //-----------------------------

    makeActive() {

    }

    getIconUrl() {
        return null;
    }

    getActionElement() {
        if(!this.actionElement) {
            this._createActionElement();
            //populate initial data if we are logged in
            let loginState = this.remoteFileSystem.getLoginInfo();
            if(loginState.state == fileAccessConstants.LOGGED_IN) {
                this._populateActionForm();
            }
        }
        return this.actionElement;
    }

    getConfigElement() {
        if(!this.configElement) {
            this._createConfigElement();
            //set initial login state
            this.remoteFileSystem.setLoginStateCallback(loginState => this._setLoginState(loginState));
            let loginState = this.remoteFileSystem.getLoginInfo();
            this._setLoginState(loginState);
        }
        return this.configElement;
    }


    //===================================
    // Private Methods
    //===================================

    //--------------------
    // command handlers
    //--------------------

    _onLoginCommand() {
        this.remoteFileSystem.login();
    }

    _onLogoutCommand() {
        this.remoteFileSystem.logout();
    }

    _onParentFolderSelect() {
        if(this.folderInfo) {
            //get parent id. For root this is not defined, but our load foler method handles that.
            let parentId = this.folderInfo.folder.parentId;
            this._loadFolder(this.selectedDriveId, parentId);
        }
    }

    _onFilterChange() {

    }

    _onCreateFolder() {

    }

    _onFileClick(fileInfo) {
        //select element
        let oldSelectedFileId = this.selectedFileId;
        if(oldSelectedFileId) {
            let oldSelectedFileElement = this.fileElementMap[oldSelectedFileId];
            if(oldSelectedFileElement) {
                oldSelectedFileElement.classList.remove("oneDriveFileAccess_fileRowActive");
            }
        }
        this.selectedFileId = fileInfo.fileId;
        if(this.selectedFileId) {
            let newSelectedFileElement = this.fileElementMap[this.selectedFileId];
            if(newSelectedFileElement) {
                newSelectedFileElement.classList.add("oneDriveFileAccess_fileRowActive");
            }
        }

        //take any needed action
        if(fileInfo.type == fileAccessConstants.FOLDER_TYPE) {
            //open the folder
            this._loadFolder(this.selectedDriveId, this.selectedFileId);
        }
        else {
            //put the name in the file name field
            if(this.action == fileAccessConstants.SAVE_ACTION) this.saveFileNameField.value = fileInfo.name;
            else if(this.action == fileAccessConstants.OPEN_ACTION) this.openFileNameField.innerHTML = fileInfo.name;
        }

    }

    _onFileDelete(fileInfo) {

    }

    _onFileRename(fileInfo,newFileName) {

    }

    _onOpenPress() {
        if(!this.selectedDriveId) {
            alert("There is no selected drive!");
            return;
        }
        if((!this.folderInfo)||(!this.folderInfo.folder)) {
            alert("There is no selected folder!");
            return;
        }
        if(!this.selectedFileId) {
            alert("There is no file selected");
            return
        }
        this.openFile(this.selectedDriveId,this.selectedFileId);
    }

    _onSavePress() {
        if(!this.selectedDriveId) {
            alert("There is no selected drive!");
            return;
        }
        if((!this.folderInfo)||(!this.folderInfo.folder)) {
            alert("There is no selected folder!");
            return;
        }
        let folderId = this.folderInfo.folder.fileId;
        let fileName = this.saveFileNameField.value.trim();
        if(fileName.length === 0) {
            alert("No file name is entered");
        }

        this.createFile(this.selectedDriveId,folderId,fileName);
    }

    _onCancelPress() {
        this.cancelAction();
    }

    /** This function changes the active source */
    _onSelectDrive(driveId) {

        let oldSelectedDriveId = this.selectedDriveId;
        this.selectedDriveId = driveId;

        if(oldSelectedDriveId !== undefined) {
            let oldElement = this.driveSelectionElementMap[oldSelectedDriveId];
            oldElement.classList.remove("oneDriveFileAccess_driveElementActive");
        }
        if(this.selectedDriveId !== undefined) {
            let newElement = this.driveSelectionElementMap[this.selectedDriveId];
            newElement.classList.add("oneDriveFileAccess_driveElementActive");

            //store this as default for future use
            _cachedDriveId = driveId;

            //load the initial
            let initialFolderId;
            if((this.initialFileMetadata)&&(this.initialFileMetadata.parentId)) {
                initialFolderId = this.initialFileMetadata.parentId;
            }
            else {
                initialFolderId = _cachedFolderId;
            }
            this._loadFolder(this.selectedDriveId,initialFolderId);
        }
    }

    //---------------------
    //internal methods
    //----------------------

    _setLoginState(loginState) {
        let oldLoginState = this.loginState;
        this.loginState = loginState;
        if(this.configElement) {
            if(loginState.state == fileAccessConstants.LOGGED_IN) {
                this.loginElement.style.display = "none";
                if(loginState.accountName) {
                    this.userElement.innerHTML = loginState.accountName;
                    this.userElement.style.display = "";
                }
                else {
                    this.userElement.style.display = "none";
                }
                this.logoutElement.style.display = "";
                if(loginState.message) {
                    this.accountMsgElement.style.display = "";
                    this.accountMsgElement.innerHTML = loginState.message;
                }
                else {
                    this.accountMsgElement.style.display = "none";
                    this.accountMsgElement.innerHTML = "";
                }

                this.loggedOutShield.style.display = "none";
            }
            else if(loginState.state == fileAccessConstants.LOGGED_OUT) {
                this.loginElement.style.display = "";
                this.userElement.style.display = "none";
                this.userElement.innerHTML = "";
                this.logoutElement.style.display = "none";
                if(loginState.message) {
                    this.accountMsgElement.style.display = "";
                    this.accountMsgElement.innerHTML = loginState.message;
                }
                else {
                    this.accountMsgElement.style.display = "none";
                    this.accountMsgElement.innerHTML = "";
                }
                
                this.loggedOutShield.style.display = "";
            }
            else if(loginState.state == fileAccessConstants.LOGIN_PENDING) {
                //for now we will leave it to this...
                this.accountMsgElement.style.display = "";
                this.accountMsgElement.innerHTML = loginState.message ? loginState.message : "pending";

                this.loginElement.style.display = "none";
                this.userElement.style.display = "none";
                this.userElement.innerHTML = "";
                this.logoutElement.style.display = "none";

                this.loggedOutShield.style.display = "";
            }
            else {
                //handle this
            }
        }

        if((this.loginState.state == fileAccessConstants.LOGGED_IN)&&
            !((oldLoginState)&&(oldLoginState.state == this.loginState.state))&&
            (this.actionElement) ) {
            //populate the action form if we are newly logged in
            this._populateActionForm();
        }
    }

    _setDrivesInfo(drivesInfo) {
        this.drivesInfo = drivesInfo;

        //pick an initial drive
        let atttemptedSelectedDriveId, initialSelectedDriveId;
        if((this.initialFileMetadata)&&(this.initialFileMetadata.fileInfo.driveId)) {
            atttemptedSelectedDriveId = this.initialFileMetadata.fileInfo.driveId;
        }
        else {
            atttemptedSelectedDriveId = _cachedDriveId;
        }

        this.selectedDriveId = undefined;
        this.driveSelectionElementMap = {};
        uiutil.removeAllChildren(this.drivesListElement);

        if(this.drivesInfo) {
            let selectedDriveId; 
            if((this.drivesInfo.drives)&&(this.drivesInfo.drives.length > 0)) {
                this.drivesInfo.drives.forEach( driveInfo => {
                    this._addDriveElement(driveInfo)
                    if(driveInfo.driveId == atttemptedSelectedDriveId) {
                        initialSelectedDriveId = driveInfo.driveId;
                    }
                })

                if((!initialSelectedDriveId)&&(this.drivesInfo.drives.length > 0)) {
                    initialSelectedDriveId = this.drivesInfo.drives[0].driveId;
                }
            }

            //set initial drive state
            if(initialSelectedDriveId) {
                this._onSelectDrive(initialSelectedDriveId);
            }
        }
        
    }

    _loadFolder(driveId, folderId) {
        let filesInfoPromise = this.remoteFileSystem.loadFolder(driveId,folderId);
        filesInfoPromise.then(folderInfo => {
            this._setFilesInfo(folderInfo);
        }).catch(errorMsg => {
            alert("Error opening folder: " + errorMsg);
            this._setFilesInfo(null);
            //if we failed to find the folder, try to open the root of the given drive
            if(folderId) {
                this._loadFolder(driveId);
            }
        })
    }


    _setFilesInfo(folderInfo) {
        this.folderInfo = folderInfo;
        this.fileElementMap = {};
        this.selectedFileId = undefined;

        this._populatePathCell();
        this._populateFileList();

        //save this folder
        if((folderInfo)&&(folderInfo.folder)&&(folderInfo.folder.fileId)) {
            _cachedFolderId = folderInfo.folder.fileId;
        }

    }

    _populatePathCell() {
        uiutil.removeAllChildren(this.pathCell);
        uiutil.removeAllChildren(this.fileListTable);

        let selectedDriveInfo = this._getSelectedDriveInfo();
        if(selectedDriveInfo) {
            this.pathCell.appendChild(this._getPathDriveElement(selectedDriveInfo));
        }
        if(this.folderInfo) {
            if(this.folderInfo.path) {
                let isFirstEntry = true;
                this.folderInfo.path.forEach( fileInfo => {
                    //don't add the root name. Just use the drive name.
                    if(fileInfo.isRoot) return;
                    //add a delimiter between entries
                    if(isFirstEntry) {
                        isFirstEntry = false;
                    }
                    else {
                        this.pathCell.appendChild(this._getPathDelimiterElement());
                    }
                    this.pathCell.appendChild(this._getPathElement(fileInfo));
                })
            }
        }
        
    }

    _getSelectedDriveInfo() {
        if((this.drivesInfo)&&(this.drivesInfo.drives)&&(this.selectedDriveId)) {
            return this.drivesInfo.drives.find( driveEntry => driveEntry.driveId == this.selectedDriveId);
        }
        else return undefined;
    }

    _populateFileList() {
        uiutil.removeAllChildren(this.fileListTable);
        if((this.folderInfo)&&(this.folderInfo.children)) {
            this.folderInfo.children.forEach(folderInfo => this._addFileListEntry(folderInfo));
        }
    }

    _populateActionForm() {
        let drivesInfoPromise = this.remoteFileSystem.getDrivesInfo();
        drivesInfoPromise.then(drivesInfo => {
            this._setDrivesInfo(drivesInfo);
        }).catch(errorMsg => {
            //figure out what to do here
            alert("Error loading drive info: " + errorMsg)
        })
    }

    //--------------------
    // create elements
    //--------------------

    _createConfigElement() {
        let container = document.createElement("div");
        container.className = "oneDriveFileAccess_configContainer";

        this.loginElement = document.createElement("div");
        this.loginElement.className = "oneDriveFileAccess_loginElement";
        this.loginElement.innerHTML = "Login"
        this.loginElement.onclick = () => this._onLoginCommand();
        container.appendChild(this.loginElement);

        this.userElement = document.createElement("div");
        this.userElement.className = "oneDriveFileAccess_userElement";
        container.appendChild(this.userElement);

        this.logoutElement = document.createElement("div");
        this.logoutElement.className = "oneDriveFileAccess_logoutElement";
        this.logoutElement.innerHTML = "Logout"
        this.logoutElement.onclick = () => this._onLogoutCommand();
        container.appendChild(this.logoutElement);

        this.accountMsgElement = document.createElement("div");
        this.accountMsgElement.className = "oneDriveFileAccess_accountMsgElement";
        container.appendChild(this.accountMsgElement);

        //this element is used in the action element, but we will modify it with the login data
        this.loggedOutShield = document.createElement("div");
        this.loggedOutShield.className = "oneDriveFileAccess_loggedOutShield";
        this.loggedOutShield.innerHTML = "<em>User not logged in</em>"

        let loggedOutCancelButton = document.createElement("button");
        loggedOutCancelButton.innerHTML = "Cancel";
        loggedOutCancelButton.className = "oneDriveFileAccess_loggedOutCancelButton";
        loggedOutCancelButton.onclick = () => this._onCancelPress();
        this.loggedOutShield.appendChild(loggedOutCancelButton);

        this.configElement = container;
    }


    _createActionElement() {
        //action element
        let mainContainer = document.createElement("table");
        mainContainer.className = "oneDriveFileAccess_mainContainer";

        let pathRow = document.createElement("tr");
        mainContainer.appendChild(pathRow);
        let commandRow = document.createElement("tr");
        mainContainer.appendChild(commandRow);
        let fileDisplayRow = document.createElement("tr");
        mainContainer.appendChild(fileDisplayRow);
        let fileNameRow = document.createElement("tr");
        mainContainer.appendChild(fileNameRow);
        let buttonsRow = document.createElement("tr");
        mainContainer.appendChild(buttonsRow);

        //drive selection
        let drivesTitleCell = document.createElement("td");
        drivesTitleCell.className = "oneDriveFileAccess_driveTitle";
        drivesTitleCell.innerHTML = "Drives:"
        pathRow.appendChild(drivesTitleCell);

        let drivesCell = document.createElement("td");
        drivesCell.className = "oneDriveFileAccess_drivesCell";
        drivesCell.rowSpan = 4;
        commandRow.appendChild(drivesCell);

        this.drivesListElement = document.createElement("div");
        this.drivesListElement.className = "oneDriveFileAccess_driveList";
        drivesCell.appendChild(this.drivesListElement);

        //path display
        this.pathCell = document.createElement("td");
        this.pathCell.className = "oneDriveFileAccess_pathCell";
        pathRow.appendChild(this.pathCell);

        //commands - parent folder, file type filter, add folder (for save only)
        let commandCell = document.createElement("td");
        commandCell.className = "oneDriveFileAccess_commandCell";
        commandRow.appendChild(commandCell);

        let parentFolderButton = document.createElement("button");
        parentFolderButton.innerHTML = "^";
        parentFolderButton.onclick = () => this._onParentFolderSelect();
        commandCell.appendChild(parentFolderButton);
        if(this.action == fileAccessConstants.SAVE_ACTION) {
            let addFolderButton = document.createElement("button");
            addFolderButton.innerHTML = "+"
            addFolderButton.onclick = () => this._onCreateFolder();
            commandCell.appendChild(addFolderButton);
        }

        let filterWrapper = document.createElement("div");
        filterWrapper.className = "oneDriveFileAccess_filterWrapper";
        commandCell.appendChild(filterWrapper);
        
        let fileFilterLabel = document.createElement("span");
        fileFilterLabel.innerHTML = "Show Files: "
        filterWrapper.appendChild(fileFilterLabel);
        let radioGroupName = apogeeutil.getUniqueString();
        let allId = apogeeutil.getUniqueString();
        let jsonId = apogeeutil.getUniqueString();

        this.allRadio = document.createElement("input");
        this.allRadio.type = "radio";
        this.allRadio.name = radioGroupName;
        this.allRadio.value = "all";
        this.allRadio.onclick = () => this._onFilterChange();
        filterWrapper.appendChild(this.allRadio);
        let allRadioLabel = document.createElement("label");
        allRadioLabel.for = allId;
        allRadioLabel.innerHTML = "All";
        filterWrapper.appendChild(allRadioLabel);

        this.jsonRadio = document.createElement("input");
        this.jsonRadio.type = "radio";
        this.jsonRadio.name = radioGroupName;
        this.jsonRadio.value = "json";
        this.jsonRadio.onChange = () => this._onFilterChange();
        filterWrapper.appendChild(this.jsonRadio);
        let jsonRadioLabel = document.createElement("label");
        jsonRadioLabel.for = jsonId;
        jsonRadioLabel.innerHTML = "JSON";
        filterWrapper.appendChild(jsonRadioLabel);
        
        //file display list
        let fileListCell = document.createElement("td");
        fileListCell.className = "oneDriveFileAccess_fileListCell";
        fileDisplayRow.appendChild(fileListCell);

        this.fileListTable = document.createElement("table");
        this.fileListTable.className = "oneDriveFileAccess_fileListTable";
        fileListCell.appendChild(this.fileListTable);

        //file name entry
        let fileNameCell = document.createElement("td");
        fileNameCell.className = "oneDriveFileAccess_fileNameCell";
        fileNameRow.appendChild(fileNameCell);

        let fileNameLabel = document.createElement("span");
        fileNameLabel.className = "oneDriveFileAccess_fileNameLabel";
        fileNameLabel.innerHTML = "File Name:";
        fileNameCell.appendChild(fileNameLabel);

        if(this.action == fileAccessConstants.SAVE_ACTION) {
            //save has a text field to enter file name
            this.saveFileNameField = document.createElement("input");
            this.saveFileNameField.type = "text";
            this.saveFileNameField.className = "oneDriveFileAccess_saveFileNameField";
            fileNameCell.appendChild(this.saveFileNameField);
        }
        else {
            //on open file, we do not allow name edit, but we display then selected field
            this.openFileNameField = document.createElement("span");
            this.openFileNameField.className = "oneDriveFileAccess_openFileNameField";
            fileNameCell.appendChild(this.openFileNameField);
        }

        //save/open, cancel buttons
        let buttonsCell = document.createElement("td");
        buttonsCell.className = "oneDriveFileAccess_buttonsCell";
        buttonsRow.appendChild(buttonsCell);

        let submitButton = document.createElement("button");
        submitButton.innerHTML = (this.action == fileAccessConstants.SAVE_ACTION) ? "Save": "Open";
        submitButton.className = "oneDriveFileAccess_submitButton";
        submitButton.onclick = (this.action == fileAccessConstants.SAVE_ACTION) ? () => this._onSavePress() : () => this._onOpenPress();
        buttonsCell.appendChild(submitButton);
        let cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel";
        cancelButton.className = "oneDriveFileAccess_cancelButton";
        cancelButton.onclick = () => this._onCancelPress();
        buttonsCell.appendChild(cancelButton);

        //add the logged out shield - made earlier
        //we are putting it in like this so we can place it beblow the cancle button, but above everything else.
        let shieldParent = document.createElement("div");
        shieldParent.className = "oneDriveFileAccess_shieldParent";
        mainContainer.appendChild(shieldParent);

        shieldParent.appendChild(this.loggedOutShield);

        this.actionElement = mainContainer;
    }

    /** This function sets of the source selection items */
    _addDriveElement(driveInfo) {
        let driveElement = document.createElement("div");
        driveElement.className = "oneDriveFileAccess_driveElement";
        driveElement.innerHTML = driveInfo.name;
        driveElement.onclick = () => this._onSelectDrive(driveInfo.driveId);

        this.driveSelectionElementMap[driveInfo.driveId] = driveElement;
        this.drivesListElement.appendChild(driveElement);
    }


    _getPathDriveElement(driveEntry) {
        let driveElement = document.createElement("span");
        driveElement.className = "oneDriveFileAccess_pathDriveElement";
        driveElement.innerHTML = driveEntry.name + ":";
        return driveElement;
    }

    _getPathDelimiterElement() {
        let delimiterElement = document.createElement("span");
        delimiterElement.className = "oneDriveFileAccess_pathDelimiterElement";
        delimiterElement.innerHTML = ">";
        return delimiterElement;
    }

    _getPathElement(fileInfo) {
        let folderName;
        if(fileInfo === fileAccessConstants.BROKEN_PATH_ENTRY) {
            folderName = "...";
        }
        else {
            folderName = fileInfo.name;
        }

        let folderElement = document.createElement("span");
        folderElement.className = "oneDriveFileAccess_pathFileElement";
        folderElement.innerHTML = folderName;
        return folderElement;
    }

    _addFileListEntry(fileInfo) {
        let fileRow = document.createElement("tr");
        fileRow.className = "oneDriveFileAccess_fileRow";
        let fileIconCell = document.createElement("td");
        fileIconCell.className = "oneDriveFileAccess_fileIconCell";
        fileRow.appendChild(fileIconCell);
        let fileIcon = document.createElement("img");
        fileIcon.src = this._getIconUrl(fileInfo.type);
        fileIconCell.appendChild(fileIcon);

        let fileNameCell = document.createElement("td");
        fileNameCell.className = "oneDriveFileAccess_fileNameCell";
        fileRow.appendChild(fileNameCell);

        let fileLink = document.createElement("a");
        fileLink.className = "oneDriveFileAcess_fileLink";
        fileLink.innerHTML = fileInfo.name;
        fileLink.onclick = () => this._onFileClick(fileInfo);
        fileNameCell.appendChild(fileLink);

        let fileMimeCell = document.createElement("td");
        fileMimeCell.className = "oneDriveFileAccess_fileMimeCell";
        if(fileInfo.type != fileAccessConstants.FOLDER_TYPE) fileMimeCell.innerHTML = fileInfo.type;
        fileRow.appendChild(fileMimeCell);

        let fileCmdCell = document.createElement("td");
        fileCmdCell.className = "oneDriveFileAccess_fileCmdCell";
        fileRow.appendChild(fileCmdCell);
        /////////////////////////
        let renameButton = document.createElement("button");
        renameButton.className = "oneDriveFileAccess_renameButton";
        renameButton.innerHTML = "Rename";
        fileCmdCell.appendChild(renameButton);
        let deleteButton = document.createElement("button");
        deleteButton.className = "oneDriveFileAccess_deleteButton";
        deleteButton.innerHTML = "Delete";
        fileCmdCell.appendChild(deleteButton);
        /////////////////////////
        
        this.fileElementMap[fileInfo.fileId] = fileRow;

        this.fileListTable.appendChild(fileRow);
    }

    _getIconUrl(mimeType) {
        let resourceName = fileAccessConstants.ICON_MAP[mimeType];
        if(resourceName === undefined) {
            resourceName = fileAccessConstants.DEFAULT_MIME_ICON;
        }
        return uiutil.getResourcePath(resourceName);
    }

}

//These values are saved as defaults for the next time the dialog is used.
let _cachedDriveId = null;
let _cachedFolderId = null;