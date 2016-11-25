/**
 * Created by Ryan on 11/23/2016.
 */
import DataController from "../src/controller/DataController";
import {expect} from 'chai';
import Log from "../src/Util";

describe("DataController", function () {

    it("Should successfully make google distance request with a response", (done) => {
        let controller = new DataController();

        let fromArray = [{"lat": 49.2699, "lon": -123.25318}];
        let toArray = [{"lat": 49.26479, "lon": -123.25249},
            {"lat": 49.26958, "lon": -123.25741}];

        controller.makeGDistanceRequest(fromArray, toArray, 'walking')
            .then((result) => {
                console.log(result);
                expect(result).to.not.be.null;
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
    });

    it("Should successfully determine that all rooms are nearby", (done) => {
        let controller = new DataController();
        let from = {
            "lat": 49.2699,
            "lon": -123.25318
        };
        let rooms = [
            {
                "fullname": "Biological Sciences",
                "shortname": "BIOL",
                "number": "1503",
                "name": "BIOL_1503",
                "address": "6270 University Boulevard",
                "lat": 49.26479,
                "lon": -123.25249,
                "seats": 16,
                "type": "Small Group",
                "furniture": "Classroom-Movable Tables & Chairs",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BIOL-1503"
            },
            {
                "fullname": "Brock Hall Annex",
                "shortname": "BRKX",
                "number": "2365",
                "name": "BRKX_2365",
                "address": "1874 East Mall",
                "lat": 49.26862,
                "lon": -123.25237,
                "seats": 70,
                "type": "Tiered Large Group",
                "furniture": "Classroom-Fixed Tables/Movable Chairs",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BRKX-2365"
            },
            {
                "fullname": "Buchanan",
                "shortname": "BUCH",
                "number": "A101",
                "name": "BUCH_A101",
                "address": "1866 Main Mall",
                "lat": 49.26826,
                "lon": -123.25468,
                "seats": 275,
                "type": "Tiered Large Group",
                "furniture": "Classroom-Fixed Tablets",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A101"
            },
            {
                "fullname": "Irving K Barber Learning Centre",
                "shortname": "IBLC",
                "number": "261",
                "name": "IBLC_261",
                "address": "1961 East Mall V6T 1Z1",
                "lat": 49.26766,
                "lon": -123.2521,
                "seats": 112,
                "type": "Open Design General Purpose",
                "furniture": "Classroom-Movable Tables & Chairs",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-261"
            },
            {
                "fullname": "Pharmaceutical Sciences Building",
                "shortname": "PHRM",
                "number": "3112",
                "name": "PHRM_3112",
                "address": "2405 Wesbrook Mall",
                "lat": 49.26229,
                "lon": -123.24342,
                "seats": null,
                "type": "Small Group",
                "furniture": "Classroom-Movable Tables & Chairs",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3112"
            },
            {
                "fullname": "Woodward (Instructional Resources Centre-IRC)",
                "shortname": "WOOD",
                "number": "6",
                "name": "WOOD_6",
                "address": "2194 Health Sciences Mall",
                "lat": 49.26478,
                "lon": -123.24673,
                "seats": 181,
                "type": "Tiered Large Group",
                "furniture": "Classroom-Fixed Tablets",
                "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-6"
            }
        ];

        controller.roomsWithinDistance(from, rooms, 10, 'walking')
            .then((result) => {
                expect(result).to.deep.equal(rooms);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

});

