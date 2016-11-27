
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController, QueryResponse} from "./QueryController";
import DatasetController from '../controller/DatasetController';
import Log from '../Util';
import {Datasets} from "./DatasetController";
import DataController from "./DataController";
import {IRoom} from "./IBuilding";
import CourseDataController from "./CourseDataController";
import ExplorerController from "./ExplorerController";
import {distanceRequestBody} from "./ExplorerController";
import {IObject} from "./IObject";

class ResponseObject implements InsightResponse{
    code: Number;
    body: {
        error?: string,
        message?: string
    };

    constructor(code : Number, body: Object){
        this.code = code;
        this.body = body;
    }
}

export default class InsightFacade implements IInsightFacade {

    private static datasetController = new DatasetController();

    public addDataset(id: string, content: string): Promise<InsightResponse> {
        Log.trace('InsightFacade:addDataSet(..) - id: ' + id);
        return new Promise((fulfill, reject) => {

            InsightFacade.datasetController.process(id, content)
                .then(function (result) {
                    if (result && (result === 204 || result === 201)) {
                        // construct Message success result object.
                        var successObj = {
                            message: 'Success!'
                        }
                        let responseObject = new ResponseObject(result, successObj);
                        fulfill(responseObject); // return code and message success
                    }
                    else {
                        var errorObj = {
                            Error: 'Error putting into the dataset'
                        }
                        let responseObject = new ResponseObject(400, errorObj);
                        reject(responseObject); // we need to return a 400.
                    }
                })
                .catch(function (err){
                    let errObject = new ResponseObject(400, { error: err});
                    reject(errObject);
                });
        });
    }
    public removeDataset(id: string): Promise<InsightResponse> {
        Log.trace('InsightFacade:removeDataSet(..) - id: ' + id);
        return new Promise((fulfill, reject)=> {
            InsightFacade.datasetController.deleteDataset(id)
                .then((result) =>{
                    var successBody = {
                        body : {
                            Message: result.message
                        }
                    }
                    let responseObject : InsightResponse = new ResponseObject(result.status, successBody);
                    fulfill(responseObject)
                })
                .catch((err) => {
                    var failBody = {
                        body : {
                            Message: err.message,
                            Error: err.Error
                        }
                    }
                    let errorObject : InsightResponse = new ResponseObject(err.status, failBody);
                    reject(errorObject);
                });
        })
    }
    public performQuery(query: QueryRequest): Promise<InsightResponse> {
        Log.trace('InsightFacade:performQuery(..): query: ' + query);
        return new Promise((fulfill, reject) => {
            // let query: QueryRequest = req.params;
            var controller: QueryController = new QueryController();
            let isValidResult: boolean | string = controller.isValid(query);

            if (isValidResult === true) {
                let allQueryKeys: string[];
                try {
                    allQueryKeys = controller.getAllQueryKeys(query);
                    controller.invalidateMultipleDatasets(allQueryKeys);
                }
                catch (err) {
                    let errBody = {
                            error: err.message
                    };
                    let errorResponseObject : InsightResponse = new ResponseObject(400, errBody);
                    reject(errorResponseObject);
                    return;
                }
                // get all dataset ids
                let datasetIds: string[] = [];
                allQueryKeys.forEach((queryKey) => {
                    let datasetId = controller.getDatasetId(queryKey);
                    if (datasetId !== "" && datasetIds.indexOf(datasetId) === -1) {
                        datasetIds.push(datasetId);
                    }
                });

                let getDatasetPromises: Promise<any>[] = [];
                let recievedDatasets: Datasets = {};
                let missingDatasets: string[] = [];
                // get and store datasets in queryController
                datasetIds.forEach((datasetId) => {
                    let getDatasetPromise: Promise<any>;
                    getDatasetPromise = new Promise((yes, no) => {
                        InsightFacade.datasetController.getDataset(datasetId)
                            .then((dataset: any) => {
                                if (dataset) {
                                    recievedDatasets[datasetId] = dataset;
                                } else {
                                    missingDatasets.push(datasetId);
                                }
                                yes();
                            })
                            .catch((err) => {
                                no("getDataset Error in postQuery!");
                            });
                    });
                    getDatasetPromises.push(getDatasetPromise);
                });
                Promise.all(getDatasetPromises)
                    .then(() => {
                        if (missingDatasets.length === 0) {
                            controller.setDataset(recievedDatasets);
                            let result = controller.query(query);
                            let successObject : InsightResponse = new ResponseObject(200, result);
                            fulfill(successObject);
                        } else {
                            let errorObject : InsightResponse =
                                new ResponseObject(
                                    424,
                                    {
                                        missing: missingDatasets
                                    });
                            reject(errorObject);
                        }
                    })
                    .catch((err) => {
                        let errorObject : InsightResponse =
                            new ResponseObject(
                                400, {error: err});
                        reject(errorObject);
                    });
            } else {
                let errObj : InsightResponse =
                    new ResponseObject(
                        400, {error: isValidResult});
                reject(errObj);
            }
        });
    }

    /*
     Return an Array of Rooms that are within the given distance from a building.
     */
    public getRoomsWithinDistance(reqBody: any): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            let roomsDataset: any;
            let travelDistances: IObject = {};
                InsightFacade.datasetController.getDataset("rooms").then((dataset: any) => {
                    roomsDataset = dataset;
                    let keys = Object.keys(dataset);
                    let aRoomFromEachBuilding: IRoom[] = [];
                    keys.forEach((key) => {
                        if (dataset[key]["result"].length > 0) {
                            // only check distance from one room in each building
                            aRoomFromEachBuilding.push(dataset[key]["result"][0]);
                        }
                    });

                    let dataController = new DataController();

                    Log.info(reqBody.rooms_lat);
                    Log.info(reqBody.rooms_lon);
                    return dataController.roomsWithinDistance({lat: reqBody.rooms_lat, lon: reqBody.rooms_lon},
                        aRoomFromEachBuilding, reqBody.rooms_distance, 'walking');
                }).then((results: IRoom[]) => {
                    // results - One IRoom from each building
                    let explorerController = new ExplorerController();
                    let newReqBody: distanceRequestBody = explorerController.transformRequestBody(reqBody, results);
                    let query = explorerController.buildQuery(newReqBody.newReqString, "rooms", "OR",
                        newReqBody.buildingNames, "LT");
                    let insightFascade = new InsightFacade();

                    // keep track of travel distances to each building
                    results.forEach((room: IRoom) => {
                        if (room.traveldistance && room.shortname) {
                            travelDistances[room.shortname] = room.traveldistance;
                        }
                    });

                    return insightFascade.performQuery(query);
                }).then(responseObj => {
                    // restore travel distances in room objects
                    if (responseObj.body["result"]) {
                        let queryResults: any = <any>responseObj.body["result"];
                        queryResults.forEach((queryResult: any) => {
                            let roomName: string = queryResult["rooms_name"];
                            let roomNameParts = roomName.split("_");
                            let buildingCode: string = "";
                            if (roomNameParts) {
                               buildingCode = roomNameParts[0];
                            }
                            let travelDistance = travelDistances[buildingCode];

                            if (travelDistance !== undefined) {
                                queryResult["rooms_traveldistance"] = travelDistance;
                            } else {
                                // assume it is the building is the orgin to measure distance from
                                queryResult["rooms_traveldistance"] = 0;
                            }
                        });

                        responseObj.body["result"] = queryResults;
                    }

                    fulfill(responseObj);
                }).catch(err => {
                    reject(err);
                });
        });
    }

    /*
        Return an Array of Objects containing all the desired room information.
     */
    public getRoomInformation() : Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            let roomQuery: QueryRequest = {
                "GET": ["rooms_number", "rooms_fullname", "rooms_seats", "rooms_type", "rooms_lat", "rooms_lon", "rooms_furniture"],
                "WHERE": {},
                "AS": "TABLE"
            }
            this.performQuery(roomQuery).then(result => {
               fulfill(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
        /*
         Return an Array of Objects containing all the desired course information.
         */
    public getCourseInformation() : Promise<InsightResponse> {
            return new Promise((fulfill, reject)=>{
                let courseQuery : QueryRequest =
                    {
                        "GET": ["subcourses_instructor", "subcourses_dept", "subcourses_uuid", "subcourses_title",
                            "subcourses_Size", "subcourses_SectionsToSchedule", "subcourses_Section"],
                        "WHERE": {},
                        "AS" : "TABLE"
                    };

                let courseDataController = new CourseDataController();
                courseDataController.processCourseDataset("courses")
                .then(newDataset => {
                    return this.performQuery(courseQuery);
                })
                .then(result => {
                    fulfill(result);
                }).catch(err=>{
                    reject(err);
                });
                // We want to do a number of queries and just get a ton of information from the current data set.
            });
    }

    public handleCourseExploration(reqBody: string): Promise<InsightResponse> {
        return new Promise((fulfill, reject)=>{
            let explorerController = new ExplorerController();
            let courseQuery: QueryRequest = explorerController.buildQuery(reqBody, "courses", "AND");

            this.performQuery(courseQuery)
             .then(result => {
                fulfill(result);
            }).catch(err=>{
                reject(err);
            });
        });
    }

    handleRoomExploration(reqBody: string) {
        return new Promise((fulfill, reject)=>{
            let explorerController = new ExplorerController();
            let courseQuery: QueryRequest = explorerController.buildQuery(reqBody, "rooms", "AND", null, "LT");

            this.performQuery(courseQuery)
                .then(result => {
                    fulfill(result);
                }).catch(err=>{
                reject(err);
            });
        });
    }
}
