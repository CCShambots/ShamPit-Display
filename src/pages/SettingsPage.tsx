import React, {useEffect, useState} from "react";
import {HexColorInput, HexColorPicker} from "react-colorful";
import "./SettingsPage.css";
import {Link} from "react-router-dom";
import {Event} from "../data/Event";
import packageJson from "../../package.json";



function SettingsPage(props: any)
 {

    console.log(localStorage.getItem("number") || "");

    const [backgroundColor, setBackgroundColor] =
        useState(localStorage.getItem("backgroundColor") || "#004f9e");
    const [textColor, setTextColor] = useState(localStorage.getItem("textColor") || "#ffffff");

    const [teamNumber, setTeamNumber] = useState(parseInt(JSON.parse(localStorage.getItem("number") || "")));
    const [eventKey, setEventKey] = useState(localStorage.getItem("eventKey") || "");

    const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "none");

    const [teamEvents, setTeamEvents] = useState<Event[]>([])

     //This fixed an error sometime, but I didn't document it. Sorry
    function withEvent(func: Function): React.ChangeEventHandler<any> {
        return (event: React.ChangeEvent<any>) => {
            const { target } = event;
            func(target.value);
        };
    }

    useEffect(() => {
        if(eventKey.indexOf("thebluealliance.com/event") != -1) {
            setEventKey(eventKey.substring(eventKey.lastIndexOf("/") + 1))
        }

    }, [eventKey])

     useEffect(() => {
         let apiOptions = {
             "method" : "GET",
             "headers" : {
                 "X-TBA-Auth-Key" : apiKey,
             }
         };

         fetch(
             "https://www.thebluealliance.com/api/v3/team/frc" + teamNumber + "/events/" +
             packageJson.version.substring(0, 4), apiOptions).then(response => response.json())
             .then(data => {
                 let teamEvents:Event[] = []
                 try {
                     data.forEach(teamEvent => {
                         teamEvents.push(new Event(teamEvent.name, teamEvent.key))
                     })
                 } catch (e) {}

                 setTeamEvents(teamEvents)
             })
     }, [teamNumber, apiKey])

     //Save all settings to local storage
    function save(input:any) {
        localStorage.setItem("number", String(teamNumber));
        localStorage.setItem("eventKey", eventKey);
        localStorage.setItem("backgroundColor", backgroundColor);
        localStorage.setItem("textColor", textColor);
        localStorage.setItem("apiKey", apiKey);
    }

    function handleEventSelection(value:string) {
        if(value != "none") setEventKey(value)
    }

    //Determines whether the current event key matches one of the events
    function isCurrentKeyMatching():boolean {
        let value = false
        teamEvents.forEach(e => {
            if(e.key == eventKey) value = true
        })

        return value
    }

    return <div className={"App"}>
        <h1 className={"title"} style={{background: backgroundColor, color: textColor}}>Settings</h1>

        <div className={"settings"}>
            {/*Inputs for the settings info*/}
            <div className={"settings-container"}>
                <h2>Team Number</h2>
                <input className={"input"} type={"text"} id={"team-number"} value={teamNumber}
                       minLength={1} maxLength={4} onChange={withEvent(setTeamNumber)}></input>
            </div>

            <div className={"settings-container"}>
                <h2>Event Key</h2>
                <input className={"input " + (isCurrentKeyMatching() ? "valid" : "")} type={"text"} onChange={withEvent(setEventKey)} value={eventKey}></input>
            </div>

            <div className={"settings-container"}>

                <h2>Select From Team's Events</h2>

                <select className={"input"} onChange={withEvent(handleEventSelection)} value={eventKey} defaultValue={"none"}>
                    <option value={"none"}>[Using Custom Event Key]</option>
                    {/*Include all events the team is playing at*/}
                    {teamEvents.map((e) => <option value={e.key}>{e.name}</option>)}
                </select>
            </div>

            <div className={"settings-container"}>
                <h2>TBA API Key</h2>
                <input className={"input long"} type={"text"} onChange={withEvent(setApiKey)} value={apiKey}></input>
            </div>

            <div className={"settings-container"}>
                <h2 className={"color-text"}>Ribbon Background Color</h2>
                <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} ></HexColorPicker>
                <HexColorInput className={"input color-input background-input"}
                               color={backgroundColor} onChange={setBackgroundColor} />
            </div>

            <div className={"settings-container"}>
                <h2 className={"color-text"}>Ribbon Text Color</h2>
                <HexColorPicker color={textColor} onChange={setTextColor} ></HexColorPicker>

                {/*Allow the user to set the color easily to black or white*/}
                <div className={"color-buttons"}>
                    <div className={"color-button black"} onClick={() => setTextColor("#000000")}>
                        Black
                    </div>
                    <HexColorInput className={"input color-input"} color={textColor} onChange={setTextColor} />
                    <div className={"color-button white"} onClick={() => setTextColor("#ffffff")}>
                        White
                    </div>
                </div>
            </div>

            <div className={"settings-container"}>
                <Link onClick={save} to={"/"} className={"color-button green bottom-button"}>
                    Save
                </Link>
                <Link to={"/"} className={"color-button red bottom-button"}>
                    Cancel
                </Link>
            </div>
        </div>

    </div>
}

export default SettingsPage;