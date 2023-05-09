import React from "react";
import "./SyncIcon.css"
import syncIcon from "../resources/sync-icon.svg"
import refreshIcon from "../resources/refresh-icon.svg"

function SyncIcon(props:any) {
    return <div className={"reload-icon"}>
        <img className={"sync-icon"} style={{display: props.syncing ? "" : "none"}} src={syncIcon}/>
        <img style={{display: !props.syncing ? "" : "none"}} src={refreshIcon}/>
    </div>
}

export default SyncIcon;
