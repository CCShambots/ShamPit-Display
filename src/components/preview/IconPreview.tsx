import {useLocalStorage} from "usehooks-ts";
import React, {useEffect, useState} from "react";
import {PullTBA} from "../../util/APIUtil";

import "./IconPreview.css"

export default function IconPreview(props: {number:number,}) {
    let [eventKey] = useLocalStorage("eventKey", "")
    const year = eventKey.substring(0, 4)

    let [avatarPath, setAvatarPath] = useState("")

    function fetchTBAImage() {
        PullTBA(`team/frc${props.number}/media/${year}`, async (data) => {
            for(let i=0; i<data.length;i++) {
                let e = data[i]

                if (e.type === "avatar") {
                    setAvatarPath(e.details.base64Image)

                    break
                }
            }
        })
    }

    useEffect(() => {
        fetchTBAImage()
    }, [props.number]);

    return avatarPath !== "" ? <div>
        <img className={"avatar-cart"} src={`data:image/png;base64,${avatarPath}`} alt={"team avatar"}/>
        <p className={"number"}>{props.number}</p>
    </div> : <div>
        <p className={"number"}>{props.number}</p>
    </div>
}