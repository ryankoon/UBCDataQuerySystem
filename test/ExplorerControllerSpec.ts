/**
 * Created by Ryan on 11/26/2016.
 */
import {expect} from 'chai';
import ExplorerController from "../src/controller/ExplorerController";
import {QueryRequest} from "../src/controller/QueryController";


describe("ExplorerController", function () {

    it("Should be able to build a query for courses", () => {
        let controller = new ExplorerController();
        let requestBody = '{"asdf_tree": "fdsa asdf", "asdf_mee": 1268, "asdf_three": "newval"}';
        let result: QueryRequest;
        let expectedResult: QueryRequest = {
            "GET": ["asdf_dept", "asdf_id", "asdf_Section", "asdf_SectionSize", "asdf_tree", "asdf_mee", "asdf_three"],
            "WHERE": {
                "AND": [
                    {"IS": {"asdf_tree": "fdsa asdf"}},
                    {"EQ": {"asdf_mee": 1268}},
                    {"IS": {"asdf_three": "newval"}}
                ]
            },
            "GROUP": ["asdf_dept", "asdf_id", "asdf_Section", "asdf_SectionSize", "asdf_tree", "asdf_mee",
                "asdf_three"],
            "APPLY": [],
            "AS": "TABLE"
        };

        result = controller.buildQuery(requestBody, "courses", "AND");
        expect(result).to.deep.equal(expectedResult);
    });

    it("Should be able to build a query for rooms", () => {
        let controller = new ExplorerController();
        let requestBody = '{"asdf_tree": "fdsa asdf", "asdf_mee": 1268, "asdf_three": "newval"}';
        let result: QueryRequest;
        let expectedResult: QueryRequest = {
            "GET": ["asdf_name", "asdf_seats", "asdf_tree", "asdf_mee", "asdf_three"],
            "WHERE": {
                "AND": [
                    {"IS": {"asdf_tree": "fdsa asdf"}},
                    {"EQ": {"asdf_mee": 1268}},
                    {"IS": {"asdf_three": "newval"}}
                ]
            },
            "GROUP": ["asdf_name", "asdf_seats", "asdf_tree", "asdf_mee", "asdf_three"],
            "APPLY": [],
            "AS": "TABLE"
        };

        result = controller.buildQuery(requestBody, "rooms", "AND");
        expect(result).to.deep.equal(expectedResult);
    });

    it("Should be able to generate a comparator object", () => {
        let controller = new ExplorerController();
        let result: Object;

        result = controller.generateComparatorObject("asdf_tree", "fdsa asdf");
        expect(result).to.deep.equal({"IS": {"asdf_tree": "fdsa asdf"}});

        result = controller.generateComparatorObject("asdf_tree", 1268);
        expect(result).to.deep.equal({"EQ": {"asdf_tree": 1268}});

        result = controller.generateComparatorObject("asdf_tree", "123");
        expect(result).to.deep.equal({"EQ": {"asdf_tree": 123}});

        result = controller.generateComparatorObject("asdf_tree", "fdsa 123");
        expect(result).to.deep.equal({"IS": {"asdf_tree": "fdsa 123"}});

        result = controller.generateComparatorObject("asdf_tree", "-1234.5");
        expect(result).to.deep.equal({"EQ": {"asdf_tree": -1234.5}});

        result = controller.generateComparatorObject("asdf_tree", "1234asdf");
        expect(result).to.deep.equal({"IS": {"asdf_tree": "1234asdf"}});

        result = controller.generateComparatorObject("asdf_tree", "-1234.5asdf");
        expect(result).to.deep.equal({"IS": {"asdf_tree": "-1234.5asdf"}});
    });
});
