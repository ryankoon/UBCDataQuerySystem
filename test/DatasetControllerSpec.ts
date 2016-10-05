/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';
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
        var controller = new DatasetController();;


        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setA', data)
        })
        .then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(204);
        }).then(function () {
                return zip.generateAsync(opts).then(function (data) {
                    Log.test('Dataset created');
                    return controller.process('setA', data);
                });
        }).then(function (result) {
            expect(result).to.equal(201);
                done();
        });

    });
    it('should not return the proper dataset', function () {
        let controller = new DatasetController();
        controller.getDataset('setMalfoy')
        .then(function(data:any) {
           expect(data).to.deep.equal(null);
        });
    });

    it('Should be able to getdatasets from memory', function (done) {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job' : 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));
        var controller = new DatasetController();;


        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setB', data)
        })
            .then(function (result) {
                Log.test('Dataset processed; result: ' + result);
                expect(result).to.equal(204);
            }).then(function () {
                return zip.generateAsync(opts).then(function (data) {
                    Log.test('Dataset created');
                    return controller.process('setC', data);
                })
            }).then(function() {
                return controller.getDatasets();
            }).then(function (out){
                expect(out['setB']).to.be.instanceOf(Object);
                expect(out['setC']).to.be.instanceOf(Object);
                done();
            }).catch(function (err){
               Log.error(err);
            });
    });
    it('Should be able to getdataset (singular)', function (done) {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job' : 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));
        var controller = new DatasetController();;


        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function() {
                return controller.getDataset('setD');
            }).then(function (out){
                expect(out['item1ThatShouldExist']).to.be.instanceOf(Object);
                expect(out['item2ThatShouldExist']).to.be.instanceOf(Object);
                done();
            }).catch(function (err){
                Log.error(err);
            });
    });
    it('should get null from non-existant dataset', function (done) {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job' : 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));
        var controller = new DatasetController();


        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function() {
            return controller.getDataset('malfoy');
        }).then(function (out){
            expect(out).to.equal(null);
            done();
        }).catch(function (err){
            Log.error(err);
        });
    });
});
