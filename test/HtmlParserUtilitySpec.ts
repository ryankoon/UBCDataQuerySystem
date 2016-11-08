/**
 * Created by alekspc on 2016-11-05.
 */
import htmlParserUtility from "../src/controller/HtmlParserUtility";
import Log from "../src/Util";
import JSZip = require('jszip');
import {expect} from 'chai';
import fs = require('fs');
import testGlobals from '../test/TestGlobals';
import {Datasets} from "../src/controller/DatasetController";
import parse5 = require('parse5');
import path = require('path');

describe("HTML Parsing Utility for Deliverable 3", () => {

    it("Determines a list of valid buildings", (done) => {
        fs.readFile('./mock-data/mocks.txt',(err, data) => {
            if (err) {
                Log.test('uhoh mock data error : ' + err);
            }
            let controller = new htmlParserUtility();
            let out = controller.determineValidBuildingList(data.toString());
            expect(out.length === 74).to.be.true;
            done();
        });
    });
});