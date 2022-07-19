// Create express app
const express = require("express")
const cors = require('cors');
const pretty = require('express-prettify');
const app = express()
const db = require("./database.js")
const functions = require("./arsenal-functions.js")
const checkclass = require("./checkClass.js")

const swaggerUi = require('swagger-ui-express');
swaggerDocument = require('./swagger.json');

//CORS is allowed
app.use(cors());

app.use(pretty({query: 'pretty'}))
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// Server port
var HTTP_PORT = 8000
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port " + HTTP_PORT)
});

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message": "API is working"})
});

//GET the list of the SQLite tables
app.get("/api/tables", (req, res, next) => {

    try {
        const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'")
        const tables = stmt.all()

        res.json({
            "message": "success",
            "tables": tables.map(x => x.name).sort()
        })

    } catch (err) {
        res.status(400).json({
            "message": "failed",
            "error": err.message
        });
    }

});

// GET the contents of a given table (mainly development use for now)
app.get("/api/rows/:table", (req, res, next) => {
    var sql = "select * from " + req.params.table

    try {

        const stmt = db.prepare(sql)
        const rows = stmt.all()

        res.json({
            "message": "success",
            "data": rows
        })

    } catch (err) {
        res.status(400).json({
            "message": "failed",
            "error": err.message
        });

    }

});

// Use systemId and signalId for now (1, 1)
app.get("/api/thresholds", (req, res, next) => {

    const { systemId, signalId, useTestData = true, jammerPower, jammerRangeUnits } = req.query

    if(systemId && signalId) {
        res.json(functions.calcThresholds(systemId, signalId, useTestData, jammerPower, jammerRangeUnits))
    } else {
        res.status(400).json({
            "message": "failed",
            "error": "Invalid parameters: Make sure you have a 'systemId' and 'signalId' as integers"
        });
    }
});

app.get("/api/checkclass", (req, res, next) => {

    const { classString, cumulative = true } = req.query

    if(classString && cumulative) {
        res.json(checkclass.checkClass(classString, cumulative))
    } else {
        res.status(400).json({
            "message": "failed",
            "error": "Invalid parameters: Make sure you have a 'systemId' and 'signalId' as integers"
        });
    }
});

app.get("/api/system", (req, res, next) => {

    console.log(req.query)

    const { name } = req.query

    if( name === "*") {

        //If the users wants all of the rows from the DB
        const stmt = db.prepare("SELECT id,system FROM systems")
        const rows = stmt.all()

        res.json({
            "message": "success",
            "data": rows
        })

    } else if( name ) {

        const stmt = db.prepare("SELECT id,system FROM systems WHERE system LIKE ?")

        const rows = stmt.all('%' + name + '%')

        res.json({
            "message": "success",
            "data": rows
        })

    } else {
        res.status(400).json({
            "message": "failed",
            "error": "Invalid query parameter: Make sure you have a system 'name' as a string"
        });
    }
});

app.get("/api/signal", (req, res, next) => {

    console.log(req.query)

    const { name } = req.query

    if( name === "*" ) {
        //If the user wants to see all of the signals in the DB
        const stmt = db.prepare("SELECT id,name FROM signals")
        const rows = stmt.all()

        res.json({
            "message": "success",
            "data": rows
        })

    } else if( name ) {

        const stmt = db.prepare("SELECT id,name FROM signals WHERE name LIKE ?")

        const rows = stmt.all('%' + name + '%')

        res.json({
            "message": "success",
            "data": rows
        })

    } else {
        res.status(400).json({
            "message": "failed",
            "error": "Invalid query parameter: Make sure you have a signal 'name' as a string"
        });
    }
});

// TODO Insert other API endpoints here

// Default response for any other request
app.use(function (req, res) {
    res.status(404);
});
