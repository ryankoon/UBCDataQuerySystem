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
        let query: QueryRequest = {
          "GET": ["asdf_dept", "asdf_id", "asdf_avg"],
          "WHERE": {
              "OR": [
                  {"AND": [
                          {"GT": {"asdf_avg": 70}},
                          {"IS": {"asdf_dept": "adhe"}}
                      ]},
                      {"EQ": {"asdf_avg": 90}}
              ]
          },
          "ORDER": "asdf_avg",
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
          "ORDER": "asdf_instructor",
          "AS": "TABLE"
        };

        let dataset: {} = {"asdf1234":{"result":[{"Avg":70,"Professor":"Elmo"},{"Avg":110,"Professor":"Bond, James"},{"Avg":21,"Professor":"Vader, Darth"},{"Avg":87,"Professor":"E.T."},{"Avg":37,"Professor":"Bond, James"},{"Avg":12,"Professor":"Gollum"}],"rank":7}};

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

    it("Should properly sort queries based on given querykey and courseResults", function() {
      let results = [{ "Avg": 70, "Professor": "Elmo" },
                     { "Avg": 110, "Professor": "Bond, James" },
                     { "Avg": 21, "Professor": "Vader, Darth" }];

      let orderedResultsAlphabetically = [{ "Avg": 110, "Professor": "Bond, James" },
                                          { "Avg": 70, "Professor": "Elmo" },
                                          { "Avg": 21, "Professor": "Vader, Darth" }];

      let orderedResultsNumerically = [  { "Avg": 21, "Professor": "Vader, Darth" },
                                         { "Avg": 70, "Professor": "Elmo" },
                                         { "Avg": 110, "Professor": "Bond, James" }];

      let controller = new QueryController({});
      let orderedResults: any[];
      orderedResults = controller.orderResults(results, controller.translateKey("instructor"));
      expect(orderedResults).to.be.deep.equal(orderedResultsAlphabetically);

      orderedResults = controller.orderResults(results, controller.translateKey("avg"));
      expect(orderedResults).to.be.deep.equal(orderedResultsNumerically);

    });

    it("Should be able to query a dataset", function () {
        let query: QueryRequest = {
          "GET": ["asdf_instructor"],
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
          "ORDER": "asdf_instructor",
          "AS": "TABLE"
        };

        let dataset: Datasets = {"asdf1234":{"result":[{"Avg":70,"Professor":"Elmo"},{"Avg":110,"Professor":"Bond, James"},{"Avg":21,"Professor":"Vader, Darth"},{"Avg":87,"Professor":"E.T."},{"Avg":37,"Professor":"Bond, James"},{"Avg":12,"Professor":"Gollum"}],"rank":7}};

        let expectedResult: any = { render: 'TABLE',
          result: [
            { "asdf_instructor": "E.T." },
            { "asdf_instructor": "Elmo" },
            { "asdf_instructor": "Vader, Darth" }
          ]

        }

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.be.deep.equal(expectedResult);
        // should check that the value is meaningful
        // will be meaningful once entire query feature is complete
    });

    it("Should be able to validate a query for string comparison", function() {
        let controller = new QueryController({});
        let str: string;
        let ret: boolean;
        str = "cpsc";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(true);
        str = "*cpsc";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(true);
        str = "cpsc*";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(true);
        str = "*cpsc*";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(true);
        str = "**cpsc*";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(false);
        str = "a*cpsc";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(false);
        str = "*cpsc**";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(false);
        str = "*cpsc*a";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(false);
        str = "a*cpsc*a";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(false);
        str = "**cpsc**";
        ret = controller.validStringComparison(str);
        expect(ret).to.equal(false);
    });

    it("Should be able to perform wildcard matching", function() {
        let controller = new QueryController({});
        let wildcardstr: string;
        let comparestr: string;
        let ret: boolean;

        wildcardstr = "*cp";
        comparestr = "ascp";
        ret = controller.wildcardMatching(wildcardstr, comparestr);
        expect(ret).to.equal(true);

        wildcardstr = "*cp";
        comparestr = "cpsc";
        ret = controller.wildcardMatching(wildcardstr, comparestr);
        expect(ret).to.equal(false);

        wildcardstr = "cp*";
        comparestr = "cpsc";
        ret = controller.wildcardMatching(wildcardstr, comparestr);
        expect(ret).to.equal(true);

        wildcardstr = "cp*";
        comparestr = "acpsc";
        ret = controller.wildcardMatching(wildcardstr, comparestr);
        expect(ret).to.equal(false);

        wildcardstr = "*cp*";
        comparestr = "acpsc";
        ret = controller.wildcardMatching(wildcardstr, comparestr);
        expect(ret).to.equal(true);
    });

    it("Should be able to properly sort", function() {
        let controller = new QueryController({});
        let ret: Object[];
        let filteredResults: Object[];
        let expectedOrder: Object[];
        let order: string;

        filteredResults = [{"Professor": "Canada"}, {"Professor": "USA"}];
        expectedOrder = [{"Professor": "Canada"}, {"Professor": "USA"}];
        order = "Professor";
        ret = controller.orderResults(filteredResults, order);
        expect(ret).to.be.deep.equal(expectedOrder);

        filteredResults = [{"Professor": "USA"}, {"Professor": "Canada"}];
        expectedOrder = [{"Professor": "Canada"}, {"Professor": "USA"}];
        order = "Professor";
        ret = controller.orderResults(filteredResults, order);
        expect(ret).to.be.deep.equal(expectedOrder);

        filteredResults = [{"Professor": "-"}, {"Professor": ","}];
        expectedOrder = [{"Professor": ","}, {"Professor": "-"}];
        order = "Professor";
        ret = controller.orderResults(filteredResults, order);
        expect(ret).to.be.deep.equal(expectedOrder);
    });
});
