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
        var document = parse5.parse(json, {locatinInfo : true});

        // basically how this is going to work:
        // (1) We need to find all keys for each childNode, then iterate through them
        // (2) at each level of iteration we need to check for attributes.
        // (3) We then need to iterate through each elvel of attributes checking for our value
        // (4) We then need to, again, iterate through every childNode by checking its count etc.. (basically looping at this point).
        // iterator or recursion should work...
        

        var documentHtml = parse5.serialize(document);

        while(true){
            // if our current level of childnodes > 0
        }
        /*
        let rawNodeList= document.querySelectorAll('td.views-field-field-building-code');
        let validBuildingList : Array<String>;
        for (var i=0; i < rawNodeList.length; i ++){
            validBuildingList.push(rawNodeList[i].textContent.trim());
        }
        */
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