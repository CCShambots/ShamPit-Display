import React, {useEffect, useState} from "react"
import "./TeamInfo.css"
import packageJson from "../../package.json";

function TeamInfo(props: any) {

    const year = packageJson.version.substring(0, 4);

    const [epa, setEPA] = useState<number>(0)
    const [cycles, setCycles] = useState<number>(0)
    const [imgPath, setImgPath] = useState<string>("../resources/team-images/" + props.number + ".jpg")

    const fetchEPA = () => {
        fetch("https://api.statbotics.io/v2/team_year/" + props.number + "/" + year)
            .then(response => {
                return response.json()
            })
            .then(data => {
                //Take the team's data
                setEPA(data.epa_end)

            })
    }

    const fetchImage = () => {
        fetch("https://www.thebluealliance.com/api/v3/team/frc" + props.number +"/media/" + year, props.apiOptions)
            .then(response => {
                return response.json()
            }).then(data => {

            let shouldSkip = false
            if(data.length >0) {
                data.forEach((e) => {
                    if(shouldSkip) return
                    if(e.direct_url != '') {
                        setImgPath(e.direct_url)
                        shouldSkip = true
                    }
                })

            }
        })
    }

    useEffect(() => {
        fetchEPA()
    }, [])

    return (
        <div className={"team-display " + (props.activeTeam ? "active" : "inactive")}>
            <h2>{props.number}</h2>
            {getImg()}
            <div>
                <h3>EPA: {epa}</h3>
                <h3>Cycles: {props.cycles}</h3>
            </div>
        </div>
    )

    function getImg() {
        try {

            if(imgPath.substring(0, 1) == ".") {
                return <img className={"bot-image"}
                            src={require("../resources/team-images/" + props.number + ".jpg")}
                            alt={"Image Error"}></img>
            } else {
                return <img className={"bot-image"}
                            src={imgPath}
                            alt={"Image Error"}></img>
            }

        } catch (error) {
            fetchImage()

            return <img className={"bot-image"}
                        src={require("../resources/no-team-image.jpg")}
                        alt={"No Image Found"}></img>

        }
    }
}


export default TeamInfo;