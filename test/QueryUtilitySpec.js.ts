/**
 * Created by alekhrycaiko on 2016-10-20.
 */
import QueryController from "../src/controller/QueryUtility";
import QueryUtility from "../src/controller/QueryUtility";
import Log from "../src/Util";
import {expect} from 'chai';
import {IApplyObject} from "../src/controller/IEBNF";

describe('queryUtility checkDuplicateTarget', function () {
    it("Should return true if APPLY does have two targets with the same name", (done) => {
        let controller = new QueryUtility();
        let applyArray: IApplyObject[] = [ {"courseAverage": {"AVG": "courses_avg"}}, {"courseAverage": {"MAX": "courses_fail"}} ];
        let result: boolean = controller.targetHasDuplicate(applyArray);
        expect(result === true).to.be.true;
        done();
    });
    it("Should return false if APPLY has two targets without the same name", (done) => {
        let controller = new QueryUtility();
        let applyArray: IApplyObject[] = [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ];
        let result: boolean = controller.targetHasDuplicate(applyArray);
        expect(result === false).to.be.true;
        done();
    });
});
/*

describe('queryUtility number check', function () {

    it("Should ensure apply propertys type is correct", function (done) {
        let controller = new QueryUtility();
        // APPLY ::= '[' ( '{' string ': {' APPLYTOKEN ':' key '}}' )* '],'
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

 */
