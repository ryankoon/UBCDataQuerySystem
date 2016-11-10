
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController";
import DatasetController from '../controller/DatasetController';
import Log from '../Util';
import {Datasets} from "./DatasetController";

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
        return new Promise( (fulfill, reject) => {
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
                            error: err
                    };
                    let errorResponseObject : InsightResponse = new ResponseObject(400, errBody);
                    reject(errorResponseObject);
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
        })
    }

}