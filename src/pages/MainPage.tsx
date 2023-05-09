import Header from "../components/Header";
import logo from "../resources/logo.svg";
import React, {useState} from "react";

function MainPage(props: any) {


    const number = localStorage.getItem("number") || "5907"
    const eventKey = localStorage.getItem("eventKey") || "2023milan"

    const apiKey:string = localStorage.getItem("apiKey") || "none"

    let apiOptions = {
        "method" : "GET",
        "headers" : {
            "X-TBA-Auth-Key" : apiKey,
        }
    };

    return (
        <div className="App">
            <Header number={parseInt(number)} eventKey={eventKey} options={apiOptions}/>
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
            </header>
        </div>
    );
}

export default MainPage;