import {ASTNode} from "parse5";
/**
 * Created by alekspc on 2016-11-05.
 */


var parse5 = require('parse5');
import JSZip = require('jszip');
import {IBuilding, IRoom} from "./IBuilding";
import Log from "../Util";
import fs = require('fs');
import GeoService from "./GeoService";
import {GeoResponse} from "./GeoService";
import {IObject} from "./IObject";


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
            let out = this.constructRoomObjects(validFilePaths, zipObject, tempMainTableObject);
            fulfill(out);
        });
    }

    /**
     * Given an array of building addresses, an array of building codes, and an array of building names
     * @param addresses
     * @param codes
     * @param names
     * @returns {Array<mainTableInfo>}
     */
    public createMainTableInfoObject (addresses : Array<string>, codes : Array<string>, names : Array<string>) : Array<mainTableInfo> {
        if (addresses.length !== codes.length || codes.length !== names.length || names.length !== addresses.length){
            Log.error("We have an error, the length of the object should be identical");
        }
        let length = addresses.length;
        let output : Array<mainTableInfo> = [];

        for (var i=0; i < length; i ++){
            let temp : mainTableInfo = {
                'address' : addresses[i],
                'code' : codes[i],
                'buildingName' : names[i]
            }
            output.push(temp);
        }
        return output;
    }

    /**
     * Given an array of ASTNodes(rows of room info), parse the info and return roomPageTableInfo objects for each room.
     * @param input
     * @returns {Array<roomPageTableInfo>}
     */
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

        if (roomNumberArray.length === capacityNumberArray.length &&
            roomNumberArray.length === furnitureTypeArray.length &&
            roomNumberArray.length === roomTypeArray.length) {
            for (var i = 0; i < roomNumberArray.length; i++) {
                let temp: roomPageTableInfo = {
                    'roomNumber': roomNumberArray[i],
                    'capacityNumber': parseInt(capacityNumberArray[i]),
                    'furnitureType': furnitureTypeArray[i],
                    'roomType': roomTypeArray[i]
                }
                outputArray.push(temp);
            }
        } else {
            Log.error("We have an error, the length of the roomNumberArray, capacityNumberArray, furnitureTypeArray" +
                " and roomTypeArray should be identical");
        }

        return outputArray;

    }

    /**
     * Given the building info(mainTableInfo), copy building info into each room page object to create IRoom objects
     * @param mainTableObject
     * @param roomsInfo
     * @returns {Array<IRoom>}
     */
    public generateIRoomArray(mainTableObject : mainTableInfo, roomsInfo : Array<roomPageTableInfo>): Promise<IRoom[]> {
            // ASSUMES: no empty entries in a table.
            // TODO: update parser for href. constructing it is lazy.

        return new Promise((resolve, reject) => {
            let iRoomPromises: Promise<IRoom>[] = [];
            let iRoomPromise: Promise<IRoom>;
            let elementLengthOfRoom = roomsInfo.length;

            for (var j = 0; j < elementLengthOfRoom; j++) {
                let shortname = mainTableObject.code + '_' + roomsInfo[j].roomNumber;
                let hrefExtension: string = mainTableObject.code + '-' + roomsInfo[j].roomNumber;
                let href: string = "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/" + hrefExtension;

                let geoService = new GeoService();
                iRoomPromise = new Promise((fulfill, reject) => {
                    let savedCount = j;
                    geoService.getGeoInfo(mainTableObject.address)
                        .then((buildingAddress: GeoResponse) => {
                            if (buildingAddress.error) {
                                reject("Error in GeoResponse: " + buildingAddress.error);
                            } else {
                                let temp: IRoom = {
                                    fullname: mainTableObject.buildingName,
                                    shortname: mainTableObject.code,
                                    number: roomsInfo[savedCount].roomNumber,
                                    name: shortname,
                                    address: mainTableObject.address,
                                    lat: buildingAddress.lat,
                                    lon: buildingAddress.lon,
                                    seats: roomsInfo[savedCount].capacityNumber,
                                    type: roomsInfo[savedCount].roomType,
                                    furniture: roomsInfo[savedCount].furnitureType,
                                    href: href
                                };
                                fulfill(temp);
                            }
                        })
                        .catch(err => {
                            reject("Error with getGeoInfo: " + err);
                        });
                });
                iRoomPromises.push(iRoomPromise);
            }
            Promise.all(iRoomPromises)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        });
    }

    /**
     * Given the valid filepath, the Zip with building/room info files, and building info objects, parse the room info
     * pages of valid buildings and contstruct IBuildings with associated IRooms.
     * @param validFilePaths
     * @param zip
     * @param mainTableArray
     * @returns {PromiseLike<IObject>|Promise<IObject>}
     */
    public constructRoomObjects(validFilePaths : Array<string>, zip : JSZip, mainTableArray : Array<mainTableInfo>): Promise<IObject> {
        let zipObject = zip.files;
        let promiseArray : Promise<IObject[]>[] = [];

        for (var i=0; i < validFilePaths.length; i++){
            let promiseForRoomsInBuilding : Promise<Array<IRoom>>;
           promiseForRoomsInBuilding = new Promise((fulfill, reject) => {
               // Save the value of i before async to ensure we are working with the same i value after async call
               let savedCount = i;
               zipObject[validFilePaths[savedCount]].async('string')
                   .then(result => {
                    let roomArray : Array<IRoom> = [];
                    // Generate the table
                    let output: Array<ASTNode> = this.generateASTNodeRows(result);
                    let currentRoomsValues : Array<roomPageTableInfo> =  this.generateTempRoomPageTableInfoArray(output);
                        this.generateIRoomArray(mainTableArray[savedCount], currentRoomsValues)
                            .then((tempRoomArray: IRoom[]) => {
                                let tempBuilding: IObject = {};
                                let buildingCode = this.getBuildingCodeFromFilePath(validFilePaths[savedCount]);
                                tempBuilding[buildingCode] = {"result" : tempRoomArray};
                                fulfill(tempBuilding);
                            }).catch(err => {
                                Log.error('Error with generateIRoomArray.');
                                reject(err);
                            });
                    }).catch( err => {
                        Log.error('Error with promises constructing room objects.');
                        reject(err);
                    });
            });
            // promiseArray is Array<Promise<Array<IRoom>>>
            promiseArray.push(promiseForRoomsInBuilding);
        }

        return Promise.all(promiseArray).then(data => {
            let result: IObject = {};
            if (data && data.length > 0) {
                result = this.concatenateObjects(data);
            }
            return result;
        });
    }

    public getBuildingCodeFromFilePath(filePath: string): string {
       let result: string = "";
        let parts: string[] = filePath.split("campus/discover/buildings-and-classrooms/");
        if (parts && parts.length > 0) {
            result = parts[1];
        }
        return result;
    }

    /**
     * Concatenates the given array of objects
     * @param objects
     * @returns {IObject}
     */
    public concatenateObjects(objects: IObject[]): IObject {
        let result: IObject = {};
            objects.forEach((object) => {
                let key = Object.keys(object)[0];
                result[key] = object[key];
            });
        return result;
    }

    /**
     * Given an array of valid building codes and the zip containing building info files,
     * return the file paths to each valid building's info file.
     * @param validCodeArray
     * @param zip
     * @returns {Array<string>}
     */
    public readValidBuildingHtml(validCodeArray : Array<string>, zip : JSZip) : Array<string>  {

        let files = zip.files;
        let keyPaths : Array<string> = Object.keys(files);
        let pathsToRead : Array<string> = [];
        let path = "campus/discover/buildings-and-classrooms/";
        validCodeArray.forEach((item) => {
            let tempFilePath =  path + item;
           if (keyPaths.indexOf(tempFilePath) > -1){
               // we found a match!
               pathsToRead.push(tempFilePath);
           }
        });

        return pathsToRead;
    }

    /**
     * Wrapper that calls recursivelyBuildASTRows to recursively look for table rows on a given page.
     * @param json
     * @returns {Array<ASTNode>}
     */
    public generateASTNodeRows(json : string): Array<ASTNode> {
        const document: ASTNode = parse5.parse(json);
        let tableArray : Array<ASTNode> = [];
        this.recursivelyBuildASTRows(document, tableArray);
        return tableArray;
    }

    /**
     * Given an ASTNode, recurse through all descendants to get all table rows that are not in a table header.
     * @param nodeList
     * @param tableRows - passed by reference
     */
    public recursivelyBuildASTRows(nodeList : ASTNode, tableRows : Array<ASTNode>) {
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

    /**
     * Given an array of rows represented by ASTNodes, call recurseOnASTNode for each row with given parameters.
     * @param rows
     * @param target
     * @param element
     * @param nameTarget
     * @param validKeyArray - passed by reference
     * @returns {Array<string>}
     */
    public buildSetOfStringsFromRow(rows : Array<ASTNode>, target : string, element : string,
                                    nameTarget : string, validKeyArray : Array<string>) : Array<String>{
        for (var i=0; i < rows.length; i ++){
            const nodeObject : ASTNode = rows[i];
            this.recurseOnASTNode(nodeObject, target, element, nameTarget, validKeyArray);
        }
        return validKeyArray;
    }

    /**
     * Given an ASTNode and search parameters, recurse through its descendants and store the value of nodes that match
     * @param nodeList
     * @param target
     * @param element
     * @param nameTarget
     * @param validKeyArray - passed by reference
     * @returns {Array<string>}
     */
    public recurseOnASTNode(nodeList : ASTNode, target : string, element : string, nameTarget : string,
                            validKeyArray : Array<string>) : Array<String> {
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

    /**
     * Finds the value of the name target.
     * @param childNode
     * @param nameTarget - If 'a', returns value of first childnode, else returns value of given node
     * @returns {string}
     */
    public findResultWithNameTarget(childNode : ASTNode, nameTarget : string) : string {
        switch(nameTarget) {
            case 'a' : // this 'a' component is getting called recursively somehow its not the loop...
                if (childNode.childNodes) {
                    if (childNode.childNodes[0].value !== undefined) {
                        return childNode.childNodes[0].value;
                    } else {
                        return "";
                    }
                }
                break;
            default:
                let trimmedVal = childNode.value.trim();
                if (trimmedVal && trimmedVal.length > 1) {
                    return childNode.value.trim();
                }
                return "";
        }
    }
}
