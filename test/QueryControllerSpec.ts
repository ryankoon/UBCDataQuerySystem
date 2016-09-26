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

    it("Should be able to query, although the answer will be empty", function () {
        // NOTE: this is not actually a valid query for D1, nor is the result correct.
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should check that the value is meaningful
    });

    it("Should properly translate query keys to the keys used in dataset", function () {
      // NOTE: this directly tagets translatekey function in QueryController
      let controller = new QueryController({});
      let result:string;
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

});
