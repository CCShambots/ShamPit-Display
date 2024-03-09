import Header from "../components/header/Header";
import React, {useEffect, useRef, useState} from "react";
import {Alliance, Alliances, Match} from "../data/Data";
import TeamInfo from "../components/TeamInfo";
import "./MainPage.css"
import SyncIcon from "../components/sync-icon/SyncIcon";
import FullscreenIcon from "../components/fullscreen/FullscreenIcon";
import {Link, useNavigate} from "react-router-dom";
import MatchCompletionOverride from "../components/match-override-menu/MatchCompletionOverride";
import {useLocalStorage} from "usehooks-ts";
import {PullTBA} from "../util/APIUtil";
import ReactConfetti from "react-confetti";
import LocalStorageConstants from "../util/LocalStorageConstants";


function MainPage() {

    const [teamNumber] = useLocalStorage(LocalStorageConstants.TEAM_NUMBER, "0")
    const [eventKey] = useLocalStorage(LocalStorageConstants.EVENT_KEY, "")

    let year = eventKey.substring(0,4)

    const [apiKey] = useLocalStorage(LocalStorageConstants.API_KEY, "")

    const [confidenceCutoff] = useLocalStorage(LocalStorageConstants.CONFIDENCE_CUTOFF, 0.25)

    const navigate = useNavigate();

    useEffect(() => {

        //Automatically redirect to the settings page if no TBA API key is set
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

    let [yourLastMatch, setYourLastMatch] = useState<Match>()
    const [confetti, setConfetti] = useState(false)
    let confettiDurationMS = 10000

    let [redScore, setRedScore] = useState(0)
    let [blueScore, setBlueScore] = useState(0)
    let [, setWillWin] = useState(true)
    let [confidence, setConfidence] = useState(1)

    let [syncing, setSyncing] = useState(false)
    let [timeSinceSync, setTimeSinceSync] = useState(0)

    let pullURL:string = "event/" + eventKey + "/matches"

    const fetchMatchInfo = () => {
        setSyncing(true)
        if(apiKey!=="") {
            PullTBA(
                pullURL, (data) => {
                    //Convert all the data to match info
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
                                    }), e.alliances.red.score, e["score_breakdown"]?.red.rp ?? -1),
                                    new Alliance(e.alliances.blue.team_keys.map((e) => {
                                        return parseInt(e.substring(3))
                                    }), e.alliances.blue.score, e["score_breakdown"]?.blue.rp ?? -1)
                                ),
                                new Date(e.predicted_time * 1000)
                            )
                        )

                        curMatches.sort((e1, e2) => {
                            return e1.predicted_time.getTime() - e2.predicted_time.getTime()
                        })

                    })

                    setMatches(curMatches)
                }
            )
        }

    }

    //Update the next match to play only when the list of matches changes
    useEffect(() => {
        pullNextMatchData()
    }, [matches])

    //Number of MS in a minute
    const MINUTE_MS = 60000;

    //Make the app pull match data only every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMatchInfo();

        }, MINUTE_MS * .5);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    let counter = useRef(0)
    let resetTimer = useRef(false)

    useEffect(() => {

        const interval = setInterval(() => {


            if(resetTimer.current) {
                resetTimer.current = false
                counter.current = 0
            }

            counter.current += 1
            setTimeSinceSync(counter.current)
        }, MINUTE_MS / (60.0))

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

        handleLastMatchInfo(playedMatches)

        let teamNum = parseInt(teamNumber)

        let yourPlayedMatches = Match.filterForTeam(playedMatches, teamNum)

        setYourLastMatch(yourPlayedMatches[yourPlayedMatches.length-1])

        let ourMatches = Match.filterForTeam(matches, teamNum)

        let ourUnplayedMatches = ourMatches.filter(x =>  {
            return unplayedMatches.includes(x) && !skipMatches.map(e => e.key).includes(x.key)
        })

        let nextMatch:Match  = ourUnplayedMatches.length > 0 ? ourUnplayedMatches[0] : ourMatches[ourMatches.length-1]

        if(nextMatch) {
            setMatchTime(nextMatch.getCorrectDate())
            setNextMatchIndex(matches.indexOf(nextMatch))
            setNextMatchName(nextMatch.convertToHumanReadableName())

            setNextMatch(nextMatch);
        }
    }

    function handleLastMatchInfo(playedMatches:Match[]) {
        //Load the previous match key to check that we're doing confetti for a new match
        let oldLastMatchKey = yourLastMatch?.key ?? "none"

        let lastMatch = playedMatches[playedMatches.length-1]

        setLastPlayedMatch(matches.indexOf(lastMatch))

        let matchKey = lastMatch?.key

        let yourLastAlliance = lastMatch?.getTeamAlliance(parseInt(teamNumber))
        let wonLast = lastMatch?.getWinningAlliance() === yourLastAlliance

        if(matchKey !== oldLastMatchKey && wonLast && yourLastAlliance !== undefined) {

            setConfetti(wonLast)
            setTimeout(() => {
                setConfetti(false)
            }, confettiDurationMS)
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
                    .then(result => {
                        if(result.status !== 200) {
                            throw Error();
                        }
                        return result.json()
                    })
                    .then(data => {

                        //If there is no data included in the response (i.e.the match cannot be found on statbotics), throw an error to do the calculations manually
                        if(Object.keys(data).length === 0) throw Error();

                        setRedScore(Math.round(data.red_epa_sum))
                        setBlueScore(Math.round(data.blue_epa_sum))

                        let alliance = getTeamAlliance();
                        setWillWin(data.epa_winner === alliance)
                        //win_prob is always from red alliance perspective, so we flip the probability for when our selected team is on the blue alliance
                        setConfidence(alliance === "red" ? data.epa_win_prob : 1 - data.epa_win_prob)

                        setSyncing(false)

                        resetTimer.current = true
                    })
                    .catch(async e => {

                        //We were unable to get the match result from statbotics (potentially because it's an offseason event). We'll run our own manual summation in that case

                        let redTotal = await getSumOfEPAs(nextMatch?.alliances.red.numbers ?? [1], year)
                        let blueTotal = await getSumOfEPAs(nextMatch?.alliances.blue.numbers ?? [1], year)

                        redTotal = Math.round(redTotal);
                        blueTotal = Math.round(blueTotal);

                        setRedScore(redTotal);
                        setBlueScore(blueTotal);

                        let teamAlliance = getTeamAlliance();
                        let winningAlliance = redTotal > blueTotal ? "red" : "blue";

                        let shouldWin = teamAlliance === winningAlliance
                        setWillWin(shouldWin);

                        //This value is an estimate of the constant statbotics uses to determine win chance
                        let redWinProb = ((redTotal - blueTotal) * 0.952974 + 50)/100.0

                        let winProb = teamAlliance === "red" ? redWinProb : 1-redWinProb

                        setConfidence(winProb);

                        setSyncing(false)

                        resetTimer.current = true
                    }
                )
        }

    }


    useEffect(() => getMatchPrediction(), [nextMatch])

    let yourLastAlliance = yourLastMatch?.getTeamAlliance(parseInt(teamNumber))

    let lastMatchName = yourLastMatch?.convertToHumanReadableName()
    let isQualsMatch = lastMatchName?.includes("Quals")


    return (
        <div className="App">
            <div className={`confetti ${confetti ? "active-con" : "inactive-con"}`}>
                <ReactConfetti/>
            </div>
            <Header number={parseInt(teamNumber)} eventKey={eventKey}/>
            <div className="main-app">
                <div className={"top-info"}>
                        {
                            yourLastMatch ?
                            <div className={"top-text"}>
                                <p><b>Just {(yourLastMatch.getWinningAlliance() === yourLastAlliance ? "Won" : "Lost")} {lastMatchName}</b></p>
                                <p>
                                    <b>
                                        <span className={"red-score"}>
                                            {isQualsMatch ? `(${yourLastMatch.alliances.red.rp}RP)` : ""} {yourLastMatch.alliances.red.score}
                                        </span>
                                        -
                                        <span className={"blue-score"}>
                                            {yourLastMatch.alliances.blue.score} {isQualsMatch ? `(${yourLastMatch.alliances.blue.rp}RP)` : ""}
                                        </span>
                                    </b>
                                </p>
                            </div> : <div className={"top-text"}/>
                        }
                    <div>
                        <h1 className={"next-match next-match-text"}>{nextMatchName} - {matchTime}</h1>
                    </div>

                    <div className={"top-text"}>
                        <p>
                            {
                                lastPlayedMatch >= 0 ?
                                    <b>Last Match: {matches[lastPlayedMatch].convertToHumanReadableName()}</b> :
                                    <b>Last Match: None</b>
                            }
                        </p>
                        <p><b>{timeSinceSync} Seconds Since Sync</b></p>
                    </div>
                </div>

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
                <div className={"bar-wrapper"}>
                    <div className={"bar-container"}>
                        <div className={"bar-completed"} style={{width: `${generateWidthOfAdvantageBar()}%`}}/>
                    </div>
                </div>
                <div className={"bottom-content"}>
                    <SyncIcon click={fetchMatchInfo} syncing={syncing}/>
                    <div className={"next-match prediction " + getMatchOutcomeType()}>
                        <h2>Win Chance: {Math.round(confidence * 100)}%</h2>
                    </div>
                    <FullscreenIcon/>
                    <h6 className={"presented-text"}>Created by <Link className={"presented-link"} target={"_blank"}  to={"https://www.thebluealliance.com/team/5907"}>
                            CC Shambots - FRC 5907
                        </Link>
                    </h6>
                </div>
            </div>

        </div>
    );

    function getMatchOutcomeType() {


        if(confidence <= confidenceCutoff) {
            return "loss"
        } else if(confidence >= 1-confidenceCutoff) {
            return "win"
        } else {
            return "tossup"
        }
    }

    //Generate the width, as a percentage, that the advantage bar should be
    function generateWidthOfAdvantageBar():number {
        let alliance = getTeamAlliance();

        let baseBar = alliance === "red" ? confidence : 1 + -confidence

        //we add an extra 5 percent to its width for the gradient to look good and be accurate (the gradient is 10% total
        return (baseBar * 100) * 1.05
    }

    function getTeamAlliance():string {
        return nextMatch?.alliances.red.numbers.includes(parseInt(teamNumber)) ? "red" : "blue";
    }

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
                return <TeamInfo key={num} teamNumber={e} activeTeam={parseInt(teamNumber) === e} upcomingMatch={upcomingMatch}/>
            })
        }
    }
}

async function getSumOfEPAs(teamNumbers:number[], year:string):Promise<number> {

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