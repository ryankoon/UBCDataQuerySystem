/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        // NOTE: this is not actually a valid query for D1
        let query: QueryRequest = {
          "GET": ["courses_dept", "courses_id", "courses_avg"],
          "WHERE": {
              "OR": [
                  {"AND": [
                          {"GT": {"courses_avg": 70}},
                          {"IS": {"courses_dept": "adhe"}}
                      ]},
                      {"EQ": {"courses_avg": 90}}
              ]
          },
          "ORDER": "courses_avg",
          "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.be.a('string');
    });

    it("Should be able to filter dataset", function () {
        Log.test("queryfilter test");
        let query: QueryRequest = {
          "GET": ["asdf_avg", "asdf_instructor"],
          "WHERE": {
            "AND" : [{
              "NOT" : {
                "IS": {"asdf_instructor": "Bond, James"}
              }
            },
            {
              "OR" : [
              {"GT": {"asdf_avg": 30}},
              {"IS": {"asdf_instructor": "Vader, Darth"}}
              ]
            }]
          },
          "ORDER": "asdf_avg",
          "AS": "TABLE"
        };

        let dataset: {} = {
            "abcd1234": {
              "result": [
                { "Avg": 70, "Professor": "Elmo" },
                { "Avg": 110, "Professor": "Bond, James" },
                { "Avg": 21, "Professor": "Vader, Darth" }
              ],
              "rank": 10
            },
            "efgh5678": {
              "result": [
                { "Avg": 87, "Professor": "E.T." },
                { "Avg": 37, "Professor": "Bond, James" },
                { "Avg": 12, "Professor": "Gollum" }
              ],
              "rank": 8
            }
        };

        let controller = new QueryController(dataset);
        Log.test("Controller: " + controller);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should check that the value is meaningful
        // will be meaningful once entire query feature is complete
    });

    it("Should properly translate query keys to the keys used in dataset", function () {
      // NOTE: this directly tagets translatekey function in QueryController
      let controller = new QueryController({});
      let result: string;
      result = controller.translateKey('dept');
      expect(result).to.be.equal('Subject');
      result = controller.translateKey('id');
      expect(result).to.be.equal('Course');
      result = controller.translateKey('avg');
      expect(result).to.be.equal('Avg');
      result = controller.translateKey('instructor');
      expect(result).to.be.equal('Professor');
      result = controller.translateKey('title');
      expect(result).to.be.equal('Title');
      result = controller.translateKey('pass');
      expect(result).to.be.equal('Pass');
      result = controller.translateKey('fail');
      expect(result).to.be.equal('Fail');
      result = controller.translateKey('audit');
      expect(result).to.be.equal('Audit');
      result = controller.translateKey('MacOrWindows');
      expect(result).to.be.equal('unknownKey');
    });

    it("Should properly split keys into datasetId and column names", function() {
        let controller = new QueryController({});
        let result: string;

        result = controller.getDatasetId("lemonDS_apple");
        expect(result).to.be.equal("lemonDS");
        result = controller.getQueryKey("lemonDS_apple");
        expect(result).to.be.equal("apple");
        result = controller.getQueryKey("lemonDSapple");
        expect(result).to.be.equal('');
        result = controller.getDatasetId("lemon_DS_apple");
        expect(result).to.be.equal('');
    });

});
