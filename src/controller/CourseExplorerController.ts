import {QueryRequest, default as QueryController} from "./QueryController";
import {IObject} from "./IObject";
/**
 * Created by Ryan on 11/26/2016.
 */

export default class CourseExplorerController {

    public buildQuery(reqBody: string): QueryRequest {
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
            let datasetId = queryController.getDatasetId(reqKeys[0]);
            let requiredFields = [datasetId + "_dept", datasetId + "_id", datasetId + "_Section", datasetId + "_SectionSize"];
            requiredFields.forEach(field => {
                if (reqKeys.indexOf(field) === -1) {
                    reqKeys.push(field);
                }
            })

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

        let valueType: string = typeof(value);
        result[key] = value;

        if (valueType === "string") {
            result = {"IS": result};
        } else if (valueType === "number") {
            result = {"EQ": result};
        }

        return result;
    }
}
