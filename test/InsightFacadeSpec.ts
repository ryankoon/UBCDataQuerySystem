/**
 * Created by alekhrycaiko on 2016-10-15.
 */

import InsightFacade from '../src/controller/InsightFacade'
import Log from "../src/Util";
import JSZip = require('jszip');
import {expect} from 'chai';
import {QueryRequest} from "../src/controller/QueryController";


describe('InsightFacade', () => {
    after((done) => {
        InsightFacadeController.removeDataset('testingFacade').then(function (result){
            expect(result.code === 204).to.be.true;
            done();
        });
    });
    let InsightFacadeController = new InsightFacade();
    it('addDataSet success!', (done) => {
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            return InsightFacadeController.addDataset('testingFacade', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result.code === 204).to.be.true;
            expect(result.body.message === 'Success!').to.be.true;
        }).then(function () {
            return zip.generateAsync(opts).then(function (data) {
                Log.test('Dataset created');
                return InsightFacadeController.addDataset('testingFacade', data);
            });
        }).then(function(result){
            Log.test('Entering 201 check in InsightFacade addDataset');
            expect(result.code === 201).to.be.true;
            expect(result.body.message === 'Success!').to.be.true;
            done()
        }).catch(function (err){
            Log.test('InsightFacade : ' + err);
            done();
        });
    });
    it('removeDataSet success', (done) => {
        InsightFacadeController.removeDataset('testingFacade').then(function (result){
            expect(result.code === 204).to.be.true;
            done();
        });
    });
    it('removeDataSet fail', (done) => {
        InsightFacadeController.removeDataset('testingFacade').then(function (result) {
            expect(() => {
                expect(false).to.be.true;
            }).to.throw();
            done(new Error("Removing dataset did not return an error."));
        }).catch((result) => {
            expect(result.code === 404).to.be.true;
            done();
        });
    });
    it('processQuery cant filter bc not put', (done) => {
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
        InsightFacadeController.performQuery(query).then(function(result) {
            expect(false).to.be.true;
            done();
        }).catch(function (result) {
            expect(result.code === 424).to.be.true;
            done();
        });
    });
    it('processQuery fail filter', (done) => {
        let failQuery: QueryRequest = {
            "GET": ["asdf_avg", "asdf_instructor"],
            "WHERE": {
                "AND" : []
            },
            "ORDER": "asdf_instructor",
            "AS": "TABLE"
        };
        InsightFacadeController.performQuery(failQuery).then(function(result) {
            expect(false).to.be.true;
            done();
        }).catch(function (result) {
            expect(result.code === 400).to.be.true;
            expect(result.body.error).to.not.be.null;
            done();
        });
    });
    it('processQuery successful add, filter', (done) => {
        after((done) => {
                InsightFacadeController.removeDataset('asdf').then(function (result){
                    expect(result.code === 204).to.be.true;
                    done();
                });
        });
        let content0 = {
            "asdf1234": {
                "result": [{"Avg": 70, "Professor": "Elmo"}, {
                    "Avg": 110,
                    "Professor": "Bond, James"
                }, {"Avg": 21, "Professor": "Vader, Darth"}, {"Avg": 87, "Professor": "E.T."}, {
                    "Avg": 37,
                    "Professor": "Bond, James"
                }, {"Avg": 12, "Professor": "Gollum"}], "rank": 7
            }
        };
        let content1Identical = {
            "asdf": {
                "result": [{"Avg": 70, "Professor": "Elmo"}, {
                    "Avg": 110,
                    "Professor": "Bond, James"
                }, {"Avg": 21, "Professor": "Vader, Darth"}, {"Avg": 87, "Professor": "E.T."}, {
                    "Avg": 37,
                    "Professor": "Bond, James"
                }, {"Avg": 12, "Professor": "Gollum"}], "rank": 7
            }
        };
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('ourfile', JSON.stringify(content1Identical));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            return InsightFacadeController.addDataset('asdf', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            let query: QueryRequest = {
                "GET": ["asdf_avg", "asdf_instructor"],
                "WHERE": {
                    "AND": [{
                        "NOT": {
                            "IS": {"asdf_instructor": "Bond, James"}
                        }
                    },
                        {
                            "OR": [
                                {"GT": {"asdf_avg": 30}},
                                {"IS": {"asdf_instructor": "Vader, Darth"}}
                            ]
                        }]
                },
                "ORDER": "asdf_instructor",
                "AS": "TABLE"
            }
            InsightFacadeController.performQuery(query).then(function (result) {
                expect(result.code === 200);
                expect(result.body.render === "TABLE");
                done();
            }).catch(function (err) {
                expect(false).to.be.true;
                done();
            });
        });
    });
    it('processQuery invalid query', (done) => {
        let failQuery: any = {
            "GET": ["asdf_avg", "asdf_instructor"],
            "AS": "TABLE"
        };
        InsightFacadeController.performQuery(failQuery).then(function(result) {
            expect(false).to.be.true;
            done();
        }).catch(function (result) {
            expect(result.code === 400).to.be.true;
            Log.test(result.body.error.message);
            expect(result.body.error.length > 0).to.be.true;
            done();
        });
    });

    it('addDataSet fail!', (done) => {
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            return InsightFacadeController.addDataset('#()$*&@#)(^@#)(*&@#', data);
        }).then( function() {
            Log.test("DONE");
            InsightFacadeController.removeDataset('#()$*&@#)(^@#)(*&@#');
            done();
        }).catch(function (err){
            Log.test('InsightFacade : ' + err);
            InsightFacadeController.removeDataset('#()$*&@#)(^@#)(*&@#');
            done();
        });
    });

    it('addDataSet html success!', (done) => {

        let roomHtml = '<html><head></head><body><table> ' +
            '<thead>' +
            '<tr>' +
            '<th class="views-field views-field-field-building-code">TH</th> ' +
            '</tr>' +
            '</thead>' +
            ' <tbody>' +
            '<tr class="odds views-rows-first"> ' +
            '<td class="views-field views-field-field-room-number"><a>201</a></td>' +
            '<td class="views-field views-field-field-room-capacity">13</td>' +
            '<td class="views-field views-field-field-room-furniture">someFurntype</td>' +
            '<td class="views-field views-field-field-room-type">someRoomType</td>' +
            '</tr>' +
            '<tr class="evens views-rows-first"> ' +
            '<td class="views-field views-field-field-room-number"><a>201</a></td>' +
            '<td class="views-field views-field-field-room-capacity">3</td>' +
            '<td class="views-field views-field-field-room-furniture">anotherFurntype</td>' +
            '<td class="views-field views-field-field-room-type">anotherRoomType</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</body>' +
            '</html>';
        let campusFIle = {'campus/discovery/buildings-and-classrooms/WOOD' : roomHtml };

        let zip = new JSZip();
        let html = '<html><head></head><body><table> ' +
            '<thead>' +
            '<tr>' +
            '<th class="views-field views-field-field-building-code">TH</th> ' +
            '</tr>' +
            '</thead>' +
            ' <tbody>' +
            '<tr class="odds views-rows-first"> ' +
            '<td class="views-field views-field-field-building-code">DMP</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</body>' +
            '</html>';
        zip.file('index.htm', html);
        zip.file('campus/discovery/buildings-and-classrooms/DMP', roomHtml);
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            return InsightFacadeController.addDataset('testingFacade', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result.code === 204).to.be.true;
            expect(result.body.message === 'Success!').to.be.true;
            done();
        }).catch(function (err){
            Log.test('InsightFacade : ' + err);

            done();
        });
    });

    it("424 for dataset not been PUT.", function(done) {
        after((done) => {
            InsightFacadeController.removeDataset('asdf1111').then(function (result){
                expect(result.code === 204).to.be.true;
                done();
            });
        });
        let content1111 = {
            "asdf1111": {
                "result": [{"Avg": 70, "Professor": "Elmo"}, {
                    "Avg": 110,
                    "Professor": "Bond, James"
                }, {"Avg": 21, "Professor": "Vader, Darth"}, {"Avg": 87, "Professor": "E.T."}, {
                    "Avg": 37,
                    "Professor": "Bond, James"
                }, {"Avg": 12, "Professor": "Gollum"}], "rank": 7
            }
        };
        let content2222 = {
            "asdf2222": {
                "result": [{"Avg": 70, "Professor": "Elmo"}, {
                    "Avg": 110,
                    "Professor": "Bond, James"
                }, {"Avg": 21, "Professor": "Vader, Darth"}, {"Avg": 87, "Professor": "E.T."}, {
                    "Avg": 37,
                    "Professor": "Bond, James"
                }, {"Avg": 12, "Professor": "Gollum"}], "rank": 7
            }
        };
        let zip = new JSZip();
        zip.file('asdf1111', JSON.stringify(content1111));
        zip.file('asdf2222', JSON.stringify(content2222));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            return InsightFacadeController.addDataset('asdf1111', data);
        }).then((result) => {
            Log.test('Dataset processed; result: ' + result);
            let query: QueryRequest = {
                "GET": ["asdf1111_avg", "asdf1111_instructor"],
                "WHERE": {
                    "AND": [{
                        "NOT": {
                            "IS": {"asdf3333_instructor": "Bond, James"}
                        }
                    },
                        {
                            "OR": [
                                {"GT": {"asdf1111_avg": 30}},
                                {"IS": {"asdf1111_instructor": "Vader, Darth"}}
                            ]
                        }]
                },
                "ORDER": "asdf1111_instructor",
                "AS": "TABLE"
            };
            InsightFacadeController.performQuery(query).then((result) => {
                expect(() => {
                    expect(false).to.be.true;
                }).to.throw();
                done(new Error("Query did not return an error."));
            }).catch((err) =>{
                expect(() => {
                expect(result.code).to.be.equal(424);
                }).to.throw();
                done(new Error("Expected a 424. Actual: " + result.code));
            });
        }).catch(err => {
            Log.test("unexpected error in test: 424 for dataset not been PUT.");
            done(err);
        });
    });

    it("400 for multiple datasets in query that have been PUT.", function(done) {
        after((done) => {
            InsightFacadeController.removeDataset('asdf1234').then(function (result){
                expect(result.code === 204).to.be.true;
                InsightFacadeController.removeDataset('asdf2222').then(function (result){
                    expect(result.code === 204).to.be.true;
                    done();
                });
            });
        });
        let content1111 = {
            "asdf1234": {
                "result": [{"Avg": 70, "Professor": "Elmo"}, {
                    "Avg": 110,
                    "Professor": "Bond, James"
                }, {"Avg": 21, "Professor": "Vader, Darth"}, {"Avg": 87, "Professor": "E.T."}, {
                    "Avg": 37,
                    "Professor": "Bond, James"
                }, {"Avg": 12, "Professor": "Gollum"}], "rank": 7
            }
        };
        let content2222 = {
            "asdf2222": {
                "result": [{"Avg": 70, "Professor": "Elmo"}, {
                    "Avg": 110,
                    "Professor": "Bond, James"
                }, {"Avg": 21, "Professor": "Vader, Darth"}, {"Avg": 87, "Professor": "E.T."}, {
                    "Avg": 37,
                    "Professor": "Bond, James"
                }, {"Avg": 12, "Professor": "Gollum"}], "rank": 7
            }
        };
        let zip = new JSZip();
        zip.file('asdf1234', JSON.stringify(content1111));
        zip.file('asdf2222', JSON.stringify(content2222));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            return InsightFacadeController.addDataset('asdf1234', data);
        }).then((result) => {
            let zip2 = new JSZip();
            zip2.file('asdf1234', JSON.stringify(content1111));
            zip2.file('asdf2222', JSON.stringify(content2222));
            return zip2.generateAsync(opts).then((data) => {
                return InsightFacadeController.addDataset('asdf2222', data);
            }).then((result) => {
                Log.test('Dataset processed; result: ' + result);
                let query: QueryRequest = {
                    "GET": ["asdf1234_avg", "asdf1234_instructor"],
                    "WHERE": {
                        "AND": [{
                            "NOT": {
                                "IS": {"asdf2222_instructor": "Bond, James"}
                            }
                        },
                            {
                                "OR": [
                                    {"GT": {"asdf1234_avg": 30}},
                                    {"IS": {"asdf1234_instructor": "Vader, Darth"}}
                                ]
                            }]
                    },
                    "ORDER": "asdf1234_instructor",
                    "AS": "TABLE"
                };
                InsightFacadeController.performQuery(query).then((result) => {
                    expect(() => {
                        expect(false).to.be.true;
                    }).to.throw();
                    done(new Error("Query did not return an error."));
                    done(result);
                }).catch((err) => {
                    expect(err.code === 400).to.be.true;
                    done();
                });
            });
        }).catch(err => {
            Log.test("unexpected error in test: 400 for multiple datasets in query that have been PUT.");
            done(err);
        });
    });
});
