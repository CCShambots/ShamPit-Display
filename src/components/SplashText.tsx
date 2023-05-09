import React, {useEffect, useState} from "react";
import "./SplashText.css"
import splashes from "./Splashes";

function SplashText(props: any) {


    const [text, setText] = useState("SPLASH!")

    //Number of MS in a minute
    const MINUTE_MS = 60000;


    useEffect(() => {
        const interval = setInterval(() => {
            setText(pickRandom);

        }, MINUTE_MS * 5);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    useEffect(() => {
        setText(pickRandom)
    }, [])

    return(
        <div className={"tilt"}>
            <h1 className={"splash"}>{text}</h1>
        </div>
    )

    function pickRandom():string {
        return splashes[Math.floor(Math.random()*splashes.length)];
    }
}

export default SplashText;