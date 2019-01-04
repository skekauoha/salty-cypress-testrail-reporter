const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';
import moment = require('moment');

export class TestRail {
  private base: String;
  private runId: Number;
  private projectId: Number = 2;
  private runDate: string;
  private currentDate: string;

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  public createRun(name: string, description: string) {

      // set current date with same format as this.runDate
      this.currentDate = moment(new Date()).format('L');

      console.log(`
      
      CURRENTDATE CURRENTDATE CURRENTDATE CURRENTDATE CURRENTDATE CURRENTDATE CURRENTDATE CURRENTDATE CURRENTDATE 
  
      ${this.currentDate}, ${this.runDate}
      
      `)
    
    // Get all runs and get the date of the most current run
    axios({
      method: 'get',
      url: `${this.base}/get_runs/${this.projectId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
          username: this.options.username,
          password: this.options.password,
      },
      // data: JSON.stringify({
      //     suite_id: this.options.suiteId,
      //     name,
      //     description,
      //     include_all: true,
      // }),
    })
      .then(response => {
        console.log(`
        
        
        RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  RESPONSE  
        DATA: ${response.data[0]}, ID: ${response.data[0].id}
        
        `)
        this.runDate = response.data[0].description;
      })
      .catch(error => console.error(error));

      console.log(`
      
      RUNDATE RUNDATE RUNDATE RUNDATE RUNDATE RUNDATE RUNDATE RUNDATE RUNDATE RUNDATE 
  
      ${this.currentDate}, ${this.runDate}
      
      `)

    // If the runDate of the most current test run is equal to today's date, don't create a new test run.
    if (this.runDate !== this.currentDate) {
      axios({
        method: 'post',
        url: `${this.base}/add_run/${this.options.projectId}`,
        headers: { 'Content-Type': 'application/json' },
        auth: {
            username: this.options.username,
            password: this.options.password,
        },
        data: JSON.stringify({
            suite_id: this.options.suiteId,
            name,
            description,
            include_all: true,
        }),
      })
        .then(response => {
            this.runId = response.data.id;
        })
        .catch(error => console.error(error));
    }

    return;
  }

  public publishResults(results: TestRailResult[]) {

    if (!this.options.createTestRun) {
      this.runId = this.options.runId;
    }

    axios({
      method: 'post',
      url: `${this.base}/add_results_for_cases/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({ results }),
    })
      .then(response => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log(
          '\n',
          ` - Results are published to ${chalk.magenta(
            `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
          )}`,
          '\n'
        );
      })
      .catch(error => console.error(error));
  }
}
