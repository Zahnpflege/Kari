let structure = JSON.parse(document.getElementById('structure').innerText)
let wettkampfSelect = document.getElementById('wettkampf')
let bahnSelect = document.getElementById('bahn')

for (let wk in structure) {
    let opt = document.createElement('option');
    opt.value = wk;
    opt.innerHTML = wk;
    wettkampfSelect.appendChild(opt);
}

wettkampfSelect.addEventListener('change', () => {
    bahnSelect.innerHTML = '<option></option>'
    let selectedWk = wettkampfSelect.value
    if (selectedWk === '') {
        bahnSelect.innerHTML += '<option> --Bitte Wettkampf auswählen-- </option>'
    } else {

        for (let i in structure[selectedWk]) {

            let opt = document.createElement('option');
            opt.value = structure[selectedWk][i];
            opt.innerHTML = 'Bahn ' + structure[selectedWk][i];
            bahnSelect.appendChild(opt);
        }
    }

})

function getRadioButton(name, value) {
    return '<input type="radio" id="' + value + '" name="' + name + '" value="' + value + '"><label for="' + value + '">' + value + '</label><br>'
}