"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require('axios');
var chalk = require('chalk');
var moment = require("moment");
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.projectId = 2;
        this.base = "https://" + options.domain + "/index.php?/api/v2";
    }
    TestRail.prototype.createRun = function (name, description) {
        var _this = this;
        // Get all runs and get the date of the most current run
        axios({
            method: 'get',
            url: this.base + "/get_runs/" + this.projectId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        })
            .then(function (response) {
            _this.runDate = response.data[0].description;
        })
            .catch(function (error) { return console.error(error); });
        // set current date with same format as this.runDate
        this.currentDate = moment(new Date()).format('L');
        // If the runDate of the most current test run is equal to today's date, don't create a new test run.
        if (this.runDate !== this.currentDate) {
            axios({
                method: 'post',
                url: this.base + "/add_run/" + this.options.projectId,
                headers: { 'Content-Type': 'application/json' },
                auth: {
                    username: this.options.username,
                    password: this.options.password,
                },
                data: JSON.stringify({
                    suite_id: this.options.suiteId,
                    name: name,
                    description: description,
                    include_all: true,
                }),
            })
                .then(function (response) {
                _this.runId = response.data.id;
            })
                .catch(function (error) { return console.error(error); });
        }
        return;
    };
    TestRail.prototype.publishResults = function (results) {
        var _this = this;
        if (!this.options.createTestRun) {
            this.runId = this.options.runId;
        }
        axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),
        })
            .then(function (response) {
            console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            console.log('\n', " - Results are published to " + chalk.magenta("https://" + _this.options.domain + "/index.php?/runs/view/" + _this.runId), '\n');
        })
            .catch(function (error) { return console.error(error); });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map