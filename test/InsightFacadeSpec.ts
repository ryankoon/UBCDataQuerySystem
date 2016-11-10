/**
 * Created by alekhrycaiko on 2016-10-15.
 */

import InsightFacade from '../src/controller/InsightFacade'
import Log from "../src/Util";
import JSZip = require('jszip');
import {expect} from 'chai';
import {QueryRequest} from "../src/controller/QueryController";


describe('InsightFacade', () => {

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
            expect(false).to.be.true;
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
            expect(result.body.error.message.length > 0).to.be.true;
            done();
        });
    });
    it('processQuery successful add, filter', (done) => {
        after((done) => {
                InsightFacadeController.removeDataset('asdf').then(function (result){
                    expect(result.code === 204).to.be.true;
                    done();
                });
        })
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
            })
        })
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
});