/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";
import JSZip = require('jszip');
import {expect} from 'chai';
import fs = require('fs');
import testGlobals from '../test/TestGlobals';

describe("DatasetController", function () {
    let controller = new DatasetController();
    it("Should be able to receive a Dataset and save it", (done) =>  {
        Log.test('Creating dataset');
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
            Log.test('Dataset created');
            return controller.process('setA', data)
        })
            .then(function (result) {
                Log.test('Dataset processed; result: ' + result);
                expect(result === 204).to.be.true;
            }).then(function () {
                return zip.generateAsync(opts).then(function (data) {
                    Log.test('Dataset created');
                    return controller.process('setA', data);
                });
            }).then(function (result) {
                expect(result === 201).to.be.true;
                done();
            });

    });
    it('should not return the proper dataset', function () {
        controller.getDataset('setMalfoy')
            .then(function (data: any) {
                expect(data).to.deep.equal(null);
            });
    });

    it('Should be able to getdatasets from memory', (done) => {
        Log.test('Creating dataset');
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
            Log.test('Dataset created');
            return controller.process('setB', data)
        })
            .then(function (result) {
                Log.test('Dataset processed; result: ' + result);
                expect(result === 204).to.be.true;
            }).then(function () {
                return zip.generateAsync(opts).then(function (data) {
                    Log.test('Dataset created');
                    return controller.process('setC', data);
                })
            }).then(function () {
                return controller.getDatasets();
            }).then(function (out) {
                expect(out['setB']).to.be.instanceOf(Object);
                expect(out['setC']).to.be.instanceOf(Object);
                done();
            });
    });
    it('Should be able to getdataset (singular)', (done) => {
        Log.test('Creating dataset');
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
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function () {
            return controller.getDataset('setD');
        }).then(function (out) {
            expect(out['item1ThatShouldExist']).to.be.instanceOf(Object);
            expect(out['item2ThatShouldExist']).to.be.instanceOf(Object);
            done();
        });
    });
    it('should get null from non-existant dataset', (done) => {
        Log.test('Creating dataset');
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
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function () {
            return controller.getDataset('malfoy');
        }).then(function (out) {
            expect(out).to.equal(null);
            done();
        });
    });
    it('should get data from file and return a 201', (done) => {
        let content0 = {'NewData': 'SomeData'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('item2ThatShouldExist', JSON.stringify(content2));
        zip.file('SomerandomfilenotNamedHankHill', JSON.stringify(content0));
        var controller = new DatasetController();

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function (result) {
            expect(result === 201).to.be.true;
            done();
        });
    });
    it('should delete setA', (done) => {
        controller.deleteDataset('setA')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    });
    it('should delete setB', (done)  => {
        controller.deleteDataset('setB')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    }); it('should delete setC', (done) => {
        controller.deleteDataset('setC')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    }); it('should delete setD', (done) => {
        controller.deleteDataset('setD')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    });
    it ('should fail to delete setA', (done) => {
        controller.deleteDataset('setA')
            .then(function forceFail() {
                expect(true).to.not.be.true;
            })
            .catch(function (resultObj){
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
    it ('should fail to delete setB', (done) => {
        controller.deleteDataset('setB')
            .then(function forceFail() {
                expect(true).to.not.be.true;

            })
            .catch(function (resultObj){
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
    it ('should fail to delete setC', (done) => {
        controller.deleteDataset('setC')
            .then(function forceFail(resultObj) {
                expect(true).to.not.be.true;
            })
            .catch(function (resultObj) {
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
    it ('should fail to delete setD', (done) => {
        controller.deleteDataset('setD')
            .then(function () {
                expect(true).to.not.be.true;
            })
            .catch(function (resultObj){
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
});
