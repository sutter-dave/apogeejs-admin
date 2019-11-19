

//=====================================
// UI Entry Point
//=====================================

export function saveWorkspace(app,fileAccessObject,doDirectSave) {

    var activeWorkspaceUI = app.getWorkspaceUI();
    var workspaceText;
    var fileMetadata;
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson();
        workspaceText = JSON.stringify(workspaceJson);
        fileMetadata = activeWorkspaceUI.getFileMetadata();
    }
    else {
        alert("There is no workspace open.");
        return;
    }

    //clear workspace dirty flag on completion of save
    var onSaveSuccess = (updatedFileMetadata) => {
        var workspaceUI = app.getWorkspaceUI();
        workspaceUI.setFileMetadata(updatedFileMetadata);
        workspaceUI.clearIsDirty();
    }

    if((!doDirectSave)||(!fileMetadata)||(!fileMetadata.directSaveOk)) {
        fileAccessObject.showSaveDialog(fileMetadata,workspaceText,onSaveSuccess);
    }
    else {
        fileAccessObject.saveFile(fileMetadata,workspaceText,onSaveSuccess);
    }
}