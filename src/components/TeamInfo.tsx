import React, {createRef, useEffect, useState} from "react"
import "./TeamInfo.css"
import {CheckImage, PullStatbotics, PullTBA, DataBaseUrl} from "../util/APIUtil";
import {Match} from "../data/Data";
import {useLocalStorage} from "usehooks-ts";
import Marquee from "react-fast-marquee";
import LocalStorageConstants from "../util/LocalStorageConstants";


function TeamInfo(props: { teamNumber:number, activeTeam:boolean, upcomingMatch:Match|null}) {

    let [eventKey] = useLocalStorage("eventKey", "")
    const year = eventKey.substring(0, 4)

    const [name, setName] = useState("")

    const [epa, setEPA] = useState(0)
    const [tbaImgPath, setTbaImgPath] = useState("")

    let [imageInDataBase, setImageInDataBase] = useState(false)

    const [avatarPath, setAvatarPath] = useState("")

    let [rank, setRank] = useState(-1)

    let [jwt] = useLocalStorage(LocalStorageConstants.JWT, "")

    useEffect(() => {
        PullTBA(`team/frc${props.teamNumber}`, (data) => {
            //Set the team name to the data's nickname, but parse out any "The"s at the start
            setName(data.nickname.replace(/^The /i, ''))
        })
    }, [props.teamNumber]);

    //Load the team rank
    useEffect(() => {
        PullTBA(`event/${eventKey}/rankings`, (data) => {

            let rank = data["rankings"].map(e => parseInt(e["team_key"].substring(3))).indexOf(props.teamNumber) + 1

            setRank(rank)
        })
    }, [props.teamNumber, props.upcomingMatch])

    function fetchEPA() {
        PullStatbotics(`team_year/${props.teamNumber}/${year}`, (data) => {
            setEPA(data.epa_end)
        })
    }

    function fetchTBAImage(onlyAvatar:boolean) {
        PullTBA(`team/frc${props.teamNumber}/media/${year}`, async (data) => {
            let shouldSkip = false

            for(let i=0; i<data.length;i++) {
                let e = data[i]

                if (e.type === "avatar") {
                    setAvatarPath(e.details.base64Image)
                }

                if (!onlyAvatar) {
                    if (shouldSkip) return
                    if (e.direct_url !== '') {

                        shouldSkip = await checkImage(e.direct_url).then((r:any) => {
                            if(r.status === 'ok') {
                                setTbaImgPath(e.direct_url)
                                return true
                            } else {
                                return false
                            }

                        })

                    }
                }
            }
        })
    }

    const checkShamBase = () => {
        CheckImage(props.teamNumber, year, jwt).then(result => {
            setImageInDataBase(result)

            if(result) {
                loadImage()
            }
        })
    }

    let imgRef = createRef<HTMLImageElement>();

    let [imgSrc, setImgSrc] = useState("");

    useEffect(() => {
        setTimeout(() => {
            loadImage()
        }, 250)
        setInterval(() => {
            loadImage()
        }, 600000)
    }, [imageInDataBase, props.teamNumber]);

    let loadImage = () => {
        if(imageInDataBase) {
            const src = DataBaseUrl + `bytes/${props.teamNumber}-img-${year}`;
            const options = {
                headers: {
                    'Authorization': jwt,
                }
            };

            fetch(src, options)
                .then(res => res.blob())
                .then(blob => {
                    setImgSrc(URL.createObjectURL(blob));
                }).catch(e => {
                    console.log(e)
                })
            ;
        }
    }

    useEffect(() => {
        //Clear the current TBA image location (don't retain old images on match change)
        setTbaImgPath("")
        setAvatarPath("")
        setImageInDataBase(false)
        setImgSrc("")

        fetchEPA()
        fetchTBAImage(false)
        checkShamBase()
    }, [props.teamNumber])

    let [playMarquee, setPlayMarquee] = useState(true)


    return (

        <div className={"team-display " + (props.activeTeam ? "active" : "inactive")}>

            {
                props.upcomingMatch != null ?
                    <p className={"small-info-text"}><b>In: {props.upcomingMatch.convertToHumanReadableName()}</b></p>
                    : null
            }
            <div className={"header-info"}>
                {avatarPath !== "" ?
                    <img className={"avatar"} src={`data:image/png;base64,${avatarPath}`} alt={"team avatar"}/> : null
                }
                <h2 className={avatarPath === "" ? "center" : ""}>{props.teamNumber}</h2>
            </div>
            <div className={"team-name-container"}>
                {name.length > 10 ?
                    <Marquee play={playMarquee} onCycleComplete={() => {
                        setPlayMarquee(false)
                        setTimeout(() => setPlayMarquee(true), 10000)
                    }}>
                        <p
                            className={"team-name " + (!props.activeTeam ? " rank-text-inactive" : "")}
                        ><b>{name}⠀⠀⠀</b></p>
                    </Marquee> : <p
                        className={"team-name centered" + (!props.activeTeam ? " rank-text-inactive" : "")}
                    ><b>{name}</b></p>
                }

            </div>
            <p className={"small-info-text " + (!props.activeTeam ? "rank-text-inactive" : "")}><b>Rank: {rank}</b></p>
            {getImg()}
            <div>
                <h3>EPA: {epa}</h3>
            </div>
        </div>

    )

    function checkImage(path) {
        return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve({path, status: 'ok'});
                img.onerror = () => resolve({path, status: 'error'});

                img.src = path;
            }
        );
    }

    function getImg() {

        try {

            if (imageInDataBase) {
                return <img ref={imgRef}
                            className={"bot-image"}
                            src={imgSrc}
                            alt={"Loading"}></img>
            } else {
                return <img className={"bot-image"}
                            src={tbaImgPath}
                            alt={"No Image"}></img>
            }

        } catch (error) {
            fetchTBAImage(false)

            return <img className={"bot-image"}
                        src={require("../resources/no-team-image.jpg")}
                        alt={"None Found"}></img>

        }
    }
}


export default TeamInfo;