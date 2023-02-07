class Wettkampf {

    data = {}
    password = undefined
    current = {}
    structure = {}

    constructor(name, password, data, current, structure) {
        this.name = name
        this.password = password
        this.data = data
        this.current = current
        this.structure = structure
    }

    addStart(data_json) {
        let data = JSON.parse(data_json)
        let lauf = data['Lauf']
        let wk = data['WK_Nr']
        let bahn = data['Bahn']

        if (this.data[bahn] === undefined) {
            this.data[bahn] = []
            this.current[bahn] = 0
            this.structure[bahn] = {}
        }
        if (this.structure[bahn][wk] === undefined) {
            this.structure[bahn][wk] = []
        }
        this.structure[bahn][wk].push(lauf)
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
                        return 'Wrong Signature'
                    }
                }
            }

        } else {
            console.warn('[WARN] No start found for addTime: Wk ' + wk + ' Lauf ' + lauf + ' Bahn ' + bahn)
            return 'No start found for: Wk ' + wk + ' Lauf ' + lauf + ' Bahn ' + bahn
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

    getLaufIndex(bahn, wk, lauf) {
        if (this.data[bahn] === undefined) {
            return false
        }
        for (let i = 0; i < this.data[bahn].length; i++) {
            let start = this.data[bahn][i]['data']
            if (start['Lauf'] === lauf && start["WK_Nr"] === wk) {
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

}

module.exports = Wettkampf