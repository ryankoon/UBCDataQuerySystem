/**
 * Created by Ryan on 11/26/2016.
 */
import {expect} from 'chai';
import ExplorerController from "../src/controller/ExplorerController";
import {QueryRequest} from "../src/controller/QueryController";
import {distanceRequestBody} from "../src/controller/ExplorerController";
import {IRoom} from "../src/controller/IBuilding";


describe("ExplorerController", function () {

    it("Should be able to build a query for courses", () => {
        let controller = new ExplorerController();
        let requestBody = '{"asdf_tree": "fdsa asdf", "asdf_mee": 1268, "asdf_three": "newval"}';
        let result: QueryRequest;
        let expectedResult: QueryRequest = {
            "GET": ["asdf_uuid", "asdf_dept", "asdf_id", "asdf_Section", "asdf_SectionSize", "asdf_SectionsToSchedule",
                "asdf_tree", "asdf_mee", "asdf_three"],
            "WHERE": {
                "AND": [
                    {"IS": {"asdf_tree": "fdsa asdf"}},
                    {"EQ": {"asdf_mee": 1268}},
                    {"IS": {"asdf_three": "newval"}}
                ]
            },
            "GROUP": ["asdf_uuid", "asdf_dept", "asdf_id", "asdf_Section", "asdf_SectionSize", "asdf_SectionsToSchedule",
                "asdf_tree", "asdf_mee",
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

    it("Should be able to build a query for rooms with distance", () => {
        let controller = new ExplorerController();
        let reqBody = {
            rooms_fullname: "Biological Sciences",
            rooms_seats: 100,
            rooms_lat: 49.26479,
            rooms_lon: -123.25249,
            rooms_distance: 0
        };

        let rooms: IRoom[] = [{
            "fullname": "asdf",
            "shortname": "ASDF",
            "number": "1503",
            "name": "ASDF_1503",
            "address": "6270 University Boulevard",
            "lat": 49.26479,
            "lon": -123.25249,
            "seats": 16,
            "type": "Small Group",
            "furniture": "Classroom-Movable Tables & Chairs",
            "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ASDF-1503"
        },
            {
                "fullname": "fdsa",
                "shortname": "FDSA",
                "number": "1503",
                "name": "FDSA_1503",
                "address": "6270 University Boulevard",
                "lat": 49.26479,
                "lon": -123.25249,
                "seats": 16,
                "type": "Small Group",
                "furniture": "Classroom-Movable Tables & Chairs",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FDSA-1503"
            },
            {
                "fullname": "qwe",
                "shortname": "QWE",
                "number": "1503",
                "name": "QWE_1503",
                "address": "6270 University Boulevard",
                "lat": 49.26479,
                "lon": -123.25249,
                "seats": 16,
                "type": "Small Group",
                "furniture": "Classroom-Movable Tables & Chairs",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/QWE-1503"
            }];

        let newreqbody = {
            rooms_fullname: "Biological Sciences",
            rooms_seats: 101
        };
        let reqstr = JSON.stringify(newreqbody);
        let expectedRequest: distanceRequestBody = {
            newReqString: reqstr,
            buildingNames: {"rooms_shortname": ["ASDF", "FDSA", "QWE"]}
        }
        let transformedRequest = controller.transformRequestBody(reqBody, rooms);

        expect(transformedRequest).to.deep.equal(expectedRequest);
    });

    it("Should build a query without latlon", () => {
        let controller = new ExplorerController();
        let result: QueryRequest;


        let reqbody = '{"rooms_fullname":"Biological Sciences","rooms_type":"Tiered Large Group","rooms_seats":"500",' +
            '"rooms_lat":"49.26479","rooms_lon":"-123.25249"}';
        let expectedQuery: QueryRequest = {
            "GET":["rooms_name","rooms_seats","rooms_fullname","rooms_type"],
            "WHERE": {
                "AND":[
                    {"IS":{"rooms_fullname":"Biological Sciences"}},
                    {"IS":{"rooms_type":"Tiered Large Group"}},
                    {"LT":{"rooms_seats":501}}
                    ]
            },
            "GROUP":["rooms_name","rooms_seats","rooms_fullname","rooms_type"],
            "APPLY":[],
            "AS":"TABLE"};

        result = controller.buildQuery(reqbody, "rooms", "AND", null, "LT");
        expect(result).to.deep.equal(expectedQuery);
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
