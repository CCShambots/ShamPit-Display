import React, {useState} from "react";
import {HexColorInput, HexColorPicker} from "react-colorful";
import "./SettingsPage.css";
import {Link} from "react-router-dom";



function SettingsPage(props: any) {

    console.log(localStorage.getItem("number") || "5907");

    const [backgroundColor, setBackgroundColor] =
        useState(localStorage.getItem("backgroundColor") || "#004f9e");
    const [textColor, setTextColor] = useState(localStorage.getItem("textColor") || "#ffffff");

    const [teamNumber, setTeamNumber] = useState(parseInt(JSON.parse(localStorage.getItem("number") || "5907")));
    const [eventKey, setEventKey] = useState(localStorage.getItem("eventKey") || "2023milan");

    const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "none");

    function withEvent(func: Function): React.ChangeEventHandler<any> {
        return (event: React.ChangeEvent<any>) => {
            const { target } = event;
            func(target.value);
        };
    }

    function save(input:any) {
        localStorage.setItem("number", String(teamNumber));
        localStorage.setItem("eventKey", eventKey);
        localStorage.setItem("backgroundColor", backgroundColor);
        localStorage.setItem("textColor", textColor);
        localStorage.setItem("apiKey", apiKey);
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
                <input className={"input"} type={"text"} onChange={withEvent(setEventKey)} value={eventKey}></input>
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