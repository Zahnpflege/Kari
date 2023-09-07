class Wettkampf {

    data = {}
    password = undefined
    visitorPassword = undefined
    current = {}
    structure = {}
    wkStats = {}

    constructor(name, password, visitorPassword, data, current, structure, wkStats) {
        this.name = name
        this.password = password
        this.data = data
        this.current = current
        this.structure = structure
        this.wkStats = wkStats
        this.visitorPassword = visitorPassword
    }

    addStart(data_json) {
        let data = JSON.parse(data_json)
        let lauf = data['Lauf']
        let wk = data['WK_alpha']
        let bahn = data['Bahn']
        let wk_nr = data['WK_Nr']

        if (this.data[bahn] === undefined) {
            this.data[bahn] = []
            this.current[bahn] = 0
            this.structure[bahn] = {}
        }

        if(!this.wkStats[wk_nr]){
            this.wkStats[wk_nr] = {'name': data['WK_Titel'], 'nr': wk}
        }

        if (this.structure[bahn][wk] === undefined) {
            this.structure[bahn][wk] = []
        }
        if(!this.structure[bahn][wk].includes(lauf)){
            this.structure[bahn][wk].push(lauf)
        }
        this.data[bahn].push({'data': data, 'signature': undefined})
    }

    addTime(data, signature) {

        let lauf = data['Lauf']
        let wk = data['WK_Nr']
        let bahn = data['Bahn']
        let laufIndex = this.getLaufIndex(bahn, wk, lauf)
        if (laufIndex !== -1) {
            if (laufIndex === this.current[bahn]) {
                this.data[bahn][laufIndex]['data'] = data
                this.data[bahn][laufIndex]['signature'] = signature
                this.current[bahn]++
            } else {
                if (laufIndex < this.current[bahn]) {
                    if (this.data[bahn][laufIndex]['signature'] === signature) {
                        this.data[bahn][laufIndex]['data'] = data
                        this.data[bahn][laufIndex]['signature'] = signature
                    }else{
                        console.warn('[WARN] Wrong Signature')
                        return '{"Error": "Wrong Signature"}'
                    }
                }else{
                    return '{"Error": "Cannot add Time for future Heats. Please Enter the current Heat first!"}'
                }
            }

        } else {
            console.warn('[WARN] No start found for addTime: Wk ' + wk + ' Lauf ' + lauf + ' Bahn ' + bahn)
            return '{"Error": "No start found for: Wk ' + wk + ' Lauf ' + lauf + ' Bahn ' + bahn + '"} '
        }
        return 1
    }

    getCurrentStart(bahn) {
        if (this.data[bahn][this.current[bahn]] === undefined) {
            return false
        }
        return this.data[bahn][this.current[bahn]]
    }

    getStart(bahn, wk, lauf) {
        let index = this.getLaufIndex(bahn, wk, lauf)
        if (index === -1) {
            return false
        } else {
            return this.data[bahn][index]
        }
    }

    getLaufIndex(bahn, wk_nr, lauf) {
        if (this.data[bahn] === undefined) {
            return false
        }
        for (let i = 0; i < this.data[bahn].length; i++) {
            let start = this.data[bahn][i]['data']
            if (start['Lauf'] === lauf && start["WK_Nr"] === wk_nr) {
                return i
            }
        }
        return -1
    }

    getStructure(bahn) {
        if (bahn in this.structure) {
            return this.structure[bahn]
        }
        return false
    }

    getWkNachLauf(wk){
        let res = {}
        for(let bahn in this.data) {
            for (let i in this.data[bahn]) {
                let start = this.data[bahn][i]['data']


                if (start['WK_Nr'] === wk) {

                    if (!res[start['Lauf']]) {
                        res[start['Lauf']] = []
                    }
                    res[start['Lauf']][bahn] = start
                }
            }
        }
        return res
    }


    createFileContent(wk_nr){
        let res = ''
        for(let bahn in this.data) {
            for (let i in this.data[bahn]) {
                let start = this.data[bahn][i]['data']
                if(!wk_nr || wk_nr ===  start['WK_Nr']){
                    res += JSON.stringify(start) + "\n"
                }
            }
        }
        return res
    }

    getWkAlpha(wk_nr){
        for(let bahn in this.data) {
            for (let i in this.data[bahn]) {
                let start = this.data[bahn][i]['data']
                if (start['WK_Nr'] === wk_nr){
                    return start['WK_alpha']
                }
            }
        }
        return -1
    }

    getWkNr(wk_Alpha){
        for(let bahn in this.data) {
            for (let i in this.data[bahn]) {
                let start = this.data[bahn][i]['data']
                if (start['WK_alpha'] === wk_Alpha){
                    return start['WK_Nr']
                }
            }
        }
        return -1
    }
}

module.exports = Wettkampf