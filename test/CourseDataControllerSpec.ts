/**
 * Created by Ryan on 11/26/2016.
 */
import {expect} from 'chai';
import Log from "../src/Util";
import JSZip = require('jszip');
import CourseDataController from "../src/controller/CourseDataController";
import {IObject} from "../src/controller/IObject";
import DatasetController from "../src/controller/DatasetController";

describe("CourseDataController", function () {
    let datasetController = new DatasetController();
    let courseDataController = new CourseDataController();

    it ("Should be able to processCourseDataset to generate and save a custom one to disk", (done) => {
        after((done) => {
            datasetController.deleteDataset('testCustomCourses').then(function (result) {
                datasetController.deleteDataset('subcourses').then(function (result) {
                    done();
                });
            });
        });

        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let testCourseResults: IObject = {
                "result": [
                    {"Pass": 123, "Fail": 123, "Year": 2010},
                    {"Pass": 123, "Fail": 123, "Year": 2009},
                    {"Pass": 123, "Fail": 123, "Year": 2010},
                    {"Pass": 321, "Fail": 321, "Year": 2010},
                    {"Pass": 123, "Fail": 123, "Year": 2002},
                    {"Pass": 123, "Fail": 123, "Year": 2010},
                    {"Pass": 123, "Fail": 123, "Year": 2000},
                    {"Pass": 123, "Fail": 123, "Year": 2000},
                    {"Pass": 111, "Fail": 222, "Year": 2010}
                ]
        };

        let expectedDataset: IObject = {
            "Awesome111": {
                "result": [
                    {"Pass": 123, "Fail": 123, "Year": 2010, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 123, "Fail": 123, "Year": 2010, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 321, "Fail": 321, "Year": 2010, "SectionSize": 642, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 123, "Fail": 123, "Year": 2010, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 111, "Fail": 222, "Year": 2010, "SectionSize": 333, "Size": 642, "SectionsToSchedule": 2}
                ]
            }
        };

        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('Awesome111', JSON.stringify(testCourseResults));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return datasetController.process('testCustomCourses', data)
        })
        .then(result => {
            Log.test('Dataset processed; result: ' + result);
            expect(result === 204 || result === 201).to.be.true;

            return courseDataController.processCourseDataset("testCustomCourses");
        })
        .then(newDataset => {
           expect(newDataset).to.deep.equal(expectedDataset);
           done();
        })
        .catch(err => {
                done(err);
            })
    });

    it("Should be able to get sections in the latest year", () => {
        let courseDataController = new CourseDataController();

        let testCourseResults: IObject = {
            "AwesomeCourse": {
                "result": [
                    {"Pass": 123, "Fail": 123, "Year": 2010},
                    {"Pass": 123, "Fail": 123, "Year": 2009},
                    {"Pass": 123, "Fail": 123, "Year": 2010},
                    {"Pass": 321, "Fail": 321, "Year": 2010},
                    {"Pass": 123, "Fail": 123, "Year": 2002},
                    {"Pass": 123, "Fail": 123, "Year": 2010},
                    {"Pass": 123, "Fail": 123, "Year": 2000},
                    {"Pass": 123, "Fail": 123, "Year": 2000},
                    {"Pass": 111, "Fail": 222, "Year": 2010}
                ]
            }
        };

        let expectedResult: IObject = {
            "AwesomeCourse": {
                "result": [
                    {"Pass": 123, "Fail": 123, "Year": 2010, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 123, "Fail": 123, "Year": 2010, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 321, "Fail": 321, "Year": 2010, "SectionSize": 642, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 123, "Fail": 123, "Year": 2010, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
                    {"Pass": 111, "Fail": 222, "Year": 2010, "SectionSize": 333, "Size": 642, "SectionsToSchedule": 2}
                ]
            }
        };

        let newDataset = courseDataController.generateNewCourseDataset(testCourseResults);

        expect(newDataset).to.deep.equal(expectedResult);
    });

    it("Should be able to properly transform course results", () => {
        let courseDataController = new CourseDataController();

        let testCourseResults: IObject[] = [
            {"Pass": 123, "Fail": 123},
            {"Pass": 123, "Fail": 123},
            {"Pass": 321, "Fail": 321},
            {"Pass": 123, "Fail": 123},
            {"Pass": 111, "Fail": 222}
            ];

        let expectedResults: IObject[] = [
            {"Pass": 123, "Fail": 123, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
            {"Pass": 123, "Fail": 123, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
            {"Pass": 321, "Fail": 321, "SectionSize": 642, "Size": 642, "SectionsToSchedule": 2},
            {"Pass": 123, "Fail": 123, "SectionSize": 246, "Size": 642, "SectionsToSchedule": 2},
            {"Pass": 111, "Fail": 222, "SectionSize": 333, "Size": 642, "SectionsToSchedule": 2}
        ];

        let transformedResults = courseDataController.transformCourseResults(testCourseResults);

        expect(transformedResults).to.deep.equal(expectedResults);
    });
});