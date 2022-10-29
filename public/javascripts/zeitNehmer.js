let wk = document.getElementById('wk')
let wkName = document.getElementById('wkName')
let lauf = document.getElementById('lauf')
let schwimmer = document.getElementById('schwimmer')
let min = document.getElementById('min')
let sek = document.getElementById('sek')
let mil = document.getElementById('mil')
let zzList = document.getElementById('zzList')
let errorLog = document.getElementById('errorLog')
let passwordInput = document.getElementById('passwort')
document.getElementById('pwd_btn').addEventListener('click', registerSocket)
document.getElementById('submitBtn').addEventListener('click', sendData)
document.getElementById('zzBtn').addEventListener('click', addZwischenZeit)

const urlParams = new URLSearchParams(window.location.search);
const wettkampf = urlParams.get('wettkampf')
const bahn = urlParams.get('bahn')

document.getElementById('headText').innerText = wettkampf + ', Bahn: ' + bahn
let zzindex = 0


let currentData = {
    schwimmer: '',
    wk: '',
    lauf: '',
    bahn: '',
    zeit: '00:00,00'
};


var socket = io();

socket.on('next', (message) => {
    changeDisplayedData(message)
})

function changeDisplayedData(json) {
    document.getElementById('register').hidden = true
    document.getElementById('appcontent').hidden = false
    console.log(json)
    currentData = JSON.parse(json)
    errorLog.innerText = ''

    zzindex = 0
    wk.innerText = currentData['WK_alpha']
    wkName.innerText = currentData['WK_Titel']
    lauf.innerText = currentData['Lauf']
    schwimmer.innerText = currentData['Aktiver']

    zzList.innerHTML = ''
    min.value = ''
    sek.value = ''
    mil.value = ''
}

function sendData() {
    console.log('sending Data')

    for (let i = 1; i <= zzindex; i++) {
        let zeit = document.getElementById('min' + i).value + ':' + document.getElementById('sek' + i).value + ',' + document.getElementById('mil' + i).value
        if(!validateTime(zeit)){
            logError(`Invalide eingabe bei Zwischenzeit ${i}`)
            return
        }
        if (i < 10) {
            currentData['Z_Zeit_0' + i] = zeit
        } else {
            currentData['Z_Zeit_' + i] = zeit
        }

    }
    let endZeit = min.value + ':' + sek.value + ',' + mil.value
    if(!validateTime(endZeit)){
        logError('Invalide eingabe bei Endzeit')
        return
    }
    currentData.Endzeit = endZeit
    socket.emit('zeit', JSON.stringify(currentData))
    console.log('sent:' + JSON.stringify(currentData))
    return true
}

function validateTime(timeString){
    return /^\d?\d:[0-5]\d,\d\d$/.test(timeString)
}

function addZwischenZeit() {
    if (zzindex < 30) {
        zzindex++
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(`Zwischen Zeit ${zzindex}:`));
        li.appendChild(document.createElement("br"))

        function createInput(name) {
            let input = document.createElement("input");
            input.id = name + zzindex
            input.placeholder = "00"
            input.maxLength = 2
            input.size = 2
            return input
        }
        li.appendChild(createInput('min'))
        li.appendChild(document.createTextNode(`:`));
        li.appendChild(createInput('sek'))
        li.appendChild(document.createTextNode(`,`));
        li.appendChild(createInput('mil'))
        zzList.appendChild(li);
    }
}

function logError(errorMessage){
    errorLog.innerText = errorMessage
}

function registerSocket(){
    let data = {'bahn': bahn, 'wettkampf': wettkampf, 'password': passwordInput.value}
    socket.emit('register', JSON.stringify(data))
}