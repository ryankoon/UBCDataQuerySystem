import {QueryRequest, default as QueryController} from "./QueryController";
import {IObject} from "./IObject";
/**
 * Created by Ryan on 11/26/2016.
 */

export default class ExplorerController {

    /**
     * Builds a query based on the selected fields on an explorer pane
     * @param reqBody
     * @param type - 'courses' or 'rooms'
     * @returns {QueryRequest}
     */
    public buildQuery(reqBody: string, type: string): QueryRequest {
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

            // add required fields to return based on explorer types
            let requiredFields: string[];
            if (type === 'courses') {
                requiredFields = [datasetId + "_dept", datasetId + "_id", datasetId + "_Section", datasetId + "_SectionSize"];
            } else if (type === 'rooms') {
                requiredFields = [datasetId + "_name", datasetId + "_seats"];
            }
            let tempFields = requiredFields;
            reqKeys.forEach(field => {
                if (requiredFields.indexOf(field) === -1) {
                    tempFields.push(field);
                }
            });
            reqKeys = tempFields;

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
        let parsedFloat = Number(value);

        if (!isNaN(parsedFloat)){
            valueType = "number";
            result[key] = parsedFloat;
        } else {
            result[key] = value;
        }

        if (valueType === "string") {
            result = {"IS": result};
        } else if (valueType === "number") {
            result = {"EQ": result};
        }

        return result;
    }
}
