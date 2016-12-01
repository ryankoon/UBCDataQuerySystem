import {QueryRequest, default as QueryController} from "./QueryController";
import {IObject} from "./IObject";
import {IRoom} from "./IBuilding";
/**
 * Created by Ryan on 11/26/2016.
 */

export interface distanceRequestBody {
    newReqString: string;
    buildingNames: IObject; //Key: rooms_shortname Val: array of bulding codes to 'OR' in the query

}

export default class ExplorerController {

    /**
     * Builds a query based on the selected fields on an explorer pane
     * @param reqBody - key value pairs that represent what to filter by
     * @param type - 'courses' or 'rooms'
     * @param condition - "AND" (match all values in reqBody), "OR" (match any values in reqBody)
     * @param OrValueObject - object with one key, key - field to match by, values[] - match any value in array
     * @param numComparison - operator to use for number compartor object ("IS", "EQ" - default, "LT", "GT")
     * @returns {QueryRequest}
     */
    public buildQuery(reqBody: string, type: string, condition: string, OrValueObject?: IObject,
                      numComparison: string = "EQ"): QueryRequest {
        try {
            let reqBodyJson = JSON.parse(reqBody);

            let getAndGroupKeys = Object.keys(reqBodyJson);

            // Separate orderby key



            //remove latlon
            let tempKeys: string[] = [];
            getAndGroupKeys.forEach(key => {
                if (key !== "rooms_lat" && key !== "rooms_lon") {
                    tempKeys.push(key);
                }
            });
            getAndGroupKeys = tempKeys;


            let whereObject: IObject = {};
            let andObjects: IObject[] = [];
            let optionalOrObjects: IObject = {"OR": []};

            getAndGroupKeys.forEach(getKey => {
                let comparatorObj = this.generateComparatorObject(getKey, reqBodyJson[getKey], numComparison);
                // check for OR condition (ie when distance is set)
                // building name would not need to be the same
                if (condition === "OR" && getKey === "rooms_fullname") {
                    optionalOrObjects["OR"].push(comparatorObj);
                } else {
                    andObjects.push(comparatorObj);
                }
            });

            if (condition === "OR" && OrValueObject) {
                let orValuesKeys: any = Object.keys(OrValueObject);
                if (orValuesKeys && orValuesKeys.length === 1) {
                    let orValues: any = OrValueObject[orValuesKeys[0]];
                    let orObjects: IObject[] = [];
                    orValues.forEach((value: string) => {
                        let comparatorObj = this.generateComparatorObject(orValuesKeys[0], value);
                        orObjects.push(comparatorObj);
                    });

                    if(orObjects.length > 0) {
                        optionalOrObjects["OR"] = orObjects;
                    }
                }
            }

            whereObject["AND"] = andObjects;

            if (optionalOrObjects["OR"].length > 0) {
                // all given field values
                whereObject["AND"].push(optionalOrObjects);
            }

            // add required keys
            let queryController = new QueryController();
            let datasetId = queryController.getDatasetId(getAndGroupKeys[0]);

            // add required fields to return based on explorer types
            let requiredFields: string[];
            if (type === 'courses') {
                requiredFields = [
                    datasetId + "_uuid",
                    datasetId + "_dept",
                    datasetId + "_id",
                    datasetId + "_instructor",
                    datasetId + "_Section",
                    datasetId + "_SectionSize",
                    datasetId + "_Avg",
                    datasetId + "_Pass",
                    datasetId + "_Fail",
                    datasetId + "_Size",
                    datasetId + "_SectionsToSchedule"
                ];
            } else if (type === 'rooms') {
                requiredFields = [datasetId + "_name", datasetId + "_seats"];
            }
            let tempFields = requiredFields;
            getAndGroupKeys.forEach(field => {
                if (requiredFields.indexOf(field) === -1) {
                    tempFields.push(field);
                }
            });
            getAndGroupKeys = tempFields;

            let courseQuery: QueryRequest =
                {
                    "GET": getAndGroupKeys,
                    "WHERE": whereObject,
                    "GROUP": getAndGroupKeys,
                    "APPLY": [],
                    "AS": "TABLE"
                };

            return courseQuery;
        } catch (err) {
             console.log("Error building query: " + err);
        }
    }

    public generateComparatorObject(key: string, value: any, numComparator: string = "EQ"): IObject {
        let result: IObject = {};
        let valueType: string = typeof(value);
        let parsedFloat = Number(value);

        if (!isNaN(parsedFloat) && key !== "subcourses_Section" && key !== "subcourses_Course"){
            valueType = "number";

            // assuming that the query is for WITHIN room/section size
            if (numComparator === "LT") {
                result[key] = parsedFloat + 1;
            } else {
                result[key] = parsedFloat;
            }
        } else {
            result[key] = value;
        }

        if (valueType === "string") {
            result = {"IS": result};
        } else if (valueType === "number") {
            let querykeyvalueObj = result;
                result = {};
                result[numComparator] = querykeyvalueObj;
        }

        return result;
    }


    /**
     * Transform request body when querying rooms with distance
     * @param reqBody - contains lat, lon, distance, full name
     * @param results - list of IRooms that contains one room from each nearby building
     * @returns {distanceRequestBody}
     */
    public transformRequestBody(reqBody: IObject, results: IRoom[]): distanceRequestBody {
        let newReqBody: IObject = {};

        //grab all key values from request body except lat, lon, and distance
        let reqBodyKeys = Object.keys(reqBody);
        reqBodyKeys.forEach(reqBodyKey => {
            if (reqBodyKey !== "rooms_lat" && reqBodyKey !== "rooms_lon" && reqBodyKey !== "rooms_distance") {
                if (reqBodyKey === "rooms_seats"){
                    // add 1 to seats in query since we can will query with LT operator
                    newReqBody[reqBodyKey] = parseInt(reqBody[reqBodyKey]) + 1;
                } else {
                    newReqBody[reqBodyKey] = reqBody[reqBodyKey];
                }
            }
        });

        let orValues: string[] = [];
        results.forEach((room: IRoom) => {
            if (room.shortname) {
                orValues.push(room.shortname);
            }
        });

        //Stringify newReqBody
        let reqString: string = JSON.stringify(newReqBody);

        let distanceReqBody: distanceRequestBody = {
            newReqString: reqString,
            buildingNames: {"rooms_shortname": orValues}
        };

        return distanceReqBody;
    }
}
