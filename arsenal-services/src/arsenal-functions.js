var db = require("./database.js")
var dbUtil = require("./dbUtil.js")
var checkClass = require("./checkClass.js")

/*
** Calculates the performance thresholds of the platform based by the Sys argument
**  - Sys represents a row number within 'SysTable' in the 'Systems' sheet
**  - S represents the row of the signal in the ListSignals table to be calculated
** Calculations are based on configuration rules of thumb and test data
*/
function calcThresholds(system, s, useTestData, jammerPower, jammerRangeUnits) {

    console.log("Start CalcThreshold")
    const signalRow = dbUtil.getRowFromTable('signals', 'id', s)
    const systemRow = dbUtil.getRowFromTable('systems', 'id', system)
    useTestData = (useTestData === "true" || useTestData === 'True' || useTestData === true);

    console.log("CalcThreshold: systemRow:")
    console.log(systemRow)
    console.log("CalcThreshold: signalRow:")
    console.log(signalRow)

    console.log("CalcThreshold: useTestData: " + useTestData)

    //Having to make this an object so that fields can be passed by reference to functions
    let overallRefObj = {
        system: null,
        signal: null,
        units: "J/S",
        degAcq: null,
        noAcq: null,
        degTrk: null,
        noTrk: null,
        degAcqEst: true,
        noAcqEst: true,
        degTrkEst: true,
        noTrkEst: true,
        asOfDate: null,
        configData: null,
        jammerRanges: null
    }

    let rcvrRefObj = {
        degAcq: null,
        noAcq: null,
        degTrk: null,
        noTrk: null,
        degAcqEst: true,
        noAcqEst: true,
        degTrkEst: true,
        noTrkEst: true
    }

    let imuRefObj = {
        degAcq: null,
        noAcq: null,
        degTrk: null,
        noTrk: null,
        degAcqEst: true,
        noAcqEst: true,
        degTrkEst: true,
        noTrkEst: true
    }

    let antRefObj = {
        degAcq: null,
        noAcq: null,
        degTrk: null,
        noTrk: null,
        degAcqEst: true,
        noAcqEst: true,
        degTrkEst: true,
        noTrkEst: true
    }

    let aeRefObj = {
        degAcq: null,
        noAcq: null,
        degTrk: null,
        noTrk: null,
        degAcqEst: true,
        noAcqEst: true,
        degTrkEst: true,
        noTrkEst: true
    }

    let ajRefObj = {
        degAcq: null,
        noAcq: null,
        degTrk: null,
        noTrk: null,
        degAcqEst: true,
        noAcqEst: true,
        degTrkEst: true,
        noTrkEst: true
    }

    let receiverRow, imuRow, antRow, aeRow, ajRow; //DB Rows

    if (system === 0 || s === 0 || system === null || s === null) {
        console.log("CalcThreshold: null parameters")
        rcvrRefObj.noTrk = 0;
    } else {
        //TODO Classification
        // let classification = checkClass.checkClass(dbUtil.getRowFromTable("systems", "id", system).class, false)
        // if (classification.isValid === false) {
        //    // classification string was wrong for some reason. Perhaps not valid or improperly formatted.
        //    // Handle the error here...
        // }

        console.log("CalcThreshold: valid parameters")

        // Determine Receiver Thresholds
        const receiverAliasRow = dbUtil.getRowFromTable('receiverAliases', 'id', systemRow.receiverAliasId)
        console.log("CalcThreshold: receiverAliasRow:")
        console.log(receiverAliasRow)
        receiverRow = dbUtil.getRowFromTable('receivers', 'id', receiverAliasRow.receiverId)
        console.log("CalcThreshold: receiverRow:")
        console.log(receiverRow)

        // use rules-of-thumb for Rcvr thresholds
        if (receiverRow[signalRow.signalHeader + '_acq']) {
            console.log("CalcThreshold: Value found for " + signalRow.signalHeader + "_acq found in receiverRow: " + receiverRow[signalRow.signalHeader + '_acq'] + ": " + signalRow['acq'])
            rcvrRefObj.noAcq = signalRow['acq'];
        } else {
            console.log("CalcThreshold: No value (" + receiverRow[signalRow.signalHeader + '_acq'] + ") for " + signalRow.signalHeader + "_acq found in receiverRow")
        }

        if (receiverRow[signalRow.signalHeader + '_trk']) {
            console.log("CalcThreshold: Value found for " + signalRow.signalHeader + "_trk found in receiverRow: " + receiverRow[signalRow.signalHeader + '_trk'] + ": " + signalRow['trk'])
            rcvrRefObj.noTrk = signalRow['trk'];
        } else {
            console.log("CalcThreshold: No value (" + receiverRow[signalRow.signalHeader + '_trk'] + ") for " + signalRow.signalHeader + "_trk found in receiverRow")
        }

        //TODO Classification
        // CheckClass ListSignals(S, 11), True

        rcvrRefObj.degAcq = rcvrRefObj.noAcq
        rcvrRefObj.degTrk = rcvrRefObj.noTrk

        if(useTestData === true) {
            applyTestData(receiverRow.id, 2, signalRow, rcvrRefObj)
        }

    }

    if (rcvrRefObj.noTrk === 0) {
        console.log("CalcThreshold: This system does not track the signal")

        overallRefObj.system = systemRow.system
        overallRefObj.signal = signalRow.name
        overallRefObj.noTrk = 0
        overallRefObj.degTrk = 0
        overallRefObj.noAcq = 0
        overallRefObj.degAcq = 0
        overallRefObj.degAcqEst = false
        overallRefObj.noAcqEst = false
        overallRefObj.degTrkEst = false
        overallRefObj.noTrkEst = false

        return overallRefObj
    } else {

        console.log("CalcThreshold: System can track the selected signal")

        //Determine Gain for IMU Coupling
        const imuAliasRow = dbUtil.getRowFromTable('imuAliases', 'id', systemRow.imuAliasId)
        console.log("CalcThreshold: imuAliasRow:")
        console.log(imuAliasRow)
        imuRow = dbUtil.getRowFromTable('imus', 'id', imuAliasRow.imuId)
        console.log("CalcThreshold: imuRow:")
        console.log(imuRow)

        const couplingRow = dbUtil.getRowFromTable('couplingTypes', 'coupling', systemRow.couplingType)
        console.log("CalcThreshold: couplingRow:")
        console.log(couplingRow)

        imuRefObj.noTrk = couplingRow.gain

        //TODO - Implement
        // CheckClass(couplingRow.classification, true)

        imuRefObj.degAcq = imuRefObj.noAcq
        imuRefObj.degTrk = imuRefObj.noTrk

        if(useTestData === true){
            applyTestData(imuRow.id, 3, signalRow, imuRefObj)
        }

        //Determine Gain for Antenna Type
        const antAliasRow = dbUtil.getRowFromTable('antennaAliases', 'id', systemRow.antennaAliasId)
        console.log("CalcThreshold: antAliasRow:")
        console.log(antAliasRow)
        antRow = dbUtil.getRowFromTable('antennas', 'id', antAliasRow.antennaId)
        console.log("CalcThreshold: antRow:")
        console.log(antRow)

        const antennaListRow = dbUtil.getRowFromTable('antennaTypes', 'type', antRow.type)
        console.log("CalcThreshold: antennaListRow:")
        console.log(antennaListRow)

        antRefObj.noTrk = antennaListRow.gain

        //TODO - Implement
        // CheckClass(antennaListRow.classification, true)

        antRefObj.noAcq = antRefObj.noTrk
        antRefObj.degAcq = antRefObj.noAcq
        antRefObj.degTrk = antRefObj.noTrk

        if(useTestData === true) {
            applyTestData(antRow.id, 4, signalRow, antRefObj)
        }

        //Determine Gain for Antenna Electronics Type
        const aeAliasRow = dbUtil.getRowFromTable('antennaElectronicsAliases', 'id', systemRow.aeAliasId)
        console.log("CalcThreshold: aeAliasRow:")
        console.log(aeAliasRow)
        aeRow = dbUtil.getRowFromTable('antennaElectronics', 'id', aeAliasRow.aeId)
        console.log("CalcThreshold: aeRow:")
        console.log(aeRow)

        const electronicsTypeRow = dbUtil.getRowFromTable('electronicTypes', 'type', aeRow.type)
        console.log("CalcThreshold: electronicsTypeRow:")
        console.log(electronicsTypeRow)

        aeRefObj.noTrk = electronicsTypeRow.gain

        //TODO - Implement
        // CheckClass(electronicsTypeRow.classification, true)

        aeRefObj.noAcq = aeRefObj.noTrk
        aeRefObj.degAcq = aeRefObj.noAcq
        aeRefObj.degTrk = aeRefObj.noTrk

        if(useTestData === true) {
            applyTestData(aeRow.id, 5, signalRow, aeRefObj)
        }

        //Determine Gain for Anti-Jam
        const ajAliasRow = dbUtil.getRowFromTable('antiJammersAliases', 'id', systemRow.antiJamAliasId)
        console.log("CalcThreshold: ajAliasRow:")
        console.log(ajAliasRow)
        ajRow = dbUtil.getRowFromTable('antiJammers', 'id', ajAliasRow.ajId)
        console.log("CalcThreshold: ajRow:")
        console.log(ajRow)

        const ajTypeRow = dbUtil.getRowFromTable('antijamTypes', 'type', ajRow.type)
        console.log("CalcThreshold: ajTypeRow:")
        console.log(ajTypeRow)

        ajRefObj.noTrk = ajTypeRow.gain

        //TODO - Implement
        // CheckClass(ajTypeRow.classification, true)

        ajRefObj.noAcq = ajRefObj.noTrk
        ajRefObj.degAcq = ajRefObj.noAcq
        ajRefObj.degTrk = ajRefObj.noTrk

        if(useTestData === true) {
            applyTestData(ajRow.id, 6, signalRow, ajRefObj)
        }

        //TODO - Ask Siggy why each are separate and same IF checks
        //Determine system-level thresholds
        if (rcvrRefObj.noAcq) {
            overallRefObj.degAcq = rcvrRefObj.degAcq + imuRefObj.degAcq + antRefObj.degAcq + aeRefObj.degAcq + ajRefObj.degAcq
            console.log("CalcThreshold: Setting overall degAcq to " + overallRefObj.degAcq)
        } else {
            overallRefObj.degAcq = 0
            console.log("CalcThreshold: Setting overall degAcq to 0 because receiver noAcq value is " + rcvrRefObj.noAcq)
        }

        if (rcvrRefObj.noAcq) {
            overallRefObj.noAcq = rcvrRefObj.noAcq + imuRefObj.noAcq + antRefObj.noAcq + aeRefObj.noAcq + ajRefObj.noAcq
            console.log("CalcThreshold: Setting overall noAcq to " + overallRefObj.noAcq)

        } else {
            overallRefObj.noAcq = 0
            console.log("CalcThreshold: Setting overall noAcq to 0 because receiver noAcq value is " + rcvrRefObj.noAcq)
        }

        if (rcvrRefObj.noTrk) {
            overallRefObj.degTrk = rcvrRefObj.degTrk + imuRefObj.degTrk + antRefObj.degTrk + aeRefObj.degTrk + ajRefObj.degTrk
            console.log("CalcThreshold: Setting overall degTrk to " + overallRefObj.degTrk)
        } else {
            overallRefObj.degTrk = 0
            console.log("CalcThreshold: Setting overall noAcq to 0 because receiver noTrk value is " + rcvrRefObj.noTrk)
        }

        if (rcvrRefObj.noTrk) {
            overallRefObj.noTrk = rcvrRefObj.noTrk + imuRefObj.noTrk + antRefObj.noTrk + aeRefObj.noTrk + ajRefObj.noTrk
            console.log("CalcThreshold: Setting overall noTrk to " + overallRefObj.noTrk)
        } else {
            overallRefObj.noTrk = 0
            console.log("CalcThreshold: Setting overall noTrk to 0 because receiver noTrk value is " + rcvrRefObj.noTrk)
        }

        overallRefObj.degAcqEst = (rcvrRefObj.degAcqEst || imuRefObj.degAcqEst || antRefObj.degAcqEst || aeRefObj.degAcqEst || ajRefObj.degAcqEst)
        overallRefObj.noAcqEst = (rcvrRefObj.noAcqEst || imuRefObj.noAcqEst || antRefObj.noAcqEst || aeRefObj.noAcqEst || ajRefObj.noAcqEst)
        overallRefObj.degTrkEst = (rcvrRefObj.degTrkEst || imuRefObj.degTrkEst || antRefObj.degTrkEst || aeRefObj.degTrkEst || ajRefObj.degTrkEst)
        overallRefObj.noTrkEst = (rcvrRefObj.noTrkEst || imuRefObj.noTrkEst || antRefObj.noTrkEst || aeRefObj.noTrkEst || ajRefObj.noTrkEst)

        overallRefObj.system = systemRow.system
        overallRefObj.signal = signalRow.name

        //TODO - Insert Fancy Code Here

        if((receiverRow.channels === 4 || receiverRow.channels === 5) && aeRow.type.includes("Nulling")) {
            //TODO - CheckClass "S", True

            if(rcvrRefObj.noAcq) { overallRefObj.noAcq = Math.max(overallRefObj.noAcq - process.env.RECEIVER_CALCULATED_LOSS, 24)}
            if(rcvrRefObj.noAcq) { overallRefObj.degAcq = Math.min(overallRefObj.degAcq, overallRefObj.noAcq)}
            if(rcvrRefObj.noTrk) { overallRefObj.degTrk = overallRefObj.noTrk - process.env.RECEIVER_CALCULATED_LOSS}
            if(rcvrRefObj.noTrk) { overallRefObj.degTrkEst = false }
        }


        if(useTestData === true) {
            applyTestData(systemRow.id, 1, signalRow, overallRefObj)
        }
        // else {
        //     //TODO - REMOVE FOR OPS
        //     overallRefObj.degAcqEst = false;
        //     overallRefObj.noAcqEst = false;
        //     overallRefObj.degTrkEst = false;
        //     overallRefObj.noTrkEst = false;
        // }

        overallRefObj.degAcq = Math.round(overallRefObj.degAcq)
        overallRefObj.noAcq = Math.round(overallRefObj.noAcq)
        overallRefObj.degTrk = Math.round(overallRefObj.degTrk)
        overallRefObj.noTrk = Math.round(overallRefObj.noTrk)

        overallRefObj.asOfDate = systemRow.asOfDate

        //Include the configuration information in the returned object
        overallRefObj.configData = getConfigInfo(systemRow, signalRow, receiverRow, imuRow, antRow, aeRow, ajRow)

        //If a simulated jammer was requested, calculate the range rings
        if(jammerPower !== null && jammerRangeUnits !== null) {
            overallRefObj.jammerRanges = calculateJammerRanges(jammerPower, signalRow, jammerRangeUnits)
        }

        console.log("CalcThreshold: Finalized threshold object:")
        console.log(overallRefObj)

        return overallRefObj
    }

}

function getConfigInfo(systemRow, signalRow, receiverRow, imuRow, antRow, aeRow, ajRow) {

    let configData = {
        systemCountry: systemRow.country,
        systemAgency: systemRow.agency,
        systemType: systemRow.type,
        systemUse: systemRow.use,
        receiverName: receiverRow.name,
        coupling: systemRow.coupling,
        imu: imuRow.name,
        antennaName: antRow.name,
        antennaElectronics: aeRow.name,
        antiJamInfo: ajRow.name,
    }

    return configData

}

// ID = System/Component ID
// S = signalRow
// T = ID of the System type (from ListSUTType)
// RefObj = an object of all the Acq and Trk so that it can be modified by reference (Javascript thing)
function applyTestData(ID, sutTypeID, signalRow, refObj) { //,  xDegAcq, xDegAcqEst, xNoAcq, xNoAcqEst, xDegTrk, xDegTrkEst, xNoTrk, xNoTrkEst) {

    // let testRow = dbUtil.getRowFromTable('testSummary', 'systemId', ID)
    let testRows = dbUtil.queryTableForRows('testSummary', {systemId: ID, signal: signalRow.id, sutType: sutTypeID})

    if (testRows.length === 1) {

        const testRow = testRows[0]

        //TODO Implement
        //CheckClass TestClass(TestRow), True

        //Adjust No Acquisition Threshold for Test Data
        if (testRow.minAcqDenied && refObj.noAcq >= testRow.minAcqDenied) {
            refObj.noAcq = testRow.minAcqDenied
            refObj.noAcqEst = false
        }

        if (Math.max(testRow.maxAcqClean, testRow.maxAcqDegrade) > 0) {
            const temp = Math.max(testRow.maxAcqClean, testRow.maxAcqDegrade)
            if (refObj.noAcq <= temp) {
                refObj.noAcq = temp
                refObj.noAcqEst = false
            }
        }

        //Adjust Degraded Acquisition Threshold for Test Data
        refObj.degAcq = refObj.noAcq
        refObj.degAcqEst = refObj.noAcqEst

        if (Math.min(testRow.minAcqDenied, testRow.minAcqDegrade)) {
            const temp = Math.min(testRow.minAcqDenied, testRow.minAcqDegrade)
            if (refObj.degAcq >= temp) {
                refObj.degAcq = temp
                refObj.degAcqEst = false
            }
        }

        //Adjust No Track Threshold for Test Data
        if (testRow.maxTrkLoss) {
            refObj.noTrk = testRow.maxTrkLoss
            refObj.noTrkEst = false
        }
        if (testRow.maxTrkClean && refObj.noTrk <= testRow.maxTrkClean) {
            refObj.noTrk = testRow.maxTrkClean
            refObj.noTrkEst = false
        }
        if (refObj.noTrk <= testRow.maxTrkDegrade) {
            refObj.noTrk = testRow.maxTrkDegrade
            refObj.noTrkEst = false
        }

        //Adjust Degraded Track Threshold for Test Data
        if (refObj.degTrkEst) {
            refObj.degTrk = refObj.noTrk
            refObj.degTrkEst = refObj.noTrkEst
        }

        const tempLowest = Math.min(testRow.minTrkDegrade, testRow.minTrkLoss)

        if (tempLowest > 0 && refObj.degTrk >= tempLowest) {
            refObj.degTrk = tempLowest
            refObj.degTrkEst = false
        }

    } else if (testRows.length === 0) {
        console.log("No test data found for ID: " + ID + ", SystemType: " + sutTypeID + ", and signal: " + signalRow.name)
    } else {
        console.log("!!!!ERROR!!!!")
        console.log("More than one test row found!")
        console.log("!!!!ERROR!!!!")
    }

}

function getRowFromTable(table, columnName, val) {

    console.log("Getting data: " + val + " from " + table + ":" + columnName)

    try {
        const stmt = db.prepare('SELECT * FROM ' + table + ' WHERE ' + columnName + '=?')

        return stmt.get(val)

    } catch (err) {
        return null;
    }

}

function queryTableForRows(table, queryObj) {

    let queryString = ""

    //Create the query parameters for the DB
    Object.keys(queryObj).forEach((key, i) => {
        queryString = queryString.concat(key + " = :" + key);
        if (i < Object.keys(queryObj).length - 1) {
            queryString += " AND "
        }
    })

    try {
        const stmt = db.prepare('SELECT * FROM ' + table + ' WHERE ' + queryString)

        return stmt.all(queryObj)

    } catch (err) {
        return null;
    }

}

function calculateJammerRanges(jdBW, signal, units) {
    if(jdBW > 0 && units != null) {
        let rangeArr = []
        for ( let js = 24; js <= 104; js += 10) {

            //Calculate the range for the power in KM
            let thisRange = 10 ** ((jdBW - 20 * Math.log10(signal.freq) - 32.44778322 - signal.rcvdPwr - js) / 20)

            //Convert the ranges to the desired unit
            if(units === "km") {
                //KM is calculated in the equation above, do nothing
            } else if (units === "nm") {
                thisRange = (thisRange * 0.53996)
            } else if (units === "mi") {
                thisRange = (thisRange * 0.62137)
            } else if (units === "m") {
                thisRange = thisRange * 1000
            } else if (units === "ft") {
                thisRange = thisRange * 3280.84
            } else {
                console.log("ERROR: Unknown unit: " + units + ". Assuming KM")
                //Assuming KM, so not doing anything
            }
            rangeArr.push(thisRange)
        }
        return rangeArr
    }
}

//Not currently using this. Might want it in the future
function convertDbwToWatts(dbwValue) {
    let jammerWatts = null;
    if(dbwValue != null) {
        let watts = 10 ^ (dbwValue / 10)
        if(watts < 1) {
            jammerWatts = Math.round(watts * 100) / 100
        }
        else if(watts < 10) {
            jammerWatts = Math.round(watts * 10) / 10
        } else {
            jammerWatts = Math.round(watts)
        }
    } else {
        jammerWatts = null
    }

    return jammerWatts
}

//Not currently using this. Might want it in the future
function convertWattsToDbw(wattValue) {
    let jammerDbw = null;
    if(wattValue > 0) {
        let dbw = 10 * Math.log10(wattValue)
        if(Math.abs(dbw) < 1) {
            jammerDbw = Math.round(dbw * 100) / 100
        }
        else if(Math.abs(dbw) < 10) {
            jammerDbw = Math.round(dbw * 10) / 10
        } else {
            jammerDbw = Math.round(dbw)
        }
    } else {
        jammerDbw = null
    }

    return jammerDbw
}

module.exports = {calcThresholds}
