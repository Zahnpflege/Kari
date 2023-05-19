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
let structureContainer = document.getElementById('structure')
let navigationContainer = document.getElementById('navigation')
let wkSelect = document.getElementById('wk_select')
let laufSelect = document.getElementById('lauf_select')
let signature = document.getElementById('signature')
document.getElementById('pwd_btn').addEventListener('click', registerSocket)
document.getElementById('submitBtn').addEventListener('click', sendData)
document.getElementById('selectLaufBtn').addEventListener('click', selectLauf)
document.getElementById('zzBtn').addEventListener('click', addZwischenZeit)
document.getElementById('structureBtn').addEventListener('click', () => {
    hideAll();
    structureContainer.hidden = false
})
document.getElementById('current').addEventListener('click', () => {
    if(document.getElementById('appcontent').hidden){
        hideAll();
        document.getElementById('appcontent').hidden = false
    }else{
        if(!latestLauf){
            socket.emit('nextLauf')
        }
    }

})

const urlParams = new URLSearchParams(window.location.search);
const wettkampf = urlParams.get('wettkampf')
const bahn = urlParams.get('bahn')

document.getElementById('headText').innerText = wettkampf + ', Bahn: ' + bahn
let zzindex = 0

let latestLauf
let currentData = {
    schwimmer: '',
    wk: '',
    lauf: '',
    bahn: '',
    zeit: '00:00,00'
};
let structure

var socket = io();

socket.on('next', (message) => {
    console.log(message)
    latestLauf = true
    currentData = JSON.parse(message)['data']
    changeDisplayedData(currentData)

})

socket.on('selectedStart',(message)=>{
    console.log(message)
    latestLauf = false
    currentData = JSON.parse(message)['data']
    changeDisplayedData(currentData)
})

socket.on('structure', (message) => {
    structure = JSON.parse(message)
    wkSelect.innerHTML = '<option></option>'
    for (let wk in structure) {
        let opt = document.createElement('option');
        opt.value = wk;
        opt.innerHTML = wk;
        wkSelect.appendChild(opt);
    }
    wkSelect.addEventListener('change', ()=>{
        laufSelect.innerHTML = '<option></option>'
        let selectedWk = wkSelect.value
        for(let i in structure[selectedWk]){
            let lauf = structure[selectedWk][i]
            let opt = document.createElement('option');
            opt.value = lauf;
            opt.innerHTML = lauf;
            laufSelect.appendChild(opt);
        }
    })
})

socket.on('error', (message)=>{
    errorLog.innerText = message
})

function changeDisplayedData(data) {
    hideAll()
    document.getElementById('appcontent').hidden = false
    navigationContainer.hidden = false
    errorLog.innerText = ''

    zzindex = 0
    wk.innerText = data['WK_alpha']
    wkName.innerText = data['WK_Titel']
    lauf.innerText = data['Lauf']
    schwimmer.innerText = data['Aktiver']
    zzList.innerHTML = ''
    if(data['Endzeit']=== ''){
        min.value = ''
        sek.value = ''
        mil.value = ''
    }else{
        min.value = data['Endzeit'].substring(0,2)
        sek.value = data['Endzeit'].substring(3,5)
        mil.value = data['Endzeit'].substring(6,8)
    }


    createZZ(data['WK_Titel'])
}

function sendData() {
    console.log('sending Data')
    logError('')

    for (let i = 1; i <= zzindex; i++) {
        let zmin = document.getElementById('min' + i)
        let zsek = document.getElementById('sek' + i)
        let zmil = document.getElementById('mil' + i)
        if (zmin.value === '') {
            console.log('log')
            zmin.value = '00'
        }
        if (zsek.value === '') {
            zsek.value = '00'
        }
        if (zmil.value === '') {
            zmil.value = '00'
        }
        let zeit = zmin.value + ':' + zsek.value + ',' + zmil.value
        if (!validateTime(zeit)) {
            logError(`Invalide eingabe bei Zwischenzeit ${i}`)
            return
        }
        if (i < 10) {
            currentData['Z_Zeit_0' + i] = zeit
        } else {
            currentData['Z_Zeit_' + i] = zeit
        }
    }
    if (min.value === '') {
        min.value = '00'
    }
    if (sek.value === '') {
        sek.value = '00'
    }
    if (mil.value === '') {
        mil.value = '00'
    }

    let endZeit = min.value + ':' + sek.value + ',' + mil.value
    if (!validateTime(endZeit)) {
        logError('Invalide eingabe bei Endzeit')
        return
    }
    currentData.Endzeit = endZeit

    socket.emit('zeit', JSON.stringify({'data': currentData, 'signature': signature.value}))
    console.log('sent:' + JSON.stringify(currentData))
    return true
}

function validateTime(timeString) {
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

function logError(errorMessage) {
    errorLog.innerText = errorMessage
}

function registerSocket() {
    let data = {'bahn': bahn, 'wettkampf': wettkampf, 'password': passwordInput.value}
    socket.emit('register', JSON.stringify(data))
}

function createZZ(wkName) {

    const meters = wkName.trim().split(' ')[0]
    for (let i = 1; i < meters / 100; i++) {
        addZwischenZeit()
    }
}

function selectLauf(){
    let wk = wkSelect.value
    let lauf = laufSelect.value

    if(wk !== '' && lauf !== ''){
        socket.emit('selectLauf', JSON.stringify({'wk':wk,"lauf":lauf}))
    }

}

function hideAll() {
    document.getElementById('register').hidden = true
    document.getElementById('appcontent').hidden = true
    structureContainer.hidden = true
}

