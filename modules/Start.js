class Start {
    constructor(data) {
        if (
            typeof data.WK_Nr !== 'number' ||
            typeof data.WK_alpha !== 'number' ||
            typeof data.Lauf !== 'number' ||
            typeof data.Bahn !== 'number' ||
            typeof data.Staffel_Pos !== 'number' ||
            typeof data.Laps !== 'number' ||
            data.WK_Nr < 0 ||
            data.WK_alpha < 0 ||
            data.Lauf < 0 ||
            data.Bahn < 0 ||
            data.Staffel_Pos < 0 ||
            data.Laps < 0 ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Endzeit) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_01) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_02) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_03) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_04) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_05) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_06) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_07) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_08) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_09) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_10) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_11) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_12) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_13) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_14) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_15) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_16) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_17) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_18) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_19) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_20) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_21) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_22) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_23) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_24) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_25) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_26) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_27) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_28) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_29) ||
            !/^\d{2}:\d{2},\d{2}$/.test(data.Z_Zeit_30)
        ) {
            throw new Error('Invalid data format.');
        }

        this.data = {
            WK_Nr: data.WK_Nr,
            WK_alpha: data.WK_alpha,
            WK_Titel: data.WK_Titel,
            Lauf: data.Lauf,
            Bahn: data.Bahn,
            Staffel_Pos: data.Staffel_Pos,
            Aktiver: data.Aktiver,
            Verein: data.Verein,
            Endzeit: data.Endzeit,
            Laps: data.Laps,
            Z_Zeit_01: data.Z_Zeit_01,
            Z_Zeit_02: data.Z_Zeit_02,
            Z_Zeit_03: data.Z_Zeit_03,
            Z_Zeit_04: data.Z_Zeit_04,
            Z_Zeit_05: data.Z_Zeit_05,
            Z_Zeit_06: data.Z_Zeit_06,
            Z_Zeit_07: data.Z_Zeit_07,
            Z_Zeit_08: data.Z_Zeit_08,
            Z_Zeit_09: data.Z_Zeit_09,
            Z_Zeit_10: data.Z_Zeit_10,
            Z_Zeit_11: data.Z_Zeit_11,
            Z_Zeit_12: data.Z_Zeit_12,
            Z_Zeit_13: data.Z_Zeit_13,
            Z_Zeit_14: data.Z_Zeit_14,
            Z_Zeit_15: data.Z_Zeit_15,
            Z_Zeit_16: data.Z_Zeit_16,
            Z_Zeit_17: data.Z_Zeit_17,
            Z_Zeit_18: data.Z_Zeit_18,
            Z_Zeit_19: data.Z_Zeit_19,
            Z_Zeit_20: data.Z_Zeit_20,
            Z_Zeit_21: data.Z_Zeit_21,
            Z_Zeit_22: data.Z_Zeit_22,
            Z_Zeit_23: data.Z_Zeit_23,
            Z_Zeit_24: data.Z_Zeit_24,
            Z_Zeit_25: data.Z_Zeit_25,
            Z_Zeit_26: data.Z_Zeit_26,
            Z_Zeit_27: data.Z_Zeit_27,
            Z_Zeit_28: data.Z_Zeit_28,
            Z_Zeit_29: data.Z_Zeit_29,
            Z_Zeit_30: data.Z_Zeit_30,
            signature: data.signature,
        };
    }

    getDataInFormat() {
        return {
            data: this.data,
            signature: 'nn',
        };
    }
}

