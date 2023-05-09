import Header from "../components/Header";
import React, {useEffect, useState} from "react";
import {Alliance, Alliances, Match} from "../data/Data";
import TeamInfo from "../components/TeamInfo";
import "./MainPage.css"
import SplashText from "../components/SplashText";
import SyncIcon from "../components/SyncIcon";

function MainPage(props: any) {

    //TODO: Interface to scouting app for cycles
    //TODO: Show if a team has a match to play still before they play (maybe)
    //TODO: Dropdown for an event for a team
    //TODO: Add support for pasting a TBA link in full and parsing it to an event key

    //TODO: Make this a number instead of string

    const teamNumber = localStorage.getItem("number") || "0"
    const eventKey = localStorage.getItem("eventKey") || ""

    const apiKey:string = localStorage.getItem("apiKey") || "none"

    let apiOptions = {
        "method" : "GET",
        "headers" : {
            "X-TBA-Auth-Key" : apiKey,
        }
    };

    const [nextMatchName, setNextMatchName] = useState("No Match Found");
    const [matchTime, setMatchTime] = useState("");

    let [matches, setMatches] = useState<Match[]>([])
    let [nextMatch, setNextmatch] = useState<Match>()

    let [redScore, setRedScore] = useState(0)
    let [blueScore, setBlueScore] = useState(0)
    let [willWin, setWillWin] = useState(true)
    let [confidence, setConfidence] = useState(1)

    let [syncing, setSyncing] = useState(false)

    let pullURL:string = "https://www.thebluealliance.com/api/v3/event/" + eventKey + "/matches";

    const fetchMatchInfo = () => {
        setSyncing(true)
        fetch(pullURL,
            apiOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                //Convert all of the data to match info
                let curMatches:Match[] = [];

                data.forEach((e) => {

                    curMatches.push(
                        new Match(
                            e.key,
                            e.comp_level,
                            e.match_number,
                            new Alliances(
                                new Alliance(e.alliances.red.team_keys.map((e) => {
                                    return parseInt(e.substring(3))
                                }), e.alliances.red.score),
                                new Alliance(e.alliances.blue.team_keys.map((e) => {
                                    return parseInt(e.substring(3))
                                }), e.alliances.blue.score)
                            ),
                            new Date(e.predicted_time * 1000)
                        )
                    )

                    curMatches.sort((e1, e2) => {
                        return e1.predicted_time.getTime() - e2.predicted_time.getTime()
                    })

                })

                setMatches(curMatches)
            })
    }

    //Update the next match to play only when the list of matches changes
    useEffect(() => pullNextMatchData(), [matches])

    //Number of MS in a minute
    const MINUTE_MS = 60000;

    //Make the app pull match data only every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMatchInfo();

        }, MINUTE_MS * .5);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])


    /**
     * Determine the next unplayed match by the team
     */
    const pullNextMatchData = () => {

        let ourMatches = matches.filter((e:Match) => {
            let teamNum:number = parseInt(teamNumber)
            return (
                e.alliances.blue.numbers.includes(teamNum)
                || e.alliances.red.numbers.includes(teamNum)
            )
            }
        )

        let ourUnplayedMatches = ourMatches.filter((e:Match) =>
            !(e.alliances.red.score >= 0 && e.alliances.blue.score >= 0)
        );


        let nextMatch:Match  = ourUnplayedMatches.length > 0 ? ourUnplayedMatches[0] : ourMatches[ourMatches.length-1]

        if(nextMatch) {
            setMatchTime(nextMatch.getCorrectDate())
            setNextMatchName(nextMatch.convertToHumanReadableName())

            setNextmatch(nextMatch);

        }
    }

    //Fetch matches info from when the component mounts
    useEffect(() => {
        fetchMatchInfo()
    }, [])

    //Only update match prediction when the next match updates
    useEffect(() => getMatchPrediction(), [nextMatch])

    const getMatchPrediction = () => {
        fetch("https://api.statbotics.io/v2/match/" + nextMatch?.key)
            .then(result => {return result.json() })
            .then(data => {
                setRedScore(data.red_epa_sum)
                setBlueScore(data.blue_epa_sum)

                let alliance = nextMatch?.alliances.red.numbers.includes(parseInt(teamNumber)) ? "red" : "blue";
                setWillWin(data.epa_winner === alliance)
                setConfidence(data.epa_win_prob)

                setSyncing(false)
            })
    }

    return (
        <div className="App">
            <Header number={parseInt(teamNumber)} eventKey={eventKey} options={apiOptions}/>
            <div className="main-app">
                <div>
                    <h1 className={"next-match"}>Next Match: {nextMatchName}</h1>
                    {/*<SplashText/>*/}
                </div>
                <h2 className={"next-match"}>{matchTime}</h2>

                <div className={"alliances-container"}>
                    <div className = {"alliance-info"}>
                        {getTeamInfoSet(nextMatch?.alliances.red)}
                    </div>
                    <div className = {"alliance-info"}>
                        {getTeamInfoSet(nextMatch?.alliances.blue)}
                    </div>
                </div>
                <div className={"score-results"}>
                    <h2 className={"alliance-score"}>{redScore}</h2>
                    <h2 className={"alliance-score"}>{blueScore}</h2>
                </div>
                <div className={"bottom-content"}>
                    <div onClick={() => fetchMatchInfo()}>
                        <SyncIcon syncing={syncing}/>
                    </div>
                    <div className={"next-match prediction " + (willWin ? "win" : "loss")}>
                        <h2 >Match Prediction: {willWin ? "Win" : "Loss"} ({Math.round(confidence * 100)})%</h2>
                    </div>
                    <div></div>
                </div>
            </div>

        </div>
    );

    function getTeamInfoSet(alliance:Alliance|undefined) {
        if(alliance !== undefined) {

            let num = 0

            return alliance.numbers.map((e) => {
                num++
                return <TeamInfo number={e} activeTeam={parseInt(teamNumber) === e} key={num} apiOptions={apiOptions}/>
            })
        }
    }
}


export default MainPage;