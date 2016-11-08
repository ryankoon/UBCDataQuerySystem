import {ASTNode} from "parse5";
/**
 * Created by alekspc on 2016-11-05.
 */


var parse5 = require('parse5');
export default class HtmlParserUtility {
    // Created stubbed/mock  functions in order to begin planning out this feature.

    /*
     Important pre-requisite knowledge:
        id that will be used for the data-set when storing it on disk will be 'rooms'
        Therefore we are making a rooms.json file to store all the rooms information.
      */


    /*
        When an html file is passed into the datasetcontroller, determineValidBuildingList will parse that file and create
        a list of valid buildings using their shortname.
     */
    public determineValidBuildingList(json: String): any {

     //   var serializer = new parse5.SerializerStream(json, {treeAdapter : parse5.treeAdapters.htmlparser2});
       // var src = parse5.parse(json);
  //      for (let key in src) {
    //        console.log(key);
      //  }
        var that = this;
        var document:ASTNode = parse5.parse(json, {locatinInfo : true});
        // needs to iterate for TD, needs to skip TH.
        let tempArray:Array<string>;

      //  let table: ASTNode = that.recurseToFindASTNode('tbody', document);
        let validArray : Array<string> = [];
        that.recursivelySearchAndBuildValidIdList(document, 'views-field views-field-field-building-code', validArray);
        console.log(validArray);
        // basically how this is going to work:
        // (1) We need to find all keys for each childNode, then iterate through them
        // (2) at each level of iteration we need to check for attributes.
        // (3) We then need to iterate through each elvel of attributes checking for our value
        // (4) We then need to, again, iterate through every childNode by checking its count etc.. (basically looping at this point).
        // iterator or recursion should work...


        var documentHtml = parse5.serialize(document);

        return 0;

        /*
        let rawNodeList= document.querySelectorAll('td.views-field-field-building-code');
        let validBuildingList : Array<String>;
        for (var i=0; i < rawNodeList.length; i ++){
            validBuildingList.push(rawNodeList[i].textContent.trim());
        }
        */
    }
    /*
        TODO: Finds the value of a node that has a certain html id/class
     */
    public recurseToFindASTNode(id: string, nodeList : ASTNode) : ASTNode {
        if (nodeList.childNodes && nodeList.childNodes.length > 0) {
            let lengthOfChildNodes = nodeList.childNodes.length;
            for (var i=0; i < lengthOfChildNodes; i ++){
                if (nodeList && nodeList.nodeName === id) {
                    return nodeList;
                }
                else {
                    this.recurseToFindASTNode(id, nodeList.childNodes[i]);
                }
            }
        }
        else{
            return null;
        }
    }
    /*
        TODO : Building valid buildings list
     */
    public recursivelySearchAndBuildValidIdList(nodeList : ASTNode, id: string, validArray : Array<string>) : Array<string>{
        if (nodeList && nodeList.childNodes && nodeList.childNodes.length) {
            var childCount = nodeList.childNodes.length;
            for (var i = 0; i < childCount; i++) {
                console.log('how many');
                if (nodeList.childNodes[i] && nodeList.childNodes[i].attrs && nodeList.childNodes[i].attrs.length > 0) {
                    for (var j = 0; j < nodeList.childNodes[i].attrs.length; j++) {
                        if (nodeList.childNodes[i].attrs[j] && nodeList.childNodes[i].attrs[j].value === id) {
                            console.log(id);
                            // should just be able to access the child and add the code?
                            validArray.push(nodeList.childNodes[i].childNodes[0].value.trim());
                        }
                    }

                }
                this.recursivelySearchAndBuildValidIdList(nodeList.childNodes[i], id, validArray);
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