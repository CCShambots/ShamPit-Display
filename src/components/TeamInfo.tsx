import React, {useEffect, useState} from "react"
import "./TeamInfo.css"
import packageJson from "../../package.json";

function TeamInfo(props: any) {

    const year = packageJson.version.substring(0, 4);

    const [epa, setEPA] = useState<number>(0)
    const [imgPath, setImgPath] = useState<string>("../resources/team-images/" + props.number + ".jpg")

    const [avatarPath, setAvatarPath] = useState<string>("")

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

    const fetchImage = (onlyAvatar:boolean) => {
        fetch("https://www.thebluealliance.com/api/v3/team/frc" + props.number +"/media/" + year, props.apiOptions)
            .then(response => {
                return response.json()
            }).then(data => {

            let shouldSkip = false
            if(data.length >0) {
                data.forEach((e) => {

                    if(e.type === "avatar") {
                        setAvatarPath(e.details.base64Image)
                    }

                    //TODO: Fix jank
                    if(!onlyAvatar) {
                        if(shouldSkip) return
                        if(e.direct_url !== '') {

                            try {
                                require(imgPath)
                            } catch {
                                setImgPath(e.direct_url)
                                shouldSkip = true
                            }
                        }
                    }
                })

            }
        })
    }

    useEffect(() => {
        fetchEPA()
        fetchImage(false)
    }, [props.number])

    return (

        <div className={"team-display " + (props.activeTeam ? "active" : "inactive")}>
            {
                props.upcomingMatch != null ?

                    <p className={"upcoming-match"}><b>In: {props.upcomingMatch.convertToHumanReadableName()}</b></p>
                    : null
            }
            <div className={"header-info"}>
                {avatarPath !== "" ?
                    <img className={"avatar"} src={`data:image/png;base64,${avatarPath}`} alt={"team avatar"}/> : null
                }
                <h2 className={avatarPath === "" ? "center" : ""}>{props.number}</h2>
            </div>
            {getImg()}
            <div>
                <h3>EPA: {epa}</h3>
                {/*<h3>Cycles: {props.cycles}</h3>*/}
            </div>
        </div>

    )

    function getImg() {
        try {

            if(imgPath.substring(0, 1) === "." || props.number === 5907) {
                return <img className={"bot-image"}
                            src={require("../resources/team-images/" + props.number + ".jpg")}
                            alt={"Error"}></img>
            } else {
                return <img className={"bot-image"}
                            src={imgPath}
                            alt={"Error"}></img>
            }

        } catch (error) {
            fetchImage(false)

            return <img className={"bot-image"}
                        src={require("../resources/no-team-image.jpg")}
                        alt={"None Found"}></img>

        }
    }
}


export default TeamInfo;