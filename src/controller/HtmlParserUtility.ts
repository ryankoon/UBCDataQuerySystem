import {ASTNode} from "parse5";
/**
 * Created by alekspc on 2016-11-05.
 */


var parse5 = require('parse5');
import JSZip = require('jszip');

export default class HtmlParserUtility {
    /*
     Important pre-requisite knowledge:
        id that will be used for the data-set when storing it on disk will be 'rooms'
        Therefore we are making a rooms.json file to store all the rooms information.
      */

    /*
        Returns a list of building objects filled with parsed information
    */
    public generateBuildingObjects(idList : Array<string>, buildingList : Array<string>, addressList : Array<string>, zip : JSZip) : string {
        let genericZipObjectIndex = 'campus/discover/buildings-and-classrooms/';
        let zipFileObject = zip.files;
        /*
        !!! TODO: iterate on this for all elements. start with 1 initially.
         */
        zipFileObject[genericZipObjectIndex + idList[0]].async('string').then( data => {
            const document:ASTNode = parse5.parse(data);
            let tempObject : Object;
            this.storeIndividualBuildingObject(document, idList[0], tempObject);
        });
        return 'json';

    }

    public storeIndividualBuildingObject(document : ASTNode, id : string, storage : Object) : string {
        /*
        Needs a series of cases. We need to make multiple searches for each and every key
         ooms_fullname: string; Full building name (e.g., "Hugh Dempster Pavilion").
         rooms_shortname: string; Short building name (e.g., "DMP").
         rooms_number: string; The room number. Not always a number, so represented as a string.
         rooms_name: string; The room id; should be rooms_shortname+"_"+rooms_number.
         rooms_address: string; The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
         rooms_lat: number; The latitude of the building. Instructions for getting this field are below.
         rooms_lon: number; The latitude of the building. Instructions for getting this field are below.
         rooms_seats: number; The number of seats in the room.
         rooms_type: string; The room type (e.g., "Small Group").
         rooms_furniture: string; The room type (e.g., "Classroom-Movable Tables & Chairs").
         rooms_href: string; The link to full details online (e.g., "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201").
         */
        // search for file
        // read file.
        // use recursivelySearchAndBuildListFromTable to build keys
        // for file.
    //    let fullName = this.determineBuildingFullName(document);
        storage = {
            'rooms_fullname': '12313231'
        };
        return '';
    }


    /*
        When an html file is passed into the datasetcontroller, determineValidBuildingList will parse that file and create
        a list of valid buildings using their shortname.
    */
    public determineValidBuildingList(json: string, htmlCode : string, element?: string): Array<string> {

        let that = this;
        const document:ASTNode = parse5.parse(json, {locatinInfo : true});
        let tempArray:Array<string>;

        let validArray : Array<string> = [];
        that.recursivelySearchAndBuildListFromTable(document, htmlCode, validArray, element );
        return validArray;
    }
    /*
        Builds a list of item based on an ID from a table body.
     */
    public recursivelySearchAndBuildListFromTable(nodeList : ASTNode, id: string, validArray : Array<string>, element?: string) : Array<string>{
        if (nodeList && nodeList.childNodes && nodeList.childNodes.length) {
            var childCount = nodeList.childNodes.length;
            for (var i = 0; i < childCount; i++) {
                if (nodeList.childNodes[i] && nodeList.childNodes[i].attrs && nodeList.childNodes[i].attrs.length > 0) {
                    for (var j = 0; j < nodeList.childNodes[i].attrs.length; j++) {
                        if (nodeList.childNodes[i].attrs[j] && nodeList.childNodes[i].attrs[j].value === id  && nodeList.childNodes[i].nodeName !== "th") { // we may need another parameter. nodeList.childnodes[i].nodename == element

                           /*
                           The problem Im having now is this function here. This needs to iterate over every child of the child and check if 'element' exists. If it does, we need to use that, otherwise do normal.
                           Could make element optional for this to work.

                           Other option is to split this into more AST's and make it a simpler problem.
                            */
                           if (element !== undefined)  {
                               for (var z =0; z < nodeList.childNodes[i].childNodes.length; z++){
                                   // need to look for the element now.
                                   if (nodeList.childNodes[i].childNodes[z] && nodeList.childNodes[i].attrs.length > 0  && nodeList.childNodes[i].attrs[j].value) {
                                       console.log(nodeList.childNodes[i].childNodes[z].attrs[j].value === element);
                                   }
                               }
                                console.log("hello");
                            }
                            else {
                                validArray.push(nodeList.childNodes[i].childNodes[0].value.trim());
                            }
                        }
                    }
                }
                // TODO: Can i recurse with optional parameters..?
                this.recursivelySearchAndBuildListFromTable(nodeList.childNodes[i], id, validArray, element);
            }
        }
        else{
            return validArray;  // should return the final value.
        }
    }

    // there's a one off... the href and the  full name associated with it.

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