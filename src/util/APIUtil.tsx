export const ShamBaseUrl = "http://167.71.240.213:8080/"

export function CheckImage(teamNum:number) {
    return fetch(ShamBaseUrl + "bytes/get").then(response => response.json())
        .then((data:any[]) => {
            return data.includes(`${teamNum}-img`)
        })
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