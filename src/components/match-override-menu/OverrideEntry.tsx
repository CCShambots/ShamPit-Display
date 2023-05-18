import React, {useEffect, useState} from "react";
import "./OverrideEntry.css"
import RemoveIcon from "../../resources/remove-icon.svg"

function OverrideEntry(props: any) {

    let [height, setHeight] = useState<number>(
        () => {
            return 6;
        }
    );

    let [hover, setHover] = useState<boolean>(false)

    useEffect(() => {
    }, [height])

    return(
        <div className={"override-entry"} style={{height: height + "vh"}}>
            <p className={"match-name " + (hover ? "hovered" : "")}>{props.match.convertToHumanReadableName()}</p>
            <div/>
            <img onClick={() => {
                setHeight(0)
                props.removeSelf()
                }
            }
                 onMouseEnter={() => setHover(true)}
                 onMouseLeave={() => setHover(false)}
                 className={"remove-icon"} src={RemoveIcon} alt={""}/>
        </div>
    )
}

export  default  OverrideEntry;