import React from "react";
import "./SyncIcon.css"
import syncIcon from "../resources/sync-icon.svg"
import refreshIcon from "../resources/refresh-icon.svg"

function SyncIcon(props:any) {
    return props.syncing ?
        <img className={"reload-icon sync-icon"} src={syncIcon} alt={"image failed to load :("}/> :
        <img onClick={props.click} className={"reload-icon"}  src={refreshIcon} alt={"image failed to load :("}/>
}

export default SyncIcon;
