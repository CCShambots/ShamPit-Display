import React, {useEffect, useRef, useState} from "react";
import {HexColorInput, HexColorPicker} from "react-colorful";
import "./SettingsPage.css";
import {Link} from "react-router-dom";
import {Event} from "../data/Event";
import {useLocalStorage} from "usehooks-ts";
import packageJson from "../../package.json"
import LocalStorageConstants from "../util/LocalStorageConstants";
import {get} from "node:https";
import {Authorize, CheckJWT} from "../util/APIUtil";


function SettingsPage() {

    let year = packageJson.version.substring(0, 4)

    const [backgroundColor, setBackgroundColor] =
        useLocalStorage(LocalStorageConstants.BACKGROUND_COLOR, "#004f9e");

    let [originalBackgroundColor] = useState(() => backgroundColor)


    const [textColor, setTextColor] =
        useLocalStorage(LocalStorageConstants.TEXT_COLOR, "#ffffff");

    let [originalTextColor] = useState(() => textColor)


    const [teamNumber, setTeamNumber] = useLocalStorage(LocalStorageConstants.TEAM_NUMBER, "0");
    let [originalTeamNumber] = useState(() => teamNumber)

    const [eventKey, setEventKey] = useLocalStorage(LocalStorageConstants.EVENT_KEY, "");
    let [originalEventKey] = useState(() => eventKey)

    const [apiKey, setApiKey] = useLocalStorage(LocalStorageConstants.API_KEY, "none");
    let [originalAPIKey] = useState(() => apiKey)

    //Where to change a match from yellow to green or red
    const [confidenceCutoff, setConfidenceCutoff] = useLocalStorage(LocalStorageConstants.CONFIDENCE_CUTOFF, 0.15);
    let [originalConfidenceCutoff] = useState(() => confidenceCutoff)

    const [teamEvents, setTeamEvents] = useState<Event[]>([])

    const [jwt, setJwt]  = useLocalStorage(LocalStorageConstants.JWT, "")
    const [email, setEmail] = useLocalStorage(LocalStorageConstants.EMAIL, "")
    const [tempCode, setTempCode] = useState("")
    const [needToAuthorize, setNeedToAuthorize] = useState(false)

    //Check JWT info
    useEffect(() => {
        try {
            CheckJWT(jwt).then((status) => {
                if(status !== 200) {
                    setNeedToAuthorize(true)
                }
            })

        } catch {
            //Auth fails becauseno JWT saved
            setNeedToAuthorize(true)
        }

    }, []);

     //This fixed an error sometime, but I didn't document it. Sorry
    function withEvent(func: Function): React.ChangeEventHandler<any> {
        return (event: React.ChangeEvent<any>) => {
            const { target } = event;
            func(target.value);
        };
    }

    useEffect(() => {
        //Parse event key down to just the event key if it is set through the dropdown (link to an event)
        if(eventKey.indexOf("thebluealliance.com/event") !== -1) {
            setEventKey(eventKey.substring(eventKey.lastIndexOf("/") + 1))
        }

    }, [eventKey, setEventKey])

    let currentTeamNum = useRef(0)

    //Pull the events that this team is part of
     useEffect(() => {

         currentTeamNum.current = teamNumber

         //Make sure that there is an API Key
         if(apiKey !== "") {
             const key:string = localStorage.getItem("apiKey") || "none";

             let apiOptions = {
                 "method" : "GET",
                 "headers" : {
                     "X-TBA-Auth-Key" : key.substring(1, key.length-1)
                 }
             };

             try {
                 fetch(`https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/events/${year}`, apiOptions)
                     .then(async (response) => {
                         return {json: await response.json(), reqUrl: response.url}
                     })
                     .then((info) => {

                         let data = info.json

                         let teamEvents:Event[] = []
                         try {
                             data.forEach(teamEvent => {
                                 teamEvents.push(new Event(teamEvent.name, teamEvent.key))
                             })
                         } catch (e) {}

                         if(info.reqUrl.indexOf(currentTeamNum.current.toString())) {
                             setTeamEvents(teamEvents)
                         }
                     })
                     .catch(() => {})

             } catch (e) {}
         }
     }, [apiKey, teamNumber])

     //Save all settings to local storage
    function cancel() {
        setTeamNumber(originalTeamNumber)
        setEventKey(originalEventKey)
        setBackgroundColor(originalBackgroundColor)
        setTextColor(originalTextColor)
        setApiKey(originalAPIKey)
        setConfidenceCutoff(originalConfidenceCutoff)
    }

    function handleEventSelection(value:string) {
        if(value !== "none") setEventKey(value)
    }

    //Determines whether the current event key matches one of the events
    function isCurrentKeyMatching():boolean {
        let value = false
        teamEvents.forEach(e => {
            if(e.key === eventKey) value = true
        })

        return value
    }

    function handleAPIAurhorize() {
        Authorize(tempCode, email).then((code) => {
            setJwt(code)
            setNeedToAuthorize(false)

        });
    }

    return <div className={"settings-page"}>
        <h1 className={"title"} style={{background: backgroundColor, color: textColor}}>Settings</h1>

        <div className={"settings"}>
            {/*Inputs for the settings info*/}

            <div className={"settings-container"}>
                <h2>TBA API Key</h2>
                <input className={"input long"} type={"text"}
                       onClick={() => {
                           if(apiKey === "none") setApiKey("")
                       }}
                       onChange={withEvent(setApiKey)} value={apiKey}></input>
            </div>

            <div className={"settings-container"}>
                <h2>Team Number</h2>
                <input className={"input"} type={"text"} id={"team-number"} value={teamNumber}
                       minLength={1} maxLength={4} onChange={withEvent(setTeamNumber)}></input>
            </div>

            <div className={"settings-container"}>

                <h2>Select From Team's Events</h2>

                <select className={"input"} onChange={withEvent(handleEventSelection)} value={eventKey}>
                    <option key={"none"} value={"none"}>[Using Custom Event Key]</option>
                    {/*Include all events the team is playing at*/}
                    {teamEvents.map((e) => <option key={e.key} value={e.key}>{e.name}</option>)}
                </select>
            </div>

            <div className={"settings-container"}>
                <div>
                    <h2>Event Key</h2>
                    <p className={"small-text"}>*Optional if you select an event from the dropdown</p>
                </div>

                <input className={"input " + (isCurrentKeyMatching() ? "valid" : "")} type={"text"} onChange={withEvent(setEventKey)} value={eventKey}></input>
            </div>

            <div className={"settings-container"}>
                <div>
                    <h2>Confidence Cutoff</h2>
                    <p className={"small-text"}>*The win chance at which the display will turn from yellow to red or green. In interval [0,1].</p>
                </div>

                <input className={"input"} type={"text"} onChange={withEvent(setConfidenceCutoff)} value={confidenceCutoff}></input>
            </div>

            <div className={"settings-container"}>
                <h2 className={"color-text"}>Ribbon Background Color</h2>
                <HexColorPicker style={{height: "15vh", width: "15vh"}} color={backgroundColor} onChange={setBackgroundColor}></HexColorPicker>
                <HexColorInput className={"input color-input background-input"}
                               color={backgroundColor} onChange={setBackgroundColor} />
            </div>

            <div className={"settings-container"}>
                <h2 className={"color-text"}>Ribbon Text Color</h2>
                <HexColorPicker style={{height: "15vh", width: "15vh"}} color={textColor} onChange={setTextColor}></HexColorPicker>

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

            {
                needToAuthorize ?
                    <div className={"settings-container"}>
                        <div>
                            <h2><a className={"white-link"} href={"https://scout.voth.name:3000/protected/code"} target={"_blank"} rel={"noreferrer"}>
                                Get One Time Code
                            </a></h2>
                            <p>Copy the code you get into the input</p>
                        </div>
                        <input className={"input"} type={"text"} onChange={withEvent(setTempCode)}/>
                    </div>
                : <div className={"settings-container"}>
                    <h2>You're authorized with the database!</h2>
                </div>
            }

            {
                needToAuthorize ?
                    <div className={"settings-container"}>
                        <h2>Set Email</h2>
                        <input className={"input"} type={"text"} value={email} onChange={withEvent(setEmail)}/>
                        <div onClick={handleAPIAurhorize} className={"color-button green"}>Authorize</div>
                    </div> : <div/>
            }

            <div className={"settings-container"}>
                <Link to={"/"} className={"color-button green bottom-button"}>
                    Save
                </Link>
                <Link onClick={() => cancel()} to={"/"} className={"color-button red bottom-button"}>
                    Cancel
                </Link>
            </div>
        </div>

    </div>
}

export default SettingsPage;