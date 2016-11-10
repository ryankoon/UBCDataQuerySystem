import {IApplyObject} from "./IEBNF";
import {IObject} from "./IObject";
/**
 * Created by alekhrycaiko on 2016-10-20.
 */

export default class QueryUtility{


    /*
    @ Takes an array of objects and finds the duplicates from the first key.
    // TODO: More test coverage for this.
     */
    public targetHasDuplicate(targetArrayOfObjects: IApplyObject[]) : boolean {
        for (var i = 0; i < targetArrayOfObjects.length-1; i++){
            let firstArrayKey = Object.keys(targetArrayOfObjects[i])[0];
            for (var j = i+1; j < targetArrayOfObjects.length; j++){
                let secondArrayKey = Object.keys(targetArrayOfObjects[j])[0];
                if (firstArrayKey === secondArrayKey){
                    return true;
                }
            }
        }
        return false;
    }

    public removeDuplicatesInArray(items: any[]) {
        let keyHashMap: IObject = {};
        items.forEach(item => {
            keyHashMap[item] = item;
        });

       return Object.keys(keyHashMap);
    }
}
