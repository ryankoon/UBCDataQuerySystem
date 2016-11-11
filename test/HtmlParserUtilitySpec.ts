/**
 * Created by alekspc on 2016-11-05.
 */
import htmlParserUtility from "../src/controller/HtmlParserUtility";
import Log from "../src/Util";
import JSZip = require('jszip');
import {expect} from 'chai';
import fs = require('fs');
import parse5 = require('parse5');
import path = require('path');
import {mainTableInfo} from "../src/controller/HtmlParserUtility";
import {roomPageTableInfo} from "../src/controller/HtmlParserUtility";
import {IRoom} from "../src/controller/IBuilding";
import {ASTNode} from 'parse5';
import {IObject} from "../src/controller/IObject";


describe("HTML Parsing Utility for Deliverable 3", () => {
    it('it initializes a list of rows and grabs the valid keys', done => {
        let html = '<html><head></head><body><table> ' +
            '<thead>' +
                '<tr>' +
                    '<th class="views-field views-field-field-building-code">TH</th> ' +
            '</tr>' +
            '</thead>' +
            ' <tbody>' +
                '<tr class="odds views-rows-first"> ' +
                    '<td class="views-field views-field-field-building-code">MP</td>' +
                '</tr>' +
                '<tr class="even views-rows-first"> ' +
                '<td class="views-field views-field-field-building-code">BP</td>' +
                '</tr>' +
            '</tbody>' +
            '</table>' +
            '</body>' +
            '</html>';
        let controller = new htmlParserUtility();
        let out = controller.generateASTNodeRows(html);
        let validOutputArray : Array<string> = [];
        controller.buildSetOfStringsFromRow(out, 'views-field views-field-field-building-code', 'class', '', validOutputArray);
        expect(validOutputArray.length == 2).to.be.true;
        expect(validOutputArray.indexOf('MP') > -1).to.be.true;
        expect(validOutputArray.indexOf('BP')>-1).to.be.true;
        done();
    });
    it('checks that it can grab items encapsulated with an anchor tag', done => {
        let html = '<html><head></head><body><table> ' +
            '<thead>' +
            '<tr>' +
            '<th class="views-field views-field-field-building-code">TH</th> ' +
            '</tr>' +
            '</thead>' +
            ' <tbody>' +
            '<tr class="odds views-rows-first"> ' +
            '<td class="views-field views-field-field-room-number"><a>MP</a></td>' +
            '</tr>' +
            '<tr class="even views-rows-first"> ' +
            '<td class="views-field views-field-field-building-code">BP</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</body>' +
            '</html>';
        let controller = new htmlParserUtility();
        let out = controller.generateASTNodeRows(html);
        let validOutputArray : Array<string> = [];
        controller.buildSetOfStringsFromRow(out, 'views-field views-field-field-room-number', 'class', 'a', validOutputArray);
        expect(validOutputArray.length == 1).to.be.true;
        expect(validOutputArray.indexOf('MP') > -1).to.be.true;
        done();
    });
    it('combines the results from the buildings page and creates the correct objects', done => {
        let controller = new htmlParserUtility();

        let addressArray: Array<string> = [];
        let codeArray: Array<string> = [];
        let buildingArray: Array<string> = [];

        addressArray = ['101 55 West Mall', 'Cornwall Ave', 'Aleks backyard'];
        codeArray = ['TBS', 'KITS', 'GWB'];
        buildingArray = ['Thunderbird Stadium', 'Old Jazz Building', 'cardboard box'];
        let out : Array<mainTableInfo> = controller.createMainTableInfoObject (addressArray, codeArray, buildingArray);

        expect(out.length === 3).to.be.true;

        expect(out[0].code === 'TBS').to.be.true;
        expect(out[0].buildingName === 'Thunderbird Stadium').to.be.true;
        expect(out[0].address === '101 55 West Mall').to.be.true;

        expect(out[1].code === 'KITS').to.be.true;
        expect(out[1].buildingName === 'Old Jazz Building').to.be.true;
        expect(out[1].address === 'Cornwall Ave').to.be.true;

        expect(out[2].code === 'GWB').to.be.true;
        expect(out[2].buildingName === 'cardboard box').to.be.true;
        expect(out[2].address === 'Aleks backyard').to.be.true;
        done();
    });
    it('collapses a report of rooms together into a series of objects and fails to gen array', done => {
        let html = '<html><head></head><body><table> ' +
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
        let controller = new htmlParserUtility();
        let nodeList : Array<ASTNode> = controller.generateASTNodeRows(html);

        let mainTableInfo : mainTableInfo= {
            address : 'some_address',
            code : 'DMP',
            buildingName : 'somewhere'
        };
        let currentRoomsValues : Array<roomPageTableInfo> =  controller.generateTempRoomPageTableInfoArray(nodeList);
        let temp : mainTableInfo;
        temp = {
            address : '123',
            code : 'DMP',
            buildingName : 'abc'
        }
        let fail : mainTableInfo;
        fail =  {
            address : '213',
            code :'123',
            buildingName : '1231'
        }
        let out = controller.generateIRoomArray(temp, currentRoomsValues);
        out.then(data => {
        }).catch(err => {
            expect(err.length > 1).to.be.true;
        });
        console.log(out);
        done();
    });
    it('forcefail with invalid address', done => {
        let html = '<html><head></head><body><table> ' +
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
        let controller = new htmlParserUtility();
        let nodeList : Array<ASTNode> = controller.generateASTNodeRows(html);

        let mainTableInfo : mainTableInfo= {
            address : null,
            code : null,
            buildingName : null
        };
        let currentRoomsValues : Array<roomPageTableInfo> =  controller.generateTempRoomPageTableInfoArray(nodeList);
        let temp : mainTableInfo;
        let fail : mainTableInfo;
        fail =  {
            address : null,
            code :null,
            buildingName : null
        }
        let out = controller.generateIRoomArray(fail, currentRoomsValues);
        out.then(data => {
        }).catch(err => {
            expect(err.length > 1).to.be.true;
        });
        console.log(out);
        done();
    });
    it('successfully creates valid file paths', done => {
//            let validFilePaths  : Array<string>= this.readValidBuildingHtml(validCodeArray, zipObject);
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('campus/discover/buildings-and-classrooms/LUKE', JSON.stringify(content0));
        zip.file('campus/discover/buildings-and-classrooms/C3P0', JSON.stringify(content1));
        zip.file('campus/discover/buildings-and-classrooms/R2D2', JSON.stringify(content2));
        let validCodeArray : Array<string> = ['LUKE', 'C3P0', 'R2D2'];
        let controller = new htmlParserUtility();
        let out = controller.readValidBuildingHtml(validCodeArray, zip);
        expect(out.length === 3).to.be.true;
        done();
    });

    it("Should be able to concatenate Objects", done => {
        let util = new htmlParserUtility();
        let objects: IObject[] = [];
        let object: IObject;

        object = {
            "a": "aa"
        };
        objects.push(object);

        object = {
            "b": 123
        };
        objects.push(object);

        object = {
            "c_de": "cde"
        };
        objects.push(object);

        let expectedResult: IObject = {
            "a": "aa",
            "b": 123,
            "c_de": "cde"
        }


        let result: IObject = util.concatenateObjects(objects);
        expect(result).to.be.deep.equal(expectedResult);
        done();
    });

    it("Should be able to get building code from file path", done => {
        let util = new htmlParserUtility();
        let filePath = "campus/discover/buildings-and-classrooms/AUDI";
        let result = util.getBuildingCodeFromFilePath(filePath);

        expect(result).to.be.equal("AUDI");
        done();
    });
    it("Should construct room objects", done => {
        let html = '<html><head></head><body><table> ' +
            '<thead>' +
            '<tr>' +
            '<th class="views-field views-field-field-building-code">TH</th> ' +
            '</tr>' +
            '</thead>' +
            ' <tbody>' +
            '<tr class="odds views-rows-first"> ' +
                '<td class="views-field views-field-field-room-code"><a>C3P0</a></td>' +
            '</tr>' +
            '<tr class="even views-rows-first"> ' +
                '<td class="views-field views-field-field-building-code">LUKE</td>' +
            '</tr>' +
            '<tr class="odd views-rows-first"> ' +
                '<td class="views-field views-field-field-building-code">R2D2</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</body>' +
            '</html>';
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('campus/discover/buildings-and-classrooms/LUKE', JSON.stringify(content0));
        zip.file('campus/discover/buildings-and-classrooms/C3P0', JSON.stringify(content1));
        zip.file('campus/discover/buildings-and-classrooms/R2D2', JSON.stringify(content2));
        let controller = new htmlParserUtility();
        controller.intializeHtmlDataStorage(html, zip).then(data => {
            let keys = Object.keys(data);
            expect(keys.indexOf('LUKE') > -1).to.be.true;
            expect(keys.indexOf('R2D2') > -1).to.be.true;
            done();
        });
    });
});
