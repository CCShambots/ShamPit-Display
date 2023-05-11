import React, {useEffect} from "react";
import "./FullScreen.css"

import fullscreen from "../../resources/fullscreen-icon.svg"
import fullscreenClose from "../../resources/fullscreen-close-icon.svg"

function FullscreenIcon(props:any) {

    const [isFullscreen, setIsFullscreen] = React.useState(false);

    function enterFullScreen() {
        document.documentElement.requestFullscreen().then(e => setIsFullscreen(true))
    }

    function closeFullScreen() {
        document.exitFullscreen().then(r => setIsFullscreen(false))
    }

    useEffect(() => {
        document.documentElement.addEventListener("fullscreenchange", () => {
            setIsFullscreen(Boolean(document.fullscreenElement))
        })
    }, [])

    return(!isFullscreen ?
        <img className={"fullscreen-icon"} onClick={enterFullScreen} src={fullscreen}/> :
        <img className={"fullscreen-icon"} onClick={closeFullScreen} src={fullscreenClose}/>
    )
}



export default FullscreenIcon;