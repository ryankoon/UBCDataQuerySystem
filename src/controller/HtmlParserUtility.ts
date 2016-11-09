import {ASTNode} from "parse5";
/**
 * Created by alekspc on 2016-11-05.
 */


var parse5 = require('parse5');
import JSZip = require('jszip');
import {IBuilding, IRoom} from "./IBuilding";
import Log from "../Util";
import fs = require('fs');


export interface mainTableInfo {
    address : string;
    code : string;
    buildingName : string;
}
export interface roomPageTableInfo {
    roomNumber: string,
    capacityNumber : number,
    roomType : string,
    furnitureType : string
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
    public intializeHtmlDataStorage(data : string, zipObject : JSZip) : Promise<IBuilding> {
        return new Promise( (fulfill, reject) => {
            let validCodeArray : Array<string> = [];
            let validBuildingNameArray : Array<string> = [];
            let validAddressArray : Array<string> = [];

            let output : Array<ASTNode> = this.generateASTNodeRows(data);
            // call build on each proroperty to generate its array.

            this.buildSetOfStringsFromRow(output, 'views-field views-field-field-building-code', 'class', '', validCodeArray);
            this.buildSetOfStringsFromRow(output,'views-field views-field-title', 'class', 'a', validBuildingNameArray );
            this.buildSetOfStringsFromRow(output, 'views-field views-field-field-building-address', 'class', '', validAddressArray);

            let tempMainTableObject : Array<mainTableInfo> = this.createMainTableInfoObject(validAddressArray, validCodeArray, validBuildingNameArray);
            /*
            every room gets a IRoom object.
             */
            let validFilePaths  : Array<string>= this.readValidBuildingHtml(validCodeArray, zipObject);
            /*
            For every
             */

            return this.constructRoomObjects(validFilePaths, zipObject, tempMainTableObject)
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

    public generateTempRoomPageTableInfoArray (input : Array<ASTNode>) : Array<roomPageTableInfo> {
        let roomNumberArray: Array<string> = [];
        let capacityNumberArray: Array<string> = [];
        let furnitureTypeArray: Array<string> = [];
        let roomTypeArray: Array<string> = [];

        let outputArray : Array<roomPageTableInfo> = [];

        this.buildSetOfStringsFromRow(input, 'views-field views-field-field-room-number', 'class', 'a', roomNumberArray);
        this.buildSetOfStringsFromRow(input, 'views-field views-field-field-room-capacity', 'class', '', capacityNumberArray);
        this.buildSetOfStringsFromRow(input, 'views-field views-field-field-room-furniture', 'class', '', furnitureTypeArray);
        this.buildSetOfStringsFromRow(input, 'views-field views-field-field-room-type', 'class', '', roomTypeArray);
        let collapsedArray : Array<roomPageTableInfo> = [];

        for (var i=0; i < roomNumberArray.length; i++){
            let temp : roomPageTableInfo = {
                'roomNumber' : roomNumberArray[i],
                'capacityNumber' : parseInt(capacityNumberArray[i]),
                'furnitureType' : furnitureTypeArray[i],
                'roomType' : roomTypeArray[i]
            }
            outputArray.push(temp);
        }
        return outputArray;

    }

    public generateIRoomArray(mainTableObject : mainTableInfo, roomsInfo : Array<roomPageTableInfo>) : Array<IRoom> {

        // ASSUMES: no empty entries in a table.
        // TODO: update latitude and longitude.
        // TODO: update parser for href. constructing it is lazy.
        let iRoomArray : Array<IRoom> = [];
        let longestColumnLength = roomsInfo[0].length;

        for (var j = 0; j < longestColumnLength.length; j++) {
            let shortname = mainTableObject.code + '_' + longestColumnLength[j];
            let hrefExtension: string = mainTableObject.code + '-' + longestColumnLength[j];
            let href: string = "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/" + hrefExtension;
            let temp: IRoom = {
                fullname: mainTableObject.buildingName,
                shortname: mainTableObject.code,
                number: roomsInfo[j].roomNumber,
                name: shortname,
                address: mainTableObject.address,
                lat: 123131,
                lon: 1231231,
                seats: roomsInfo[j].capacityNumber,
                type: roomsInfo[j].roomType,
                furniture: roomsInfo[j].furnitureType,
                href: href
            }
            iRoomArray.push(temp);
        }
        return iRoomArray;

    }

    public constructRoomObjects(validFieldPaths : Array<string>, zip : JSZip, mainTableArray : Array<mainTableInfo>  ) : Promise<IBuilding> {
        let zipObject = zip.files;
        let promiseArray : Array<Promise<Array<IRoom>>> =[];
        for (var i=0; i < validFieldPaths.length - 1; i++){
            let promiseForRoom : Promise<Array<IRoom>>;
           promiseForRoom  = new Promise( (fulfill, reject) => {
               zipObject[validFieldPaths[i]].async('string')
                    .then(result => {
                        let roomArray : Array<IRoom> = [];
                    // generate the table
                    let output: Array<ASTNode> = this.generateASTNodeRows(result);
                    let currentRoomsValues : Array<roomPageTableInfo> =  this.generateTempRoomPageTableInfoArray(output);
                    let tempRoomArray : Array<IRoom>  = this.generateIRoomArray(mainTableArray[i], currentRoomsValues);
                    fulfill(tempRoomArray);
                    }).catch( err => {
                    Log.error('Error with promises constructing room objects');
                   reject(err);
               });
            });
            // promiseArray is Array<Promise<Array<IRoom>>>
            promiseArray.push(promiseForRoom);
        }
        let b = Promise.all(promiseArray).then(data => {
            let singleArrayofRooms: IRoom[] = [].concat.apply([], data);
            let out : IBuilding = {
                result : singleArrayofRooms
            }
            return out;
        });
        return b;
    }

    public readValidBuildingHtml(validCodeArray : Array<string>, zip : JSZip) : Array<string>  {

        let files = zip.files;
        let keyPaths : Array<string> = Object.keys(files);
        let pathsToRead : Array<string> = [];
        let path = "campus/discover/buildings-and-classrooms/";
        validCodeArray.forEach( (item, index) => {
            let tempFilePath =  path + item;
           if (keyPaths.indexOf(tempFilePath) > -1){
               // we found a match!
               pathsToRead.push(tempFilePath);
           }
        });

        return pathsToRead;
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
    public recurseOnASTNode(nodeList : ASTNode, target : string, element : string, nameTarget : string, validKeyArray : Array<string>) : Array<String> {
        if (nodeList && nodeList.childNodes) {
            for (var i = 0; i < nodeList.childNodes.length; i++) {
                if (nodeList && nodeList.attrs && nodeList.attrs.length > 0) {
                    for (var k = 0; k < nodeList.attrs.length; k++) {
                        if (nodeList.attrs[k].value === target && nodeList.attrs[k].name === element) {
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
}