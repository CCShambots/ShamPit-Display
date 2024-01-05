import axios from "axios";

export const DataBaseUrl = "https://scout.voth.name:3000/protected/"

export function CheckImage(teamNum:number, year:string, jwt:string) {

    return axios.get(DataBaseUrl + "bytes/", {
        headers: {
            'Authorization': jwt,
        },
        withCredentials: false
    }
    ).then(response => response.data)
    .then((data:any[]) => {
        return data.includes(`${teamNum}-img-${year}`)
    }).catch(e => {
        return false
    })

}

export function CheckJWT(jwt:string) {

    return axios.get(DataBaseUrl.substring(0, DataBaseUrl.length-1), {
        headers: {
            'Authorization': jwt,
        },
        withCredentials: false
    }).then((res) => {
        return res.status
    }).catch((e) => {
        console.log(e)
        return 401
    })
}


export function Authorize(code:string, email:string) {
    let baseURL = DataBaseUrl.replace("protected/", "")
    return fetch(`${baseURL}auth/${code}/${email}`, {
        method: 'GET',
    })
        .then(response => response.text())
}

export function PullTBA(endpoint:string, callback:(e:any) => void) {

    const key:string = localStorage.getItem("apiKey") || "none";

    let apiOptions = {
        "method" : "GET",
        "headers" : {
            "X-TBA-Auth-Key" : key.substring(1, key.length-1)
        }
    };

    try {
        fetch("https://www.thebluealliance.com/api/v3/" + endpoint, apiOptions)
            .then(response => {return response.json()})
            .then(callback)
            .catch(() => {})

    } catch (e) {}
}

export function PullStatbotics(endpoint:string, callback:(e:any) => void) {
    try {
        fetch("https://api.statbotics.io/v2/" + endpoint)
            .then(response => {return response.json()})
            .then(callback)
            .catch(() => {})

    } catch (e) {}
}