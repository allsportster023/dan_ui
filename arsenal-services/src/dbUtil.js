var db = require("./database.js")

function getRowFromTable(table, columnName, val) {
    try {
        const stmt = db.prepare('SELECT * FROM ' + table + ' WHERE ' + columnName + '=?')

        return stmt.get(val)

    } catch (err) {
        return null;
    }

}

function queryTableForRows(table, queryObj) {

    let queryString = ""

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

function tableContains(table, queryObj) {

   inTable = false;
   result = queryTableForRows(table, queryObj);
   if (result.length === 1) inTable = true;

   return inTable;

}

module.exports = {getRowFromTable,queryTableForRows,tableContains}