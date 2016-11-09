import {ASTNode} from "parse5";
/**
 * Created by alekspc on 2016-11-05.
 */


var parse5 = require('parse5');
import JSZip = require('jszip');
import {IBuilding} from "./IBuilding";
import Log from "../Util";


interface mainTableInfo {
    address : string;
    code : string;
    buildingName : string;
}

export default class HtmlParserUtility {
    /*
     Important pre-requisite knowledge:
        id that will be used for the data-set when storing it on disk will be 'rooms'
        Therefore we are making a rooms.json file to store all the rooms information.
      */

    /*
    Promises to return a JSON string once all valid buildings are successfully read from file.

    Assumes order and sizes of array will remain the same.
    If this changes, we can construct object sooner to overcome this.
    */
    public intializeHtmlDataStorage(data : string, zipObject : JSZip) : Promise<string> {
        return new Promise( (fulfill, reject) => {
            let validCodeArray : Array<string> = [];
            let validBuildingNameArray : Array<string> = [];
            let validAddressArray : Array<string> = [];
            let validFilePaths : Array<string> = [];

            let output : Array<ASTNode> = this.generateASTNodeRows(data);
            // call build on each proroperty to generate its array.
            this.buildSetOfStringsFromRow(output, 'views-field views-field-field-building-code', 'class', '', validCodeArray);
            this.buildSetOfStringsFromRow(output,'views-field views-field-title', 'class', 'a', validBuildingNameArray );
            this.buildSetOfStringsFromRow(output, 'views-field views-field-field-building-address', 'class', '', validAddressArray);

            let tempMainTableObject : Array<mainTableInfo> = this.createMainTableInfoObject(validAddressArray, validCodeArray, validBuildingNameArray);
            console.log(tempMainTableObject);
            /*
            every room gets a IRoom object.
             */

            validFilePaths = this.readValidBuildingHtml(validCodeArray, zipObject);

           // this.constructRoomObjects(validFilePaths, validCodeArray, validBuildingNameArray, validAddressArray, validFilePaths);


        });
    }
    public createMainTableInfoObject (address : Array<string>, code : Array<string>, building : Array<string>) : Array<mainTableInfo> {
        if (address.length !== code.length || code.length !== building.length || building.length !== address.length){
            Log.error("We have an error, the length of the object should be identical");
        }
        let length = address.length;
        let output : Array<mainTableInfo> = [];


        for (var i=0; i < length; i ++){
            let temp : mainTableInfo = {
                'address' : address[i],
                'code' : code[i],
                'buildingName' : building[i]
            }
            output.push(temp);
        }
        return output;

    }

    public constructRoomObjects(validFieldPaths : Array<string>) {
        return ['12313'];
    }

    public readValidBuildingHtml(validCodeArray : Array<string>, zip : JSZip) : Array<string>  {

        let files = zip.files;
        let keyPaths : Array<string> = Object.keys(files);
        let pathsToRead : Array<string> = [];
        let path = "campus/discover/buildings-and-classrooms/"
        validCodeArray.forEach( (item, index) => {
            let tempFilePath =  path + item;
           if (keyPaths.indexOf(tempFilePath) > -1){
               // we found a match!
               pathsToRead.push(tempFilePath);
           }
        });

        return pathsToRead;
    }

    public storeIndividualBuildingObject(document : ASTNode, id : string, storage : Object) : string {
        /*
        Needs a series of cases. We need to make multiple searches for each and every key
         rooms_fullname: string; Full building name (e.g., "Hugh Dempster Pavilion").
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
        return '';
    }

    public generateASTNodeRows(json : string) :Array<ASTNode> {
        const document: ASTNode = parse5.parse(json);
        let tableArray : Array<ASTNode> = [];
        this.recursivelyBuildASTRows(document, tableArray);
        return tableArray;
    }

    public recursivelyBuildASTRows(nodeList : ASTNode, tableRows :Array<ASTNode>) {
        if (nodeList && nodeList.childNodes && nodeList.childNodes.length) {
            var childCount = nodeList.childNodes.length;
            for (var i = 0; i < childCount; i++) {
                if (nodeList.childNodes[i] && nodeList.childNodes[i].nodeName && nodeList.childNodes[i].nodeName == "tr" && nodeList.childNodes[i].parentNode.nodeName != "thead") {
                    tableRows.push(nodeList.childNodes[i]);
                }
                this.recursivelyBuildASTRows(nodeList.childNodes[i], tableRows);
            }
        }
    }
    public buildSetOfStringsFromRow(rows : Array<ASTNode>, target : string, element : string ,nameTarget : string, validKeyArray : Array<string>) : Array<String>{
        for (var i=0; i < rows.length; i ++){
            const nodeObject : ASTNode = rows[i];
            this.recurseOnASTNode(nodeObject, target, element, nameTarget, validKeyArray);
        }
        return validKeyArray;
    }
    // !!! differences is that I need to find the 'name' and 'value' and if its an href or a tag i need to diverge.
    public recurseOnASTNode(nodeList : ASTNode, target : string, element : string, nameTarget : string, validKeyArray : Array<string>) : Array<String> {
        if (nodeList && nodeList.childNodes) {
            for (var i = 0; i < nodeList.childNodes.length; i++) {
                if (nodeList && nodeList.attrs && nodeList.attrs.length > 0) {
                    for (var k = 0; k < nodeList.attrs.length; k++) {
                        console.log(nodeList.attrs[k].value);
                        console.log(target);
                        console.log(nodeList.attrs[k].name);
                        console.log(element);

                        if (nodeList.attrs[k].value === target && nodeList.attrs[k].name === element) {
                            console.log(nodeList.attrs[k].value);
                            {
                                let output = this.findResultWithNameTarget(nodeList.childNodes[i], nameTarget);
                                if (output !== undefined) {
                                    validKeyArray.push(output);
                                }
                            }
                        }
                    }
                    let nextASTNode = nodeList.childNodes[i];
                    this.recurseOnASTNode(nextASTNode, target, element, nameTarget, validKeyArray);
                }
            }
        }
        else {
            return validKeyArray;
        }
    }
    /*
        Finds the value of the name target
     */
    public findResultWithNameTarget(childNode : ASTNode, nameTarget : string) : string {
            switch(nameTarget) {
                case 'a' : // this 'a' component is getting called recursively somehow its not the loop...
                    if (childNode.childNodes) {
                            if (childNode.childNodes[0].value !== undefined) {
                                return childNode.childNodes[0].value;
                            }
                        }
                    break;
                default:
                    if (childNode.value.trim() !== "") {
                            return childNode.value.trim();
                        }
                    break;
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