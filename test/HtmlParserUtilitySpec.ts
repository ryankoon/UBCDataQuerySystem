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

    it("parses the html string and obtains the fullname of the buildings", (done) => {

        var html =
            '<html><head></head><body id="main" class = "werwerwerwerwerwer" >' +
                '<div class = "view view-buildings-and-classrooms view-id-buildings_and_classrooms view_somerandombvuivlrdeing_sdf3f23f"' +
                    '</div>' +
            '</body></html>';
        let out = parse5.parse(html, {treeAdapter: parse5.treeAdapters.default});
        console.log(out);
        done();
    });
    it("Determines a list of valid buildings", (done) => {
      var html =  '<div id="main" class = "werwerwerwerwerwer" >' +
        '<div class = "view view-buildings-and-classrooms view-id-buildings_and_classrooms view_somerandombvuivlrdeing_sdf3f23f"' +
        'div class = "view-content">' +
        '<table class = "view-table col-5 table">' +
        '<thead>' +
        '<tr>' +
        '<th class = "views-field-field-building-code>' + '<a>   SHOULD NOT HIT ME        </a> ' +
        '</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr>' +
        '<td>' +
        '<a> BOO </a>   ' +
        '</td>' +
        '</tr>' +
        '</tbody>'   +
        '</table>' +
        '</div>' +
        '</div>' +
        '</div>';
        let controller = new htmlParserUtility();
        let out = controller.determineValidBuildingList(html);
        done();

    });
});