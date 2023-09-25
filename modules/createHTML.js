class HTMLCreator{
    static createWettkampfSelectButtons(wettkampfe){
        let res = ''
        for(let w in wettkampfe){
            w = wettkampfe[w]
            res += ` <form action="/out"> <button class="button secondary-btn" type="submit" name="wettkampf" value="${w}">${w}</button></form>`
        }
         return res;
    }

    static createWkSelectButtons(wettkampf,wkStats){
        let res = ''

        for(let i in wkStats){

            let wk = wkStats[i]['name']
            let nr = wkStats[i]['nr']
            res += ` <form action="/out"><input hidden name="wettkampf" value="${wettkampf}"> <button class="button secondary-btn" type="submit" name="wk" value="${i}">${nr} - ${wk}</button></form>`
        }
        res += `<form action="/download"> <button class="button secondary-btn" type="submit" name="wettkampf" value="${wettkampf}">Download File</button></form>`
        return res
    }

    static createWkZeiten(zeitData,wettkampf ,wk ){
        let res = ''

        for(let lauf in zeitData){

            res += `<h><b> Lauf: ${lauf}</b></h>`
            for(let i in zeitData[lauf]){
                let start = zeitData[lauf][i]
                res += `<div> Bahn ${start['Bahn']} -- ${start['Endzeit']} -- ${start['Aktiver']} </div>`
            }
            res+= '<hr>'
        }
        res += `<form action="/download"><input name="wk" value="${wk}" hidden> <button class="button secondary-btn" type="submit" name="wettkampf" value="${wettkampf}">Download File</button></form>`

        return res
    }

    static disqualy(){

    }
}

module.exports = HTMLCreator