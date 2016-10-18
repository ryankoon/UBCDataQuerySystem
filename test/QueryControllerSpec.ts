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
                    {"AND":
                        [
                            {"GT": {"asdf_avg": 70}},
                            {"IS": {"asdf_dept": "adhe"}}
                        ]
                    },
                    {"EQ": {"asdf_avg": 90}}
                ]
            },
            "ORDER": "asdf_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller: QueryController = new QueryController(dataset);
        let isValid: string | boolean ;

        isValid = controller.isValid(query);
        expect(isValid).to.equal(true);

        // The key in ORDER does not exist in GET!
        query = {
            "GET": ["asdf_dept", "asdf_id", "asdf_avg"],
            "WHERE":
            {
                "IS": {"asdf_dept": "adhe"}
            },
            "ORDER": "asdf_BADORDER",
            "AS": "TABLE"
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a("string");

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

        let datasets: Datasets = {"asdf1234":{"result":[{"Avg":70,"Professor":"Elmo"},{"Avg":110,"Professor":"Bond, James"},{"Avg":21,"Professor":"Vader, Darth"},{"Avg":87,"Professor":"E.T."},{"Avg":37,"Professor":"Bond, James"},{"Avg":12,"Professor":"Gollum"}],"rank":7}};

        let controller = new QueryController(datasets);
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
      result = controller.translateKey('uuid');
      expect(result).to.be.equal('id');
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

    it("Should properly reverse the translation of keys used in dataset", function () {
        // NOTE: this directly tagets translatekey function in QueryController
        let controller = new QueryController({});
        let result: string;
        result = controller.reverseKeyTranslation('Subject');
        expect(result).to.be.equal('dept');
        result = controller.reverseKeyTranslation('id');
        expect(result).to.be.equal('uuid');
        result = controller.reverseKeyTranslation('Course');
        expect(result).to.be.equal('id');
        result = controller.reverseKeyTranslation('Avg');
        expect(result).to.be.equal('avg');
        result = controller.reverseKeyTranslation('Professor');
        expect(result).to.be.equal('instructor');
        result = controller.reverseKeyTranslation('Title');
        expect(result).to.be.equal('title');
        result = controller.reverseKeyTranslation('Pass');
        expect(result).to.be.equal('pass');
        result = controller.reverseKeyTranslation('Fail');
        expect(result).to.be.equal('fail');
        result = controller.reverseKeyTranslation('Audit');
        expect(result).to.be.equal('audit');
        result = controller.reverseKeyTranslation('MacOrWindows');
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

        let dataset: Datasets ={"asdfDatasetID": {"asdf1234":{"result":[{"Avg":70,"Professor":"Elmo"},{"Avg":110,"Professor":"Bond, James"},{"Avg":21,"Professor":"Vader, Darth"},{"Avg":87,"Professor":"E.T."},{"Avg":37,"Professor":"Bond, James"},{"Avg":12,"Professor":"Gollum"}],"rank":7}}};

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

    it("Should be able to properly sort according to ascii table", function() {
        let controller = new QueryController({});
        let ret: Object[];
        let filteredResults: Object[];
        let expectedOrder: Object[];
        let sortBy: string = "Professor";

        filteredResults = [{"Professor": "Canada"}, {"Professor": "USA"}];
        expectedOrder = [{"Professor": "Canada"}, {"Professor": "USA"}];
        ret = controller.orderResults(filteredResults, sortBy);
        expect(ret).to.be.deep.equal(expectedOrder);

        filteredResults = [{"Professor": "USA"}, {"Professor": "Canada"}];
        expectedOrder = [{"Professor": "Canada"}, {"Professor": "USA"}];
        ret = controller.orderResults(filteredResults, sortBy);
        expect(ret).to.be.deep.equal(expectedOrder);

        filteredResults = [{"Professor": "-"}, {"Professor": ","}];
        expectedOrder = [{"Professor": ","}, {"Professor": "-"}];
        ret = controller.orderResults(filteredResults, sortBy);
        expect(ret).to.be.deep.equal(expectedOrder);
    });

    it("Should return all queryKeys with getWhereQueryKeys", function() {
        let whereObject: Object = {
            "AND": [{
                "NOT": {
                    "IS": {"asdf_instructor": "Bond, James"}
                }
            },
                {
                    "OR": [
                        {"GT": {"myID_avg": 30}},
                        {"IS": {"yourID_instructor": "Vader, Darth"}}
                    ]
                }]
        };

        let expectedResult: string[] = ["asdf_instructor", "myID_avg", "yourID_instructor"];
        let controller = new QueryController({});
        let ret = controller.getWhereQueryKeys(whereObject);
        expect(ret).to.be.deep.equal(expectedResult);
    });

    it("Should throw error when query is invalid deep inside WHERE", function () {
        let controller = new QueryController({});
        let whereObject: Object = {
            "AND": [{
                "NOT": {
                    "IS": {}
                }
            },
                {
                    "OR": [
                        {"GT": {"myID_avg": 30}},
                        {"IS": {"yourID_instructor": "Vader, Darth"}}
                    ]
                }]
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("IS Comparator must have exactly one key!");


        whereObject = {
            "AND": [{
                "NOT": {}
            },
                {
                    "OR": [
                        {"GT": {"myID_avg": 30}},
                        {"IS": {"yourID_instructor": "Vader, Darth"}}
                    ]
                }]
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("NOT must have exactly one filter!");

        whereObject = {
            "AND": [{
                "NOT": {
                    "IS": {"asdf_instructor": "Bond, James"}
                }
            },
                {
                    "OR": []
                }]
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("OR must have at least one filter!");

        whereObject = {
            "AND": [{
                "NOT": {
                    "IS": {"asdf_instructor": "Bond, James"}
                }
            },
                {
                    "EQ": {}
                }]
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("EQ Comparator must have exactly one key!");
    });

    it("Should throw error when Comparators are not given the right type of value", function () {

        let controller = new QueryController({});
        let query: Object;

        query = {
            "AND" : [{
                "NOT" : {
                    "IS": {"asdf_instructor": 32}
                }
            },
                {
                    "OR" : [
                        {"LT": {"asdf_avg": 30}},
                        {"IS": {"asdf_instructor": "Vader, Darth"}}
                    ]
                }]
        };

        expect(function () {
            controller.getWhereQueryKeys(query);
        }).to.throw("IS Comparator value must be a string!");

        query = {
                "AND" : [{
                    "NOT" : {
                        "IS": {"asdf_instructor": "Bond, James"}
                    }
                },
                    {
                        "OR" : [
                            {"LT": {"asdf_avg": "asdf"}},
                            {"IS": {"asdf_instructor": "Vader, Darth"}}
                        ]
                    }]
        };

        expect(function () {
            controller.getWhereQueryKeys(query);
        }).to.throw("LT Comparator value must be a number!");

    });

    it("Should return all results if WHERE is an empty object", function () {

        let controller = new QueryController({});
        let results: Object[];
        let inputItems: Object[] = [{"a":"a"}, {"b":"b"}, {"c":"c"}, {"d":"d"}, {"e":"e"}];

        results = controller.filterCourseResults({}, inputItems);

        expect(results).to.be.deep.equal(inputItems);
    });
    it("Should find the MAX of an APPLY", function (done) {
        let controller = new QueryController();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'                 /* new */
        let applyObject: Object = {}
        let results = [{"Avg": 70, "Professor": "Elmo"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 21, "Professor": "Vader, Darth"}];
        let applyToken : Object = { MAX : 'Avg'};
        let out: Number = controller.executeApplyTokenOnResults(applyToken, results);
        expect(out === 110).to.be.true;
        done();

    });
    it("Should find the MIN of an APPLY" ,function (done) {
        let controller = new QueryController();
        let results = [{ "Avg": 70, "Professor": "Elmo" },
            { "Avg": 110, "Professor": "Bond, James" },
            { "Avg": 21, "Professor": "Vader, Darth" }];
        let applyToken = {MIN : 'Avg'};
        let out: Number = controller.executeApplyTokenOnResults(applyToken, results);
        expect(out === 21).to.be.true;
        done();
    });
    it("Should find the AVG of an APPLY (rounded to 2dp) ", function (done) {
        let controller = new QueryController();
        let results = [{ "Avg": 70, "Professor": "Elmo" },
            { "Avg": 111, "Professor": "Bond, James" },
            { "Avg": 21, "Professor": "Vader, Darth" }];
        Log.test("Average should be 67.33333 rounded to 2dp");
        let applyToken = {Avg : 'Avg'};
        let out: Number = controller.executeApplyTokenOnResults(applyToken, results);
        expect(out === 67).to.be.true;
        done();
    });
    it("Should find the COUNT of an APPLY", function (done) {
        let controller = new QueryController();
        let results = [{ "Avg": 70, "Professor": "Elmo" },
            { "Avg": 111, "Professor": "Bond, James" },
            { "Avg": 21, "Professor": "Vader, Darth" }];
        let applyToken = {COUNT : 'Avg'};
        let out: Number = controller.executeApplyTokenOnResults(applyToken, results);
        expect(out === 67).to.be.true;
        done();
    });

    it("Should ensure apply propertys type is correct", function (done) {
        let controller = new QueryController();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'                 /* new */
        let applyObject: Object = {}
        let stringNumberResult = {"Avg": "70", "Professor": "Elmo"};
        let intNumberResult = { "Avg" : 70, "Professor" : "Elmo" };


        let maxToken : Object = { MAX : 'Avg'};
        let minToken : Object = { MAX : 'Avg'};
        let avgToken : Object = { MAX : 'Avg'};
        let countToken : Object = {COUNT :'AVG'};

        let out1: Boolean = controller.numberCheck(maxToken, stringNumberResult);
        let out2: Boolean = controller.numberCheck(minToken, stringNumberResult);
        let out3: Boolean = controller.numberCheck(avgToken, stringNumberResult);
        let out4: Boolean = controller.numberCheck(countToken, stringNumberResult);
        let out5: Boolean = controller.numberCheck(maxToken, intNumberResult);
        let out6: Boolean = controller.numberCheck(minToken, intNumberResult);
        let out7: Boolean = controller.numberCheck(avgToken, intNumberResult);
        let out8: Boolean = controller.numberCheck(countToken, intNumberResult);
        let out9: Boolean = controller.numberCheck(countToken, intNumberResult)

        //Assert string number outcomes.
        expect(out1 === false).to.be.true;
        expect(out2 === false).to.be.true;
        expect(out3 === false).to.be.true;
        expect(out4 === true).to.be.true;

        //Assert integer number outcomes
        expect(out5 === true).to.be.true;
        expect(out6 === true).to.be.true;
        expect(out7 === true).to.be.true;
        expect(out8 === true).to.be.true;
        expect(out9 === true).to.be.true;

        done();
    });

    it("Should pass if APPLY doesnt have two targets with the same name" ,(done) => {
        let controller = new QueryController();
        let applyQuery = [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ];
        let result : boolean = controller.checkDuplicateTarget(applyQuery);
        expect(result === true).to.be.true;
    });
    it("Should fail if APPLY has two targets with the same name" ,(done) => {
        let controller = new QueryController();
        let applyQuery = [ {"courseAverage": {"AVG": "courses_avg"}}, {"courseAverage": {"MAX": "courses_fail"}} ];
        let result : boolean = controller.checkDuplicateTarget(applyQuery);
        expect(result === false).to.be.true;
    });

    it("Should iterate through a list of results successfully and find the outcome", (done) =>{
        let controller = new QueryController();
        let results = [{ "Avg": 70, "Professor": "Elmo", "CourseNumber" : 5 },
            { "Avg": 111, "Professor": "Bond, James", "CourseNumber" : 5 },
            { "Avg": 21, "Professor": "Vader, Darth", "CourseNumber" : 6 }];
        let applyToken = [
            {"courseAvg" : { SUM : "CourseNumber" } },
            {"courseNum" :{ MAX: "CourseNumber" }},
            {"courseCount" : { COUNT : "111" }},
            {"profCount" :{ COUNT : {"Professor" : "Bond, James"}}},
            {"lowestAvg" : {MIN: "Avg"}}
            ];

        let resultFromApplyToken = [
            {"courseAvg" :  16 },
            {"courseNum" : 6},
            {"courseCount" : 1},
            {"profCount" : 1 },
            {"lowestAvg" : 21}
        ]
        let out: Number = controller.executeApplyTokenOnResults(applyToken, results);
        expect(out).to.deep.equal(resultFromApplyToken);
        done
    });


/*
 "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],

 APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' ) '],'
    APPLYTOKEN ::= 'MAX' | 'MIN' | 'AVG' | 'COUNT'
*/

});
