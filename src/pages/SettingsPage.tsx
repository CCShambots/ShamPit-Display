import React, {useEffect, useRef, useState} from "react";
import {HexColorInput, HexColorPicker} from "react-colorful";
import "./SettingsPage.css";
import {Link} from "react-router-dom";
import {Event} from "../data/Event";
import {useLocalStorage} from "usehooks-ts";
import packageJson from "../../package.json"
import LocalStorageConstants from "../util/LocalStorageConstants";
import {Authorize, CheckJWT} from "../util/APIUtil";
import {Button, Dropdown, Input, Popup} from "semantic-ui-react";


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

     //Un-save all settings to local storage
    function cancel() {
        setTeamNumber(originalTeamNumber)
        setEventKey(originalEventKey)
        setBackgroundColor(originalBackgroundColor)
        setTextColor(originalTextColor)
        setApiKey(originalAPIKey)
        setConfidenceCutoff(originalConfidenceCutoff)
    }

    function handleEventSelection(e: any, {value}: any) {
        console.log(value)

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
                <Input className={"long"} type={"text"}
                       onClick={() => {
                           if(apiKey === "none") setApiKey("")
                       }}
                       onChange={withEvent(setApiKey)} value={apiKey}></Input>
            </div>

            <div className={"settings-container"}>
                <h2>Team Number</h2>
                <Input type={"number"} id={"team-number"} value={teamNumber}
                       minLength={1} maxLength={4} onChange={withEvent(setTeamNumber)}></Input>
            </div>

            <div className={"settings-container"}>

                <h2>Select From Team's Events</h2>

                <Dropdown
                    onChange={handleEventSelection}
                    value={eventKey}
                    selection
                    options={teamEvents.map(e => {return {key: e.key, text: e.name, value: e.key}})}
                />
            </div>

            <div className={"settings-container"}>
                <Popup
                    inverted
                    trigger={
                        <h2>Event Key</h2>
                    }
                    content="Optional if you select an event from the dropdown"
                />

                <Input error={!isCurrentKeyMatching()} type={"text"} onChange={withEvent(setEventKey)} value={eventKey}></Input>
            </div>

            <div className={"settings-container"}>
                <Popup
                    inverted
                    trigger={
                        <h2>Confidence Cutoff</h2>
                    }

                    content="The win chance at which the display will turn from yellow to red or green. In interval [0,1]."

                />

                <Input type={"text"} onChange={withEvent(setConfidenceCutoff)} value={confidenceCutoff}></Input>
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
                    <Button size={"massive"} color={"black"} onClick={() => setTextColor("#000000")}>Black</Button>

                    <HexColorInput className={"input color-input"} color={textColor} onChange={setTextColor} />

                    <Button size={"massive"} onClick={() => setTextColor("#ffffff")}>White</Button>
                </div>
            </div>

            {
                needToAuthorize ?
                    <div className={"settings-container"}>
                        <div className={"margin-right"}>
                            <a className={"white-link"} href={"https://scout.voth.name:3000/protected/code"} target={"_blank"} rel={"noreferrer"}>
                                <Button size={"large"} inverted>Get One Time Code</Button>
                            </a>
                            <p>Copy the code you get into the input</p>
                        </div>
                        <Input type={"text"} onChange={withEvent(setTempCode)}/>
                    </div>
                : <div className={"settings-container"}>
                    <h2>You're authorized with the database!</h2>
                </div>
            }

            {
                needToAuthorize ?
                    <div>
                        <div className={"settings-container"}>
                            <h2>Set Email</h2>
                            <Input className={"input"} type={"text"} value={email} onChange={withEvent(setEmail)}/>
                        </div>
                        <div className={"settings-container"}>
                            <Button onClick={handleAPIAurhorize} size={"massive"} color={"green"}>Authorize</Button>
                        </div>
                    </div>
                : <div/>
            }

            <div className={"settings-container"}>
                <Link to={"/"}>
                    <Button size={"massive"} color={"green"}>Save</Button>
                </Link>
                <Link onClick={() => cancel()} to={"/"}>
                    <Button size={"massive"} color={"red"}>Cancel</Button>
                </Link>
            </div>
        </div>

    </div>
}

export default SettingsPage;