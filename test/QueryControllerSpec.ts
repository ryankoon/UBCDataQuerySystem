/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
import {IApplyTokenToKey, IApplyObject} from "../src/controller/IEBNF";
import {IObject} from "../src/controller/IObject";
import {IGroupHashMap} from "../src/controller/IHashMap";
import {QueryResponse} from "../src/controller/QueryController";
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        Log.test("Test - A valid query.");
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

        Log.test("Test - The key in ORDER does not exist in GET");
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
        Log.error(<string>isValid);
        expect(isValid).to.be.a("string");
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - empty query");
        query = {};
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - no get keys");
        query = {"GET": []};
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Undefined WHERE");
        query = {"GET": ["asdf_key"]};
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Empty GROUP");
        query = {
            "GET": ["asdf_key"],
            "WHERE": {},
            "GROUP": []
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Undefined AS");
        query = {
            "GET": ["asdf_key"],
            "WHERE": {},
            "GROUP": ["asdf_key"],
            "APPLY": []
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - AS is not TABLE");
        query = {
            "GET": ["asdf_key"],
            "WHERE": {},
            "GROUP": ["asdf_key"],
            "APPLY": [],
            "AS": "CHAIR"
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Invalid Filter");
        query = {
            "GET": ["asdf_key"],
            "WHERE": {"INVALIDFILTER": "INVALID"},
            "GROUP": ["asdf_key"],
            "APPLY": [],
            "AS": "TABLE"
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Custom Key in GET but APPLY is empty");
        query = {
            "GET": ["asdf_key", "aCustomKey"],
            "WHERE": {},
            "GROUP": ["asdf_key"],
            "APPLY": [],
            "AS": "TABLE"
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Custom Key in GET but APPLY is empty");
        query = {
            "GET": ["asdf_key", "aBadKey"],
            "WHERE": {},
            "GROUP": ["asdf_key", "aBadKey"],
            "APPLY": [{"aBadKey": {"MAX": "asdf_key2"}}, {"anotherCustomKey": {"MIN": "asdf_key3"}}],
            "AS": "TABLE"
        };
        isValid = controller.isValid(query);
        expect(isValid).to.be.a('string');

        Log.test("Invalid Query - Invalid APPLY token");
        query = {
            "GET": ["asdf_key", "aBadKey"],
            "WHERE": {},
            "GROUP": ["asdf_key"],
            "APPLY": [{"aBadKey": {"RANDOM": "asdf_key2"}}],
            "AS": "TABLE"
        };
        isValid = controller.isValid(query);
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
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        // should check that the value is meaningful
        // will be meaningful once entire query feature is complete
    });

    it("Should properly translate query keys to the keys used in dataset", function () {
      Log.info("This directly tagets translatekey function in QueryController");
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
        Log.info("This directly tagets translatekey function in QueryController");
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
        new Log();
        Log.warn("There are no datasets in this instance of QueryController.");
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
      orderedResults = controller.orderResults(results, [controller.translateKey("instructor")], "UP");
      expect(orderedResults).to.be.deep.equal(orderedResultsAlphabetically);

      orderedResults = controller.orderResults(results, [controller.translateKey("avg")], "UP");
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

        let dataset: Datasets = {"asdfDatasetID": {"asdf1234":{"result":[{"Avg":70,"Professor":"Elmo"},{"Avg":110,"Professor":"Bond, James"},{"Avg":21,"Professor":"Vader, Darth"},{"Avg":87,"Professor":"E.T."},{"Avg":37,"Professor":"Bond, James"},{"Avg":12,"Professor":"Gollum"}],"rank":7}}};

        let expectedResult: any = { render: 'TABLE',
          result: [
            { "asdf_instructor": "E.T." },
            { "asdf_instructor": "Elmo" },
            { "asdf_instructor": "Vader, Darth" }
          ]

        };

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
        ret = controller.orderResults(filteredResults, [sortBy], "UP");
        expect(ret).to.be.deep.equal(expectedOrder);

        filteredResults = [{"Professor": "USA"}, {"Professor": "Canada"}];
        expectedOrder = [{"Professor": "Canada"}, {"Professor": "USA"}];
        ret = controller.orderResults(filteredResults, [sortBy], "UP");
        expect(ret).to.be.deep.equal(expectedOrder);

        filteredResults = [{"Professor": "-"}, {"Professor": ","}];
        expectedOrder = [{"Professor": ","}, {"Professor": "-"}];
        ret = controller.orderResults(filteredResults, [sortBy], "UP");
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
                        {"LT": {"myID_uuid": 30}},
                        {"EQ": {"myID_pass": 12}},
                        {"IS": {"yourID_instructor": "Vader, Darth"}}
                    ]
                }]
        };

        let expectedResult: string[] = ["asdf_instructor", "myID_avg", "myID_uuid", "myID_pass", "yourID_instructor"];
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
            "LT": {"yourID_instructor": "Vader, Darth", "extraKey": "badValue"}
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("LT Comparator must have exactly one key!");

        whereObject = {
            "GT": {"yourID_instructor": "Vader, Darth", "extraKey": "badValue"}
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("GT Comparator must have exactly one key!");

        whereObject = {
            "GT": {"yourID_instructor": "Vader, Darth"}
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("GT Comparator value must be a number!");

        whereObject = {
            "EQ": {"yourID_instructor": "Vader, Darth"}
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.throw("EQ Comparator value must be a number!");

        whereObject = {
            "WRONG": {"yourID_instructor": "Vader, Darth"}
        };

        expect(function () {
            controller.getWhereQueryKeys(whereObject);
        }).to.not.throw();

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

    it ("Should determine what the max is", function (done){
        let controller = new QueryController();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'                 /* new */
        let applyObject: Object = {};
        let results = [{"Professor": "Elmo", "Avg": 70, },
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 21, "Professor": "Vader, Darth"}];
        let applyToken : Object = { MAX : 'Avg'};
        let out: Number = controller.findMaximumValueInDataSet('avg', results);
        expect(out === 110).to.be.true;
        done();
    });
    it ("Should determine what the min is", function (done){
        let controller = new QueryController();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'                 /* new */
        let applyObject: Object = {};
        let results = [{"Avg": 70, "Professor": "Elmo"},
            {"Professor": "Bond, James", "Avg": 110},
            {"Avg": 21, "Professor": "Vader, Darth"}];
        let applyToken : Object = { MAX : 'Avg'};
        let out: Number = controller.findMinimumValueInDataSet('avg', results);
        expect(out === 21).to.be.true;
        done();
    });
    it ("Should determine what the average is", function (done){
        let controller = new QueryController();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'                 /* new */
        let applyObject: Object = {};
        let results = [{"Avg": 70, "Professor": "Elmo"},
            {"Professor": "Bond, James", "Avg": 110},
            {"Professor": "Vader, Darth", "Avg": 21}];
        let applyToken : Object = { MAX : 'Avg'};
        let out: Number = controller.findAverageValueInDataSet('avg', results);
        expect(out === 67.00).to.be.true;
        done();
    });
    it ("Should determine what the unique row count is", function (done){
        let controller = new QueryController();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'                 /* new */
        let results = [{"Avg": 70, "Professor": "Elmo"},
            {"Avg": 70, "Professor": "Elmo"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Professor": "Vader, Darth", "Avg": 21, }];
        let applyToken : Object = { MAX : 'Avg'};
        let out: Number = controller.findCountSearchedInDataSet('avg', results);
        expect(out === 3).to.be.true;
        done();
    });

    it("Should submit and return every possible query for applyActionOnDataSet", function (done) {
        let controller = new QueryController();
        let results = [{"Avg": 70, "Professor": "Elmo"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 21, "Professor": "Vader, Darth"}];
        let max = controller.applyActionOnDataSet('MAX', 'avg', results);
        let min = controller.applyActionOnDataSet('MIN', 'avg', results);
        let count = controller.applyActionOnDataSet('COUNT', 'avg', results);
        let avg = controller.applyActionOnDataSet('AVG', 'avg', results);
        expect (max === 110).to.be.true;
        expect(min === 21).to.be.true;
        expect(count === 3).to.be.true;
        expect(avg === 67.00).to.be.true;
        done();
     });

    it("Should Log trace invalid APPLY Token.", function (done) {
        let controller = new QueryController();
        let results = [{"Avg": 70, "Professor": "Elmo"},
            {"Avg": 110, "Professor": "Bond, James"},
            {"Avg": 21, "Professor": "Vader, Darth"}];
        expect(function () {
            controller.applyActionOnDataSet('INVALID', 'avg', results);
        }).to.not.throw();
        done();
    });

    it("Should iterate through a list of results successfully and find the outcome", (done) =>{
        let controller = new QueryController();
        let results = [{"Avg": 70, "Professor": "Elmo", "Audit" : 5 },
            {"Avg": 111, "Professor": "Bond, James", "Audit" : 5 } ,
            {"Avg": 21, "Professor": "Vader, Darth", "Audit" : 6 }  ];

        let applyToken = [
            {"courseAvg" : { AVG : "asdf_audit" } },
            {"maxCourseNumber" :{ MAX: "asdf_audit" }},
            {"anotherProfCount" : { COUNT : "asdf_instructor" }},
            {"profCount" :{ COUNT : "asdf_instructor"}},
            {"lowestAvg" : {MIN: "asdf_avg"}}
        ];

        let resultFromApplyToken = [
            {"courseAvg" :  5.33 },
            {"maxCourseNumber" : 6},
            {"anotherProfCount" : 3},
            {"profCount" : 3 },
            {"lowestAvg" : 21 }
        ];
        let out = controller.executeApplyTokenOnResults(results, applyToken);
        expect(out).to.deep.equal(resultFromApplyToken);
        done();
    });

    it("Should return the ApplyTokenToKey Object given the custom key", function() {
        let controller = new QueryController({});
        let applyArray: IApplyObject[] = [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ];
        let result: IApplyTokenToKey;

        result = controller.getApplyTokenToKeyObject(applyArray, "courseAverage");
        expect(result).to.be.deep.equal({"AVG": "courses_avg"});

        result = controller.getApplyTokenToKeyObject(applyArray, "maxFail");
        expect(result).to.be.deep.equal({"MAX": "courses_fail"});

        result = controller.getApplyTokenToKeyObject(applyArray, "nonexistentkey");
        expect(result).to.be.deep.equal({});

    });

    it("Should be able to validate the ORDER part of the query", function() {
        let controller = new QueryController();
        let query: QueryRequest;
        let result: boolean | string;

        //D1 implementation - a single string
        Log.test("Testing when Order value is found in get. (D1)");
         query = {
            "GET": ["asdf_avg", "asdf_instructor"],
            "WHERE": {},
            "ORDER": "asdf_instructor",
            "AS": "TABLE"
         };

        result = controller.isValid(query);
        expect(result).to.equal(true);

        Log.test("Testing when Order value is not found in get. (D1)");
        query = {
            "GET": ["asdf_avg"],
            "WHERE": {},
            "ORDER": "asdf_instructor",
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        Log.error(<string>result);
        expect(result).to.be.a("string");

        //D2 implementation - an object with 'dir' and array of 'keys'
        Log.test("Testing when Order object keys are found in get. (D2)");
        query = {
            "GET": ["asdf_avg", "asdf_instructor"],
            "WHERE": {},
            "ORDER": {"dir": "UP", "keys": ["asdf_avg", "asdf_instructor"]},
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        expect(result).to.equal(true);

        Log.test("Testing when Order object keys missing in get. (D2)");
        query = {
            "GET": ["asdf_avg"],
            "WHERE": {},
            "ORDER": {"dir": "UP", "keys": ["asdf_avg", "asdf_instructor"]},
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        Log.error(<string>result);
        expect(result).to.be.a("string");

        Log.test("Testing when Order object keys is empty. (D2)");
        query = {
            "GET": ["asdf_avg"],
            "WHERE": {},
            "ORDER": {"dir": "DOWN", "keys": []},
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        Log.error(<string>result);
        expect(result).to.be.a("string");

        Log.test("Testing when Order object direction is invalid. (D2)");
        query = {
            "GET": ["asdf_avg"],
            "WHERE": {},
            "ORDER": {"dir": "sideways", "keys": ["asdf_avg", "asdf_instructor"]},
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        Log.error(<string>result);
        expect(result).to.be.a("string");
    });

    it("Should be able to validate that all GET keys with underscore are in GROUP and keys without underscore are in APPLY",
        function() {

        let controller = new QueryController();
        let query: QueryRequest;
        let result: boolean | string;

        Log.test("Testing - GET keys are either found in GROUP or APPLY.");
        query = {
            "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
            "WHERE": {},
            "GROUP": ["asdf_instructor"],
            "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
            "ORDER": "asdf_instructor",
            "AS": "TABLE"
        };
        result = controller.isValid(query);
        expect(result).to.equal(true);

        Log.test("Testing - GET keys are missing in GROUP");
        query = {
            "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
            "WHERE": {},
            "GROUP": ["asdf_anykey"],
            "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
            "ORDER": "asdf_instructor",
            "AS": "TABLE"
        };
        result = controller.isValid(query);
            Log.error(<string>result);
        expect(result).to.be.a("string");

        Log.test("Testing - GET keys are missing in APPLY");
        Log.test("Note: Keys defined in APPLY do not need to be used");
        query = {
            "GET": ["myCustomApplyKey", "myMissingApplyKey", "asdf_instructor"],
            "WHERE": {},
            "GROUP": ["asdf_instructor"],
            "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
            "ORDER": "asdf_instructor",
            "AS": "TABLE"
        };

        result = controller.isValid(query);
            Log.error(<string>result);
        expect(result).to.be.a("string");

        Log.test("Testing - ORDER keys are missing in APPLY");
        query = {
            "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
            "WHERE": {},
            "GROUP": ["asdf_instructor"],
            "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
            "ORDER": {"dir": "UP", "keys": ["myCustomApplyKey", "myMissingApplyKey"]},
            "AS": "TABLE"
        };

        result = controller.isValid(query);
            Log.error(<string>result);
        expect(result).to.be.a("string");


        Log.test("Testing - ORDER keys are found in APPLY");
        query = {
            "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
            "WHERE": {},
            "GROUP": ["asdf_instructor"],
            "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
            "ORDER": {"dir": "UP", "keys": ["myCustomApplyKey", "myCustomApplyKey2"]},
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        expect(result).to.equal(true);
    });

    it("Should be able to validate that GROUP and APPLY are either both defined or both undefined",
        function() {

            let controller = new QueryController();
            let query: QueryRequest;
            let result: boolean | string;

            Log.test("Testing - GROUP is defined but APPLY is not.");
            query = {
                "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
                "WHERE": {},
                "GROUP": ["asdf_instructor"],
                "ORDER": "asdf_instructor",
                "AS": "TABLE"
            };
            result = controller.isValid(query);
            Log.error(<string>result);
            expect(result).to.be.a("string");

            Log.test("Testing - APPLY is defined but GROUP is not.");
            query = {
                "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
                "WHERE": {},
                "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
                "ORDER": "asdf_instructor",
                "AS": "TABLE"
            };
            result = controller.isValid(query);
            Log.error(<string>result);
            expect(result).to.be.a("string");

            Log.test("Testing - Both GROUP and APPLY are defined");
            query = {
                "GET": ["myCustomApplyKey", "myCustomApplyKey2", "asdf_instructor"],
                "WHERE": {},
                "GROUP": ["asdf_instructor"],
                "APPLY": [{"myCustomApplyKey": {"MAX": "asdf_avg"}}, {"myCustomApplyKey2": {"MIN": "asdf_avg"}}],
                "ORDER": "asdf_instructor",
                "AS": "TABLE"
            };
            result = controller.isValid(query);
            expect(result).to.equal(true);

            Log.test("Testing - Neither GROUP and APPLY are defined");
            query = {
                "GET": ["asdf_instructor"],
                "WHERE": {},
                "ORDER": "asdf_instructor",
                "AS": "TABLE"
            };
            result = controller.isValid(query);
            expect(result).to.equal(true);
        });

    it("Should be able to order results with given direction.", function() {
        let controller: QueryController = new QueryController();
        let unorderedResults: Object[];
        let expectedResults: Object[];
        let results: Object[];

        Log.test("Test - Ordering is 'up'.");
        unorderedResults = [
            {"Java": "Oracle", "JavaScript": "JS", "C": "Coffee"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Animal"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Zebra"}
        ];
        expectedResults = [
            {"Java": "Oracle", "JavaScript": "JS", "C": "Animal"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Coffee"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Zebra"}
        ];

        results = controller.orderResults(unorderedResults, ["Java", "JavaScript", "C"], "UP");
        expect(results).to.be.deep.equal(expectedResults);

        Log.test("Test - Ordering is 'down'.");
        unorderedResults = [
            {"Java": "Oracle", "JavaScript": "JS", "C": "Coffee"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Animal"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Zebra"}
        ];
        expectedResults = [
            {"Java": "Oracle", "JavaScript": "JS", "C": "Zebra"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Coffee"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Animal"}
        ];

        results = controller.orderResults(unorderedResults, ["JavaScript", "C"], "DOWN");
        expect(results).to.be.deep.equal(expectedResults);
    });

    it("Should be able to order results with multiple keys", function() {
        let controller: QueryController = new QueryController();
        let unorderedResults: Object[];
        let expectedResults: Object[];
        let results: Object[];

        Log.test("Test - Ordering with two keys.");
        unorderedResults = [
            {"Java": "Oracle", "JavaScript": "JS", "C": "Coffee"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Animal"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Zebra"}
        ];

        expectedResults = [
            {"Java": "Oracle", "JavaScript": "JS", "C": "Animal"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Coffee"},
            {"Java": "Oracle", "JavaScript": "JS", "C": "Zebra"}
        ];

        results = controller.orderResults(unorderedResults, ["JavaScript", "C"], "UP");
        expect(results).to.be.deep.equal(expectedResults);

        Log.test("Test - Ordering with many keys. Final comparisons are with strings.");
        unorderedResults = [
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": "Coffee"},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": "Animal"},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": "Zebra"}
        ];

        expectedResults = [
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": "Animal"},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": "Coffee"},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": "Zebra"}
        ];

        results = controller.orderResults(unorderedResults, ["Java", "Num", "JavaScript", "Python", "Ruby", "C"], "UP");
        expect(results).to.be.deep.equal(expectedResults);

        Log.test("Test - Ordering with many keys. Final comparisons are with numbers.");
        unorderedResults = [
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 8},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 3},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 1}
        ];

        expectedResults = [
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 1},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 3},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 8}
        ];

        results = controller.orderResults(unorderedResults, ["Java", "Num", "JavaScript", "Python", "Ruby", "C"], "UP");
        expect(results).to.be.deep.equal(expectedResults);

        Log.test("Test - Ordering with many keys. All values involved in comparison are the same.");
        unorderedResults = [
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 8},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 3},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 1}
        ];

        expectedResults = [
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 8},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 3},
            {"Java": "Oracle", "Num": 3, "JavaScript": "JS", "Python": "Snake", "Ruby": "Gem", "C": 1}
        ];

        results = controller.orderResults(unorderedResults, ["Java", "Num", "JavaScript", "Python", "Ruby"], "UP");
        expect(results).to.be.deep.equal(expectedResults);

    });

    it("Should properly translate a custom key.", function() {
        let controller: QueryController = new QueryController();
        let applyObjects: IApplyObject[] = [{"myCustomKey": {"MAX": "asdf_instructor"}}, {"betterCustomKey": {"MIN": "asdf_avg"}}];
        let expectedResults: Object[];
        let result: string;

        result = controller.translateCustomKey(applyObjects, "betterCustomKey");
        expect(result).to.be.equal("Avg");
        result = controller.translateCustomKey(applyObjects, "myCustomKey");
        expect(result).to.be.equal("Professor");
    });

    it("Should properly translate an array of query keys and custom keys.", function () {
        let controller: QueryController = new QueryController();
        let untranslatedKeys: string[] = ["asdf_instructor", "asdf_avg", "betterCustomKey", "myCustomKey", "uuid"];
        let applyObjects: IApplyObject[] = [{"myCustomKey": {"MAX": "asdf_title"}}, {"betterCustomKey": {"MIN": "asdf_pass"}}];
        let expectedResults: string[] = ["Professor, Pass, Avg, Title, id"];
        let result: string[];

        result = controller.translateKeys(untranslatedKeys, applyObjects);
        expect(result).to.be.deep.equal(result);
    });

    it("Should invalidate query when a key is found in both Order and Apply.", function() {
        let controller: QueryController = new QueryController();
        let query: QueryRequest;
        let result: boolean | string;

        Log.test("Test - Keys are found in both GROUP and APPLY");
        query = {
            "GET": ["asdf_keyboard", "asdf_mouse"],
            "WHERE": {},
            "GROUP": ["asdf_keyboard", "asdf_mouse"],
            "APPLY": [{"powerButton": {"MAX": "asdf_volume"}}, {"restartButton": {"COUNT": "asdf_mouse"}}],
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        expect(result).to.be.equal("A key appears in both GROUP and APPLY!");

        Log.test("Test - Keys are unique beteween GROUP and APPLY");
        query = {
            "GET": ["asdf_keyboard", "asdf_mouse"],
            "WHERE": {},
            "GROUP": ["asdf_keyboard", "asdf_mouse"],
            "APPLY": [{"powerButton": {"MAX": "asdf_volume"}}, {"restartButton": {"COUNT": "asdf_pause"}}],
            "AS": "TABLE"
        };

        result = controller.isValid(query);
        expect(result).to.be.equal(true);
    });

    it("Should be able to group filtered results.", function() {
        let controller: QueryController = new QueryController();
        let filteredResults: IObject[];
        let queryGroup: string[];
        let expectedResult: IGroupHashMap;
        let result: IGroupHashMap;

        filteredResults = [
            {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 4,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 6,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
            {"Avg": 2, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 4,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 6,"Professor": "Snape, Severus"}
        ];

        queryGroup = ["asdf_avg", "asdf_instructor"];
        expectedResult = {
            "Avg1ProfessorSnape, Severus": [
                {"Avg": 1, "id": 2,"Professor": "Snape, Severus"},
                {"Avg": 1, "id": 4,"Professor": "Snape, Severus"},
                ],
            "Avg2ProfessorSnape, Severus": [
                {"Avg": 2, "id": 2,"Professor": "Snape, Severus"}
                ],
            "Avg3ProfessorSnape, Severus": [
                {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
                {"Avg": 3, "id": 4,"Professor": "Snape, Severus"},
                {"Avg": 3, "id": 6,"Professor": "Snape, Severus"},
                {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
                {"Avg": 3, "id": 6,"Professor": "Snape, Severus"},
                ]
        };

        result = controller.groupFilteredResults(filteredResults, queryGroup);
        expect(result).to.be.deep.equal(expectedResult);
    });

    it("Should be able to query with GROUP and APPLY.", function() {
        let controller: QueryController = new QueryController();
        let datasetResults: IObject[];
        let datasets: Datasets;
        let query: QueryRequest;
        let expectedResults: QueryResponse;
        let result: QueryResponse;



        Log.test("Test - Simple query.");
        datasetResults = [
            {"Avg": 3, "id": 1, "Professor": "Snape, Severus"},
            {"Avg": 3, "id": 1, "Professor": "HarryPotter"},
            {"Avg": 5, "id": 1, "Professor": "HarryPotter"},
            {"Avg": 1, "id": 1, "Professor": "Snape, Severus"}
        ];

        datasets = {
            "asdf": {"asdf1234":{"result": datasetResults,"rank":7}}
        };

        query = {
            "GET": ["asdf_uuid", "asdf_instructor",  "MaxAverage"],
            "WHERE": {},
            "GROUP": ["asdf_instructor", "asdf_uuid"],
            "APPLY": [
                {"MaxAverage": {"MAX": "asdf_avg"}}
            ],
            "ORDER": {"dir": "DOWN", "keys": ["asdf_uuid", "MaxAverage"]},
            "AS": "TABLE"
        };

        expectedResults = {
            "render": "TABLE",
            "result": [
                {"asdf_uuid": 1, "asdf_instructor": "HarryPotter", "MaxAverage": 5},
                {"asdf_uuid": 1, "asdf_instructor": "Snape, Severus", "MaxAverage": 3}
            ]
        };

        controller.setDataset(datasets);
        result = controller.query(query);
        expect(result).to.be.deep.equal(expectedResults);




        Log.test("Test - Complex query.");
        datasetResults = [
            {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
            {"Avg": 2, "id": 2,"Professor": "HarryPotter"},
            {"Avg": 1, "id": 3,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 3,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 11,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 11,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 7,"Professor": "HarryPotter"},
            {"Avg": 3, "id": 7,"Professor": "HarryPotter"},
            {"Avg": 3, "id": 1,"Professor": "HarryPotter"},
            {"Avg": 3, "id": 11,"Professor": "HarryPotter"},
            {"Avg": 2, "id": 11,"Professor": "HarryPotter"}
        ];

        datasets = {
            "asdf": {"asdf1234":{"result": datasetResults,"rank":7}}
        };

        query = {
            "GET": ["asdf_instructor", "asdf_uuid", "MaxAverage", "minaverage"],
            "WHERE": {
                "AND": [
                    {"AND": [
                        {"NOT": {"IS": {"asdf_instructor": "notAProf"}}},
                        {"NOT": {"LT": {"asdf_avg": -10}}},
                        {"NOT": {"EQ": {"asdf_uuid": 11}}}
                            ]
                    },
                    {"NOT": {"IS": {"asdf_instructor": "selfTaught"}}}
                ]
            },
            "GROUP": ["asdf_instructor", "asdf_uuid"],
            "APPLY": [
                {"MaxAverage": {"MAX": "asdf_avg"}},
                {"minaverage": {"MIN": "asdf_avg"}}
            ],
            "ORDER": {"dir": "DOWN", "keys": ["asdf_uuid", "MaxAverage"]},
            "AS": "TABLE"
        };

        expectedResults = {
            "render": "TABLE",
            "result": [
                {"asdf_instructor": "HarryPotter", "asdf_uuid": 7, "MaxAverage": 3, "minaverage": 3},
                {"asdf_instructor": "Snape, Severus", "asdf_uuid": 3, "MaxAverage": 1, "minaverage": 1},
                {"asdf_instructor": "Snape, Severus", "asdf_uuid": 2, "MaxAverage": 3, "minaverage": 1},
                {"asdf_instructor": "HarryPotter", "asdf_uuid": 2, "MaxAverage": 2, "minaverage": 2},
                {"asdf_instructor": "Snape, Severus", "asdf_uuid": 1, "MaxAverage": 3, "minaverage": 3},
                {"asdf_instructor": "HarryPotter", "asdf_uuid": 1, "MaxAverage": 3, "minaverage": 3}
            ]
        };

        controller.setDataset(datasets);
        let validQuery = controller.isValid(query);
        expect(validQuery).to.be.equal(true);
        result = controller.query(query);
        expect(result).to.be.deep.equal(expectedResults);

    });

    it("Should be able to query with empty APPLY.", function() {
        let controller: QueryController = new QueryController();
        let datasetResults: IObject[];
        let datasets: Datasets;
        let query: QueryRequest;
        let expectedResults: QueryResponse;
        let result: QueryResponse;

        datasetResults = [
            {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
            {"Avg": 2, "id": 2,"Professor": "HarryPotter"},
            {"Avg": 1, "id": 3,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 2,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 3,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 1,"Professor": "Snape, Severus"},
            {"Avg": 1, "id": 11,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 11,"Professor": "Snape, Severus"},
            {"Avg": 3, "id": 7,"Professor": "HarryPotter"},
            {"Avg": 3, "id": 7,"Professor": "HarryPotter"},
            {"Avg": 3, "id": 1,"Professor": "HarryPotter"},
            {"Avg": 3, "id": 11,"Professor": "HarryPotter"},
            {"Avg": 2, "id": 11,"Professor": "HarryPotter"}
        ];

        datasets = {
            "asdf": {"asdf1234":{"result": datasetResults,"rank":7}}
        };

        query = {
            "GET": ["asdf_uuid", "asdf_instructor"],
            "WHERE": {
                "AND": [
                    {"AND": [
                        {"NOT": {"IS": {"asdf_instructor": "notAProf"}}},
                        {"NOT": {"LT": {"asdf_avg": -10}}},
                        {"NOT": {"EQ": {"asdf_uuid": 11}}}
                    ]
                    },
                    {"NOT": {"IS": {"asdf_instructor": "selfTaught"}}}
                ]
            },
            "GROUP": ["asdf_instructor", "asdf_uuid"],
            "APPLY": [],
            "ORDER": {"dir": "UP", "keys": ["asdf_uuid", "asdf_instructor"]},
            "AS": "TABLE"
        };

        expectedResults = {
            "render": "TABLE",
            "result": [
                {"asdf_uuid": 1,"asdf_instructor": "HarryPotter"},
                {"asdf_uuid": 1,"asdf_instructor": "Snape, Severus"},
                {"asdf_uuid": 2,"asdf_instructor": "HarryPotter"},
                {"asdf_uuid": 2,"asdf_instructor": "Snape, Severus"},
                {"asdf_uuid": 3,"asdf_instructor": "Snape, Severus"},
                {"asdf_uuid": 7,"asdf_instructor": "HarryPotter"}
            ]
        };

        controller.setDataset(datasets);
        let validQuery = controller.isValid(query);
        expect(validQuery).to.be.equal(true);
        result = controller.query(query);
        expect(result).to.be.deep.equal(expectedResults);
    });

    it("Should allow APPLY to be an empty array.", function() {
        let controller: QueryController = new QueryController();
        let query: QueryRequest;

        query = {
            "GET": ["courses_uuid"],
            "WHERE": {},
            "GROUP": ["courses_uuid"],
            "APPLY": [],
            "ORDER": {"dir": "UP", "keys": ["courses_uuid"]},
            "AS": "TABLE"
        };

        let result = controller.isValid(query);
        expect(result).to.be.equal(true);
    });

    it("Should return false when trying to filter a course result with an invalid filter.", function() {
        let controller: QueryController = new QueryController();


        let result = controller.queryACourseResult("BADFILTER", {});
        expect(result).to.be.equal(false);
    });

    it("Should return false when trying to compare numbers with an invalid comparator.", function() {
        let controller: QueryController = new QueryController();


        let result = controller.numberCompare({"BADFILTER": -1}, "INVALIDOP", {});
        expect(result).to.be.equal(false);
    });

    it("Should return false when trying to compare invalid strings.", function() {
        let controller: QueryController = new QueryController();
        let result: boolean;

        Log.test("Test - null querykey value or datakey value.")
        result = controller.stringCompare({"asdf_instructor": null}, "IS", {"Professor": null});
        expect(result).to.be.equal(false);

        Log.test("Test - query key value is an empty string.")
        result = controller.stringCompare({"asdf_instructor": ""}, "IS", {"Professor": "ad"});
        expect(result).to.be.equal(false);

        Log.test("Test - data key value is an empty string.")
        result = controller.stringCompare({"asdf_instructor": "asdf"}, "IS", {"Professor": ""});
        expect(result).to.be.equal(false);

        Log.test("Test - both query key value and data key value is an empty string.")
        result = controller.stringCompare({"asdf_instructor": ""}, "IS", {"Professor": ""});
        expect(result).to.be.equal(false);

        Log.test("Test - valid wildcard matching.")
        result = controller.stringCompare({"asdf_instructor": "*est"}, "IS", {"Professor": "test"});
        expect(result).to.be.equal(true);

        Log.test("Test - Invalid string comparison with wildcard matching.")
        result = controller.stringCompare({"asdf_instructor": "*e*st*"}, "IS", {"Professor": "test"});
        expect(result).to.be.equal(false);

        Log.test("Test - String comparison with invalid comparator")
        result = controller.stringCompare({"asdf_instructor": "*e*st*"}, "ABC", {"Professor": "test"});
        expect(result).to.be.equal(false);
    });


});
