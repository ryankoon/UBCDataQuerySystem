/**
 * Created by Ryan on 11/26/2016.
 */
import {expect} from 'chai';
import CourseExplorerController from "../src/controller/CourseExplorerController";
import {QueryRequest} from "../src/controller/QueryController";


describe("CourseExplorerController", function () {

    it("Should be able to build a query", () => {
        let controller = new CourseExplorerController();
        let requestBody = '{"asdf_tree": "fdsa asdf", "asdf_mee": 1268, "asdf_three": "newval"}';
        let result: QueryRequest;
        let expectedResult: QueryRequest = {
            "GET": ["asdf_tree", "asdf_mee", "asdf_three", "asdf_dept", "asdf_id", "asdf_Section", "asdf_SectionSize"],
            "WHERE": {
                "AND": [
                    {"IS": {"asdf_tree": "fdsa asdf"}},
                    {"EQ": {"asdf_mee": 1268}},
                    {"IS": {"asdf_three": "newval"}}
                ]
            },
            "GROUP": ["asdf_tree", "asdf_mee", "asdf_three", "asdf_dept", "asdf_id", "asdf_Section",
                "asdf_SectionSize"],
            "APPLY": [],
            "AS": "TABLE"
        };

        result = controller.buildQuery(requestBody);
        expect(result).to.deep.equal(expectedResult);
    });


    it("Should be able to generate a comparator object", () => {
        let controller = new CourseExplorerController();
        let result: Object;

        result = controller.generateComparatorObject("asdf_tree", "fdsa asdf");
        expect(result).to.deep.equal({"IS": {"asdf_tree": "fdsa asdf"}});

        result = controller.generateComparatorObject("asdf_tree", 1268);
        expect(result).to.deep.equal({"EQ": {"asdf_tree": 1268}});
    });
});
