import React, { useEffect, useState } from 'react';
import './header.css'
import packageJson from '../package.json';
import settingsIcon from './resources/settings.svg';

const Header = () => {
    let apiKey: string = "GMjNpiCtT4jRGEj2WW5jFZrUupjBKdDRoLvkIL8ec5pMsO8lVTaFatPTbFWZAJQ3"

    let apiOptions = {
        "method" : "GET",
        "headers" : {
            "X-TBA-Auth-Key" : apiKey,
        }
    };

    let eventKey: string = "2023milan"
    let teamNumber: number = 5907;

    const [eventName, setEventName] = useState("NO EVENT")


    const fetchInfo = () => {
        fetch("https://www.thebluealliance.com/api/v3/event/" + eventKey, apiOptions)
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
        <div className={"header-container"}>
            <div className={"left-info box"}>
                <div>
                    <p>Version: {packageJson.version}</p>
                    <p>Team: {teamNumber}</p>
                </div>
            </div>
            <h1 className={"event-title box"}>{eventName}</h1>
            <div className={"settings box"}>
                <img className={"settings-icon"} src={settingsIcon} alt={"Settings"}></img>
            </div>
        </div>
    );
}

export default Header;