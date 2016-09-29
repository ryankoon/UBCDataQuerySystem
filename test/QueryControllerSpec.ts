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
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
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

        expect(isValid).to.equal(false);
    });

    it("Should be able to filter dataset", function () {
        Log.test("queryfilter test");
        let query: QueryRequest = {
          "GET": ["courses_avg", "courses_instructor"],
          "WHERE": {
            "AND" : {
              "NOT" : {
                "IS": {"courses_instructor": "Bond, James" },
                "GT": {"courses_avg": 80}
              },
              "OR" : {
                "GT": {"courses_avg": 30},
                "IS": {"courses_instructor": "Vader, Darth"}
              }
            }
          },
          "ORDER": "courses_avg",
          "AS": "table"
        };

        let dataset: Datasets = {
          "asdf": {
            "abcd1234": {
              "results": [
                { "Avg": 70, "Professor": "Elmo" },
                { "Avg": 110, "Professor": "Bond, James" },
                { "Avg": 21, "Professor": "Vader, Darth" }
              ]
            },
            "efgh5678": {
              "results": [
                { "Avg": 87, "Professor": "E.T." },
                { "Avg": 37, "Professor": "Bond, James" },
                { "Avg": 12, "Professor": "Gollum" }
              ]
            }
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
      result = controller.translateKey('courses_dept', 'ABCD1234');
      expect(result).to.be.equal('ABCD');
      result = controller.translateKey('courses_id', 'ABCD1234');
      expect(result).to.be.equal('1234');
      result = controller.translateKey('courses_dept', '1234ABCD');
      expect(result).to.be.equal('unknownDept');
      result = controller.translateKey('courses_id', '1234ABCD');
      expect(result).to.be.equal('unknownId');
      result = controller.translateKey('courses_dept');
      expect(result).to.be.equal('unknownDept');
      result = controller.translateKey('courses_id');
      expect(result).to.be.equal('unknownId');
      result = controller.translateKey('courses_avg');
      expect(result).to.be.equal('Avg');
      result = controller.translateKey('courses_instructor');
      expect(result).to.be.equal('Professor');
      result = controller.translateKey('courses_title');
      expect(result).to.be.equal('Title');
      result = controller.translateKey('courses_pass');
      expect(result).to.be.equal('Pass');
      result = controller.translateKey('courses_fail');
      expect(result).to.be.equal('Fail');
      result = controller.translateKey('courses_audit');
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
