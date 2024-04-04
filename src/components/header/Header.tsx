import React, {useEffect, useState} from 'react';
import { Link } from "react-router-dom";
import './header.css'
import packageJson from '../../../package.json';
import {PullTBA} from "../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import LocalStorageConstants from "../../util/LocalStorageConstants";
import {Button, Popup} from "semantic-ui-react";

const Header = (props: {number:number, eventKey:string}) => {

    const [backgroundColor] = useLocalStorage(LocalStorageConstants.BACKGROUND_COLOR, "#004f9e")
    const [textColor] = useLocalStorage(LocalStorageConstants.TEXT_COLOR, "#ffffff")

    let teamNumber: number = props.number
    let eventKey: string = props.eventKey

    const [eventName, setEventName] = useState("NO EVENT")
    
    //Fetch the event title when the component loads
    PullTBA(`event/${eventKey}`, (data) => {

        let name = data.name;

        name = name.replace(/first in michigan state championship/gi, "MSC");

        setEventName(name)
    })


    return (
        <div className={"header-container"} style={{backgroundColor: backgroundColor, color: textColor}}>
            <div className={"left-info box"}>
                <div className={"left-info-spread"}>
                    <Link target={"_blank"} style={{color: textColor}}
                          to={"https://github.com/CCShambots/5907-pit-display"}>
                        Version: {packageJson.version}
                    </Link>
                    <Link target={"_blank"} style={{color: textColor}}
                          to={"https://www.thebluealliance.com/team/" + teamNumber}>Team: {teamNumber}</Link>
                    <Link target={"_blank"} style={{color: textColor}}
                          to={"https://www.thebluealliance.com/event/" + eventKey}>Event: {eventKey}</Link>
                </div>
            </div>
            <h1 className={"event-title box"}>{
                eventName !== undefined && eventName.indexOf("presented") !== -1 ?
                    (
                        //Remove any "presented by" stuff because it takes up too much text
                        eventName.substring(0, eventName.indexOf("presented"))
                        + (
                            //If there was a "presented" removed and a dash for a division (i.e. FiM states, add that as well
                            eventName.indexOf("presented") !== -1 && eventName.indexOf("-") !== -1 ?
                                eventName.substring(eventName.indexOf("-")) : ""
                        )
                    ) : eventName
            }</h1>
            <div className={"settings box"}>
                <Link className={"settings-icon"} to={"cart"}>
                    <Popup
                        trigger={
                            <Button size={"huge"} icon={"cart"} inverted></Button>
                        }
                        content={"Cart Display"}
                    />
                </Link>
                <Link className={"settings-icon"} to={"settings"}>
                    <Popup
                        trigger={
                            <Button size={"huge"} icon={"settings"} inverted></Button>
                        }
                        content={"Settings"}
                    />
                </Link>
            </div>
        </div>
    );
}

export default Header;