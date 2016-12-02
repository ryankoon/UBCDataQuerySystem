/**
 * Created by alekhrycaiko on 2016-10-20.
 */
import QueryController from "../src/controller/QueryUtility";
import QueryUtility from "../src/controller/QueryUtility";
import Log from "../src/Util";
import {expect} from 'chai';
import {IApplyObject} from "../src/controller/IEBNF";

describe('QueryUtility', function () {
    it("Should return true if APPLY does have two targets with the same name", (done) => {
        let controller = new QueryUtility();
        let applyArray: IApplyObject[] = [ {"courseAverage": {"AVG": "courses_avg"}}, {"courseAverage": {"MAX": "courses_fail"}} ];
        let result: boolean = controller.targetHasDuplicate(applyArray);
        expect(result).to.be.true;
        done();
    });
    it("Should return false if APPLY has two targets without the same name", (done) => {
        let controller = new QueryUtility();
        let applyArray: IApplyObject[] = [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ];
        let result: boolean = controller.targetHasDuplicate(applyArray);
        expect(result).to.be.false;
        done();
    });
});
