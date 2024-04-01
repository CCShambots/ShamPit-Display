import "./CartPage.css"
import {useEffect, useState} from "react";
import {Alliance, Match} from "../data/Data";
import {useLocalStorage} from "usehooks-ts";
import LocalStorageConstants from "../util/LocalStorageConstants";
import {PullTBA} from "../util/APIUtil";
import IconPreview from "../components/preview/IconPreview";
import FullscreenIcon from "../components/fullscreen/FullscreenIcon";

export default function CartPage() {

    const [apiKey] = useLocalStorage(LocalStorageConstants.API_KEY, "")
    const [teamNumber] = useLocalStorage(LocalStorageConstants.TEAM_NUMBER, "0")
    const [eventKey] = useLocalStorage(LocalStorageConstants.EVENT_KEY, "")

    let teamNum = parseInt(teamNumber)

    let [nextMatch, setNextMatch] = useState<Match>()

    let [nextAlliance, setNextAlliance] = useState<Alliance>()

    let pullURL:string = "event/" + eventKey + "/matches"

    const fetchMatchInfo = () => {
        if(apiKey!=="") {

            console.log("pulling")
            PullTBA(
                pullURL, (data) => {
                    //Convert all the data to match info
                    let matches = Match.arrayFromJson(data)

                    let ourMatches = Match.filterForTeam(matches, teamNum)

                    let unplayedMatches = ourMatches.filter(e => !e.hasBeenPlayed())

                    console.log(unplayedMatches)

                    let nextUp = unplayedMatches.length > 0 ? unplayedMatches[0] : ourMatches[ourMatches.length-1]

                    setNextMatch(nextUp)
                    setNextAlliance(nextUp?.getAllianceOfTeam(teamNum))
                }
            )
        }
    }

    const MINUTE_MS = 60000;

    useEffect(() => {

        fetchMatchInfo()

        const interval = setInterval(() => {
            fetchMatchInfo();

        }, MINUTE_MS * .5);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    return <div className={"cart-page"}>
        <p className={"match-title"}>{nextMatch?.convertToHumanReadableName()}</p>

        {nextAlliance?.numbers.map(e => <IconPreview number={e} key={e}/>)}

        <div className={"fullscreen"}>
            <FullscreenIcon/>
        </div>
    </div>
}