export function PullTBA(endpoint:string, callback:(e:any) => void) {

    const key:string = localStorage.getItem("tba-key") || "none";

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