class Match {

    constructor(
        public readonly key: string,
        public readonly comp_level: string,
        public readonly match_number: number,
        public readonly alliances: Alliances,
        public readonly predicted_time: Date) {
    }

    static filterForTeam(initialMatches:Match[], teamNum:number):Match[] {
        return initialMatches.filter((e) =>
            e.alliances.blue.numbers.includes(teamNum)
            || e.alliances.red.numbers.includes(teamNum)
        )
    }

    getAllianceOfTeam(teamNum:number):Alliance {
        //Return the alliance that includes this team
        if(this.alliances.red.numbers.includes(teamNum)) return this.alliances.red
        else return this.alliances.blue
    }

    getTeamAlliance(teamNum:number) {
        if(this.alliances.red.numbers.includes(teamNum)) return "red"
        else if(this.alliances.blue.numbers.includes(teamNum)) return "blue"
        else return "none"
    }

    getWinningAlliance() {
        if(this.alliances.red.score > this.alliances.blue.score) return "red"
        else if (this.alliances.blue.score > this.alliances.red.score) return "blue"
        else return "tie"
    }

    convertToHumanReadableName():string {
        let header: string = ""
        let semis:boolean = false

        switch (this.comp_level) {
            case("qm"):
                header = "Quals"
                break;
            case("sf"):
                header = "Elims"
                semis = true
                break;
            case("f"):
                header = "Finals"
                break;
            default:
                header = "Match"
                break;
        }

        //We have to pull the match number differently for semis matches because TBA parses them in the worst way possible
        let matchNum:number = semis ?
            parseInt(this.key.substring(this.key.indexOf("_") + 3, this.key.indexOf("m1")))
            : this.match_number;

        return header + " " + matchNum;
    }

    getCorrectDate():string {
        return this.formatDayOfTheWeek(this.predicted_time) + " " + this.formatAMPM(this.predicted_time);
    }


    private formatAMPM(date):string {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    private formatDayOfTheWeek(date):string {
        switch(date.getDay()) {
            case (0): return "Sun."
            case (1): return "Mon."
            case (2): return "Tues."
            case (3): return "Wed."
            case (4): return "Thurs."
            case (5): return "Fri."
            case (6): return "Sat."
        }

        return "CATASTROPHIC FAILURE"
    }

    public hasBeenPlayed() {
        return (this.alliances.red.score >= 0 || this.alliances.blue.score >= 0)
    }

    public static fromJson(data:any):Match {
        return new Match(
            data.key,
            data.comp_level,
            data.match_number,
            new Alliances(
                new Alliance(data.alliances.red.team_keys.map((e) => {
                    return parseInt(e.substring(3))
                }), data.alliances.red.score, data["score_breakdown"]?.red.rp ?? -1),
                new Alliance(data.alliances.blue.team_keys.map((e) => {
                    return parseInt(e.substring(3))
                }), data.alliances.blue.score, data["score_breakdown"]?.blue.rp ?? -1)
            ),
            new Date(data.predicted_time * 1000)
        )
    }

    public static arrayFromJson(data:any):Match[] {
        let curMatches:Match[] = [];

        data.forEach((e) => curMatches.push(this.fromJson(e)))

        curMatches.sort((e1, e2) => {
            return e1.predicted_time.getTime() - e2.predicted_time.getTime()
        })

        return curMatches;
    }



}

class Alliances {

    constructor(readonly red: Alliance, readonly blue: Alliance) {
    }

    public getTeams():number[] {
        return [...this.red.numbers, ...this.blue.numbers]
    }
}
class Alliance {

    constructor(
        readonly numbers:number[],
        readonly score:number,
        readonly rp:number
    ) {}
}



export {
    Match,
    Alliance,
    Alliances,
}
