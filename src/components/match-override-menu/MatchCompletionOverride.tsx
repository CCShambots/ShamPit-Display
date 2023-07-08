import React, {useState} from "react";
import "./MatchCompletionOverride.css"

import ArrowDown from "../../resources/arrow-down.svg"
import OverrideEntry from "./OverrideEntry";
import {Match} from "../../data/Data";

function MatchCompletionOverride(props: any) {

    let [menuActive, setMenuActive] = useState<boolean>(false)

    //Number of elements currently being deleted, so the height should be reduced
    let [numMinus, setNumMinus] = useState<number>(0)

    let [infoBox, setInfoBox] = useState(false)

    //I'm just going to document how I got this to work here because it was an adventure
    //Basically, by setting a fixed height on "override-container," it stops the element from overflowing out of the screen
    //Changing the height and setting a transition lets it move onto the screen

    //Remove a match from the list of skipped matches
    function remove(m:Match):void {

        setNumMinus(numMinus+1)

        setTimeout(() => {
                let newMatches = props.matches.filter(e => e !== m)

                props.setMatches([...newMatches])

                //Have to do this goofy function so that it actually pulls the current value of numMinus
                setNumMinus(numMinus => numMinus - 1)
            }, 500
        )
    }

    function add(m:Match):void {
        let newMatches = props.matches;

        let dupe = false
        newMatches.forEach(e => {
            if (e.convertToHumanReadableName() === m.convertToHumanReadableName()) dupe = true
        })

        if(!dupe) newMatches.push(m)


        props.setMatches(newMatches)
    }

    return(
        <div
            className={"override-container"}
            style={{height: !menuActive ? "7vh" : (13 + 6 * props.matches.length - 6 * numMinus) +"vh"}}
            >
            <div className={"menu-button"}>
                <img className={"arrow " + (menuActive ? "arrow-up" : "arrow-down")} src={ArrowDown} onClick={() => setMenuActive(!menuActive)} alt={""}/>
            </div>


            <div className={"menu-container"}>
                <div className={"skip-current"}>
                    {/*<p className={"skip-info"} style={{opacity: infoBox ? "1" : "0"}}>*/}
                    {/*    This will indicate that the currently shown match should be disregarded. The site will look for your team's next unplayed match</p>*/}
                    <p onClick={() => {
                        add(props.nextMatch)
                        props.triggerReload()
                    }}   onMouseEnter={() => setInfoBox(true)}
                         onMouseLeave={() => setInfoBox(false)}
                       className={"skip-current-text"}>Skip Current Match</p>
                </div>
                {props.matches.filter(e => e).map(e =>
                    <OverrideEntry removeSelf={() => {
                        remove(e)
                    }} match={e} key={e.convertToHumanReadableName()}/>
                )}
            </div>
        </div>
    )
}


export default MatchCompletionOverride
