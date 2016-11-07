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

        let out: Array<String> = that.iterateNodeList('class', '.views-field-title', document, tempArray);
        console.log(out);

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
    public iterateNodeList(id: string, value: string, nodeList: ASTNode, tempArray : Array<string>) : Array<string> {

        if (!nodeList.childNodes && !nodeList.attrs) {
            return tempArray;
        }

        if (nodeList.attrs && nodeList.attrs.length > 0){
            // check all the attributes. if I find one lets push it on the stack.
            // if attrs is zero and children are zero, return?
            let numberOfAttributeObjects = nodeList.attrs.length;
            for (var i=0 ; i <numberOfAttributeObjects; i++){
                console.log(nodeList.attrs[i].name === "class");
                console.log(nodeList.attrs[i].value === "views-field-field-building-code");
                if (nodeList.attrs[i].name === "class" && nodeList.attrs[i].value.indexOf('views-field-field-building-code') > -1){
                    console.log('hurrah');
                    // now if we take the child Node and take its text values etc, we get a singular value.
                    // problem now: How do we take this concept and iterate over the entire tree for all levels?
                }
            }
        }
        if (nodeList.childNodes && nodeList.childNodes.length > 0){
            let lengthOfChildNodes = nodeList.childNodes.length;
            for (var i=0; i <lengthOfChildNodes ; i++){
                this.iterateNodeList(id, value, nodeList.childNodes[i], tempArray);
            }
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