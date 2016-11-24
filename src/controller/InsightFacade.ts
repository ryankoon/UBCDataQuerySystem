
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController, QueryResponse} from "./QueryController";
import DatasetController from '../controller/DatasetController';
import Log from '../Util';
import {Datasets} from "./DatasetController";
import DataController from "./DataController";
import {IRoom} from "./IBuilding";

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
            InsightFacade.datasetController.getDataset("rooms")
                .then((dataset: any) => {
                    let keys = Object.keys(dataset);
                    let aRoomFromEachBuilding: IRoom[] = [];
                    keys.forEach((key) => {
                        if (dataset[key]["result"].length > 0) {
                            aRoomFromEachBuilding.push(dataset[key]["result"][0]);
                        }
                    });



                    let dataController = new DataController();

                    return dataController.roomsWithinDistance({lat: reqBody.lat, lon: reqBody.lng},
                        aRoomFromEachBuilding, reqBody.distance, 'walking');
                }).then(result => {
                let responseObject = new ResponseObject(200, result);
                fulfill(responseObject);
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
                    "GET": ["courses_instructor", "courses_dept", "courses_id", "courses_title", "courses_fail", "courses_pass", 'courses_Section'],
                    "WHERE": {},
                    "AS" : "TABLE"
                }
                this.performQuery(courseQuery).then(result => {
                   fulfill(result);
                }).catch(err=>{
                    reject(err);
                });
                // We want to do a number of queries and just get a ton of information from the current data set.
            });
    }
}
