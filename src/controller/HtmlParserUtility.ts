import {ASTNode} from "parse5";
/**
 * Created by alekspc on 2016-11-05.
 */


var parse5 = require('parse5');
export default class HtmlParserUtility {
    /*
     Important pre-requisite knowledge:
        id that will be used for the data-set when storing it on disk will be 'rooms'
        Therefore we are making a rooms.json file to store all the rooms information.
      */

    /*
        When an html file is passed into the datasetcontroller, determineValidBuildingList will parse that file and create
        a list of valid buildings using their shortname.
     */
    public determineValidBuildingList(json: String): Array<string> {

        var that = this;
        var document:ASTNode = parse5.parse(json, {locatinInfo : true});
        let tempArray:Array<string>;

        let validArray : Array<string> = [];
        that.recursivelySearchAndBuildListFromTable(document, 'views-field views-field-field-building-code', validArray);
        return validArray;
    }
    /*
        Builds a list of item based on an ID from a table body.
     */
    public recursivelySearchAndBuildListFromTable(nodeList : ASTNode, id: string, validArray : Array<string>) : Array<string>{
        if (nodeList && nodeList.childNodes && nodeList.childNodes.length) {
            var childCount = nodeList.childNodes.length;
            for (var i = 0; i < childCount; i++) {
                if (nodeList.childNodes[i] && nodeList.childNodes[i].attrs && nodeList.childNodes[i].attrs.length > 0) {
                    for (var j = 0; j < nodeList.childNodes[i].attrs.length; j++) {
                        if (nodeList.childNodes[i].attrs[j] && nodeList.childNodes[i].attrs[j].value === id && nodeList.childNodes[i].nodeName !== 'th') {
                            validArray.push(nodeList.childNodes[i].childNodes[0].value.trim());
                        }
                    }

                }
                this.recursivelySearchAndBuildListFromTable(nodeList.childNodes[i], id, validArray);
            }
        }
        else{
            return validArray;  // should return the final value.
        }
    }
    /*
        TODO: Returns buildings shortname
     */
    public determineBuildingShortName() : String {
        return '1';
    }

    /*
       TODO: Returns boolean as to whether there is a room table.
     */
    public checkIfBuildingHasRoomTable() : boolean {
           return false;
    }

    /*
       TODO: Returns a single instance of a room number.
     */
    public determineRoomNumber() : String {
        return '1';
    }

    /*
        TODO: Returns a single instance of a buildings fullname.
     */
    public determineBuildingFullName() : String {
        return '1';
    }
}