import Header from "../components/header/Header";
import React, {useEffect, useState} from "react";
import {Alliance, Alliances, Match} from "../data/Data";
import TeamInfo from "../components/TeamInfo";
import "./MainPage.css"
import SyncIcon from "../components/sync-icon/SyncIcon";
import FullscreenIcon from "../components/fullscreen/FullscreenIcon";
import {Link, useNavigate} from "react-router-dom";
import MatchCompletionOverride from "../components/match-override-menu/MatchCompletionOverride";
import packageJson from "../../package.json";

function MainPage(props: any) {

    //TODO: Interface to scouting app for cycles

    //TODO: Stop errors from happening

    //TODO: Use function parameters instead of types

    //TODO: Make top left text change height dynamically
    //TODO: Offline mode?

    //TODO: Cache EPAs in the proper way

    //TODO: pull events that a team is participating in in a better way

    const teamNumber = localStorage.getItem("number") || "0"
    const eventKey = localStorage.getItem("eventKey") || ""

    const apiKey:string = localStorage.getItem("apiKey") || "none"

    let apiOptions = {
        "method" : "GET",
        "headers" : {
            "X-TBA-Auth-Key" : apiKey,
        }
    };

    const navigate = useNavigate();

    useEffect(() => {

        if(!localStorage.getItem("apiKey")) navigate('settings', { replace: true });
    }, [navigate]);

    const [nextMatchName, setNextMatchName] = useState("No Match Found");
    const [matchTime, setMatchTime] = useState("");

    let [matches, setMatches] = useState<Match[]>([])
    let [nextMatch, setNextMatch] = useState<Match>()
    let [nextMatchIndex, setNextMatchIndex] = useState<number>(0)

    //Matches that the user has indicated have already occurred and should be ignored
    let [skipMatches, setSkipMatches] = useState<Match[]>([])

    //The index of the last played match
    let [lastPlayedMatch, setLastPlayedMatch] = useState(-1)

    let [redScore, setRedScore] = useState(0)
    let [blueScore, setBlueScore] = useState(0)
    let [willWin, setWillWin] = useState(true)
    let [confidence, setConfidence] = useState(1)

    let [syncing, setSyncing] = useState(false)

    let pullURL:string = "https://www.thebluealliance.com/api/v3/event/" + eventKey + "/matches"

    const fetchMatchInfo = () => {
        setSyncing(true)
        if(apiKey!=="") {
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
                }).catch(e => {})
        }

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
     * Determine the next un-played match by the team
     */
    const pullNextMatchData = () => {


        let unplayedMatches = matches.filter((e:Match) =>
            !(e.alliances.red.score >= 0 && e.alliances.blue.score >= 0)
        );

        let playedMatches = matches.filter(e => !unplayedMatches.includes(e))

        setLastPlayedMatch(matches.indexOf(playedMatches[playedMatches.length-1]))

        let ourMatches = matches.filter((e:Match) => {
            let teamNum:number = parseInt(teamNumber)
            return (
                e.alliances.blue.numbers.includes(teamNum)
                || e.alliances.red.numbers.includes(teamNum)
            )
            }
        )

        let ourUnplayedMatches = ourMatches.filter(x =>  {
            return unplayedMatches.includes(x) && !skipMatches.includes(x)
        })

        let nextMatch:Match  = ourUnplayedMatches.length > 0 ? ourUnplayedMatches[0] : ourMatches[ourMatches.length-1]

        if(nextMatch) {
            setMatchTime(nextMatch.getCorrectDate())
            setNextMatchIndex(matches.indexOf(nextMatch))
            setNextMatchName(nextMatch.convertToHumanReadableName())

            setNextMatch(nextMatch);
        }
    }

    //Fetch matches info from when the component mounts
    useEffect(() => {
        fetchMatchInfo()
    }, [])

    //Only update match prediction when the next match updates
    const getMatchPrediction = () => {
        if(nextMatch !== undefined) {
                fetch("https://api.statbotics.io/v2/match/" + nextMatch?.key)
                    .then(result => {return result.json() })
                    .then(data => {

                        //If there is no data included in the response (i.e.the match cannot be found on statbotics), throw an error to do the calculations manually
                        if(Object.keys(data).length === 0) throw Error();

                        setRedScore(data.red_epa_sum)
                        setBlueScore(data.blue_epa_sum)

                        let alliance = nextMatch?.alliances.red.numbers.includes(parseInt(teamNumber)) ? "red" : "blue";
                        setWillWin(data.epa_winner === alliance)
                        //win_prob is always from red alliance perspective, so we flip the probability for when our selected team is on the blue alliance
                        setConfidence(alliance === "red" ? data.epa_win_prob : 1 - data.epa_win_prob)

                        setSyncing(false)
                    })
                    .catch(async e => {
                        //We were unable to get the match result from statbotics (potentially because it's an offseason event). We'll run our own manual summation in that case

                        let redTotal = await getSumOfEPAs(nextMatch?.alliances.red.numbers ?? [1])
                        let blueTotal = await getSumOfEPAs(nextMatch?.alliances.blue.numbers ?? [1])

                        redTotal = Math.round(redTotal);
                        blueTotal = Math.round(blueTotal);

                        setRedScore(redTotal);
                        setBlueScore(blueTotal);

                        let teamAlliance = nextMatch?.alliances.red.numbers.includes(parseInt(teamNumber)) ? "red" : "blue";
                        let winningAlliance = redTotal > blueTotal ? "red" : "blue";

                        setWillWin(teamAlliance === winningAlliance);

                        setConfidence(-1);


                    }
                )
        }

    }


    useEffect(() => getMatchPrediction(), [nextMatch, getMatchPrediction])


    return (
        <div className="App">
            <Header number={parseInt(teamNumber)} eventKey={eventKey} options={apiOptions}/>
            <div className="main-app">
                <div className={"top-info"}>
                    <b>
                        {
                            lastPlayedMatch >= 0 ?
                                <p className={"top-text"}>Last Played: {matches[lastPlayedMatch].convertToHumanReadableName()}</p> :
                                <p className={"top-text"}>Last Played: None</p>
                        }
                    </b>

                    <h1 className={"next-match"}>Next Match: {nextMatchName}</h1>

                    <div>
                        <p className={"top-text"}>EPA provided by <Link target={"_blank"} style={{color: "white"}} to={"https://www.statbotics.io"}>Statbotics</Link></p>

                    </div>
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
                    <MatchCompletionOverride triggerReload={fetchMatchInfo} nextMatch={nextMatch} matches={skipMatches} setMatches={setSkipMatches}/>
                </div>
                <div className={"bottom-content"}>
                    <SyncIcon click={fetchMatchInfo} syncing={syncing}/>
                    <div className={"next-match prediction " + (willWin ? "win" : "loss")}>
                        <h2>Match Prediction: {willWin ? "Win" : "Loss"} ({confidence !== -1 ? Math.round(confidence * 100): "¯\\_(ツ)_/¯"}%)</h2>
                    </div>
                    <FullscreenIcon/>
                </div>
            </div>

        </div>
    );

    function getTeamInfoSet(alliance:Alliance|undefined) {
        if(alliance !== undefined) {

            let num = 0

            return alliance.numbers.map((e) => {

                //Determine if the team has another match still to play before this match that they're playing in
                let upcomingMatch:Match|null = null

                for(let i = lastPlayedMatch+1; i<nextMatchIndex; i++) {
                    let thisMatch = matches[i]

                    if(thisMatch.alliances.getTeams().includes(e)) {

                        upcomingMatch = thisMatch;
                        break;
                    }
                }

                num++
                return <TeamInfo number={e} activeTeam={parseInt(teamNumber) === e} key={num} upcomingMatch={upcomingMatch} apiOptions={apiOptions}/>
            })
        }
    }
}

const year = packageJson.version.substring(0, 4);

async function getSumOfEPAs(teamNumbers:number[]):Promise<number> {

    return teamNumbers.reduce(async (sum, current) => {
        return await fetch("https://api.statbotics.io/v2/team_year/" + current + "/" + year)
            .then(response => {
                return response.json()
            })
            .then(async data => {
                //Take the team's data
                return (await sum) + data.epa_end
            })

    }, Promise.resolve(0));
}


export default MainPage;