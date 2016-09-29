/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';
import {assert} from 'chai';
import fs = require('fs');

describe("DatasetController", function () {

    it("Should be able to receive a Dataset and save it", function (done) {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job' : 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setA', data);
        })
        .then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(true);
            var stat = fs.statSync('./data/setA.json');
            expect(stat.isFile()).to.equal(true);
            done();
        });
      });

    it("Should be able to receive a Dataset, save it and delete from memory", function (done) {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Robinhood': 'Superman'};
        let content2 = {'job' : 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setB', data);
        })
            .then(function (result) {
                Log.test('Dataset processed; result: ' + result);
                expect(result).to.equal(true);
                var stat = fs.statSync('./data/setB.json');
                expect(stat.isFile()).to.equal(true);
                let controller = new DatasetController();
                return controller.getDataset('setB');
            })
            .then(function (data : any) {
                Log.test('Successfully got setA');
                expect(data['item1ThatShouldExist']).to.deep.equal({'Robinhood': 'Superman'});
                expect(data['item2ThatShouldExist']).to.deep.equal({'job' : 'AtSomeCompanyIHope'});
            }).catch(function (err){
                assert.fail('Should not catch anything here: ' + err);
            })
            .then(function newInstanceofDataSetController(data){
                let controller = new DatasetController();
                return controller.getDataset('setMalfoy');
            })
            .then(function (data:any){
                expect(data).to.deep.equal(null);
            })
            .catch(function () {
                assert.fail('Fail if get returns setMalfoy');
            })
            .then(function deleteMemoryThenGet() {
                let controller = new DatasetController();
                controller.deleteDataset('setA');
                return controller.getDataset('setA');
            })
            .then(function checkMemory(data) {
                expect(data['item1ThatShouldExist']).to.deep.equal({'Batmanvs': 'Superman'});
            })
            .catch(function () {
                assert.fail('getDataSet should not fail, and instead should set memory');
            })
            .then(function assertGetDataSets(data){
                let controller = new DatasetController();
                return controller.getDatasets();
            })
            .then(function (out){
                expect(typeof out['setA']).to.equal('object');
                expect(typeof out['setB']).to.equal('object');
                done();
            })
            .catch(function () {
               assert.fail('getDataSets should not fail and should instead return memory');
                done();
            });
    });
});
