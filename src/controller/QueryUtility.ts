import {IApplyObject} from "./IEBNF";
/**
 * Created by alekhrycaiko on 2016-10-20.
 */

export default class QueryUtility{


    /*
    @ Takes an array of objects and finds the duplicates from the first key.
     */
    public targetHasDuplicate(targetArrayOfObjects: IApplyObject[]) : boolean {
        for (var i =0; i < targetArrayOfObjects.length-1; i++){
            let firstArrayKey = Object.keys(targetArrayOfObjects[i])[0];
            for (var j = 1; j < targetArrayOfObjects.length; j++){
                let secondArrayKey  = Object.keys(targetArrayOfObjects[j])[0];
                if (firstArrayKey === secondArrayKey){
                    return true;
                }
            }
        }
        return false;
    }
    public numberCheck(token : Object, result : Object){


    }
    public stringCheck() {

    }
}