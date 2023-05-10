import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import './header.css'
import packageJson from '../../package.json';
import SettingsIcon from "./SettingsIcon";

const Header = (props:any) => {

    const backgroundColor = localStorage.getItem("backgroundColor") || "#004f9e"
    const textColor = localStorage.getItem("textColor") || "#ffffff"

    let teamNumber: number = props.number
    let eventKey: string = props.eventKey

    const [eventName, setEventName] = useState("NO EVENT")


    const fetchInfo = () => {
        fetch("https://www.thebluealliance.com/api/v3/event/" + eventKey, props.options)
            .then(response => {
                return response.json()
            })
            .then(data => {
                setEventName(data.name)
            })
    }

    //Run fetch event name on component load
    useEffect(() => {
        fetchInfo()
    }, [fetchInfo])



    return (
        <div className={"header-container"} style={{backgroundColor: backgroundColor, color: textColor}}>
            <div className={"left-info box"}>
                <div>
                    <Link style={{color: textColor}} to={"https://github.com/CCShambots/5907-pit-display"}>
                        Version: {packageJson.version}
                    </Link>
                    <br/>
                    <Link style={{color: textColor}} to={"https://www.thebluealliance.com/team/" + teamNumber}>Team: {teamNumber}</Link>
                    <br/>
                    <Link style={{color: textColor}} to={"https://www.thebluealliance.com/event/" + eventKey}>Event: {eventKey}</Link>
                </div>
            </div>
            <h1 className={"event-title box"}>{
                //Remove any "presented by" stuff because it takes up too much text
                eventName.substring(0, eventName.indexOf("presented"))
                + (
                    //If there was a "presented" removed and a dash for a division (i.e. FiM states, add that as well
                    eventName.indexOf("presented") != -1 && eventName.indexOf("-") != -1 ?
                        eventName.substring(eventName.indexOf("-")) : ""
                )
            }</h1>
            <div className={"settings box"}>
                <Link className={"settings-icon"} to={"/settings"}>
                    <SettingsIcon color={textColor}></SettingsIcon>
                </Link>
            </div>
        </div>
    );
}

export default Header;