/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';
import fs = require('fs');

describe("DatasetController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to receive a Dataset and save it", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
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
        });
      });
      it('Should load the proper dataSet into memory', function () {
        Log.test('Getting dataset. ');
        let controller = new DatasetController();
        controller.getDataset('setA')
        .then(function (data : any) {
          expect(data.setA).to.equal('value');
        });
      });
      it('Should load null into memory', function () {
        Log.test('Getting null dataset');
        let controller = new DatasetController();
        controller.getDataset('salmon armpit')
        .then(function (data : any) {
          expect(data.src).to.equal(null);
        });

      });
});
