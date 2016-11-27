import {QueryRequest, default as QueryController} from "./QueryController";
import {IObject} from "./IObject";
/**
 * Created by Ryan on 11/26/2016.
 */

export default class CourseExplorerController {

    public buildQuery(reqBody: string): QueryRequest {
        console.log(reqBody);

        try {
            let reqBodyJson = JSON.parse(reqBody);

            let reqKeys = Object.keys(reqBodyJson);
            let whereObject: IObject = {};
            let andConditions: IObject[] = [];

            reqKeys.forEach(getKey => {
                let comparatorObj = this.generateComparatorObject(getKey, reqBodyJson[getKey]);
                andConditions.push(comparatorObj);
            });

            whereObject["AND"] = andConditions;

            // add required keys
            let queryController = new QueryController();
            let datsetId = queryController.getDatasetId(reqKeys[0]);
            let requiredField = datsetId + "_Section";
            if (reqKeys.indexOf(requiredField) === -1) {
                reqKeys.push(requiredField);
            }

            let courseQuery: QueryRequest =
                {
                    "GET": reqKeys,
                    "WHERE": whereObject,
                    "GROUP": reqKeys,
                    "APPLY": [],
                    "AS": "TABLE"
                };

            return courseQuery;
        } catch (err) {
             console.log("Error building query: " + err);
        }
    }

    public generateComparatorObject(key: string, value: any): IObject {
        let result: IObject = {};
        //TODO handle numbers (according to field name?)

        result[key] = value;
        result = {"IS": result};
        return result;
    }
}
