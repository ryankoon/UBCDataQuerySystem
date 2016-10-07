/**
 * Created by alekhrycaiko on 2016-10-07.
 */
import Log from "../src/Util";
import 'chai';
import 'mocha';
import DatasetController from "../src/controller/DatasetController";

export default class testGlobals {

    constructor() {
        Log.trace('testGlobals is hit.');
    }

    public tearDownTestEnvironment(): void {
        // TODO: teardown tests
    }

    public setUpTestEnvironment(): void {
        // TODO: setup tests.
    }

    public deleteAllTestData(): Promise<boolean> {
        var fileArray = new Array();
        return new Promise(function (fulfill, reject) {
            let controller = new DatasetController();
            controller.getDatasets()
                .then(function (result) {
                    console.log(result);
                    fileArray = Object.keys(result);
                    fileArray.forEach(function (id, index) {
                        fileArray.push(controller.deleteDataset(id));
                    });
                }).then(function () {
                Promise.all(fileArray)
                    .then(function () {
                        fulfill(true);
                    })
                    .catch(function (err) {
                        Log.error('error with deleting test data' + err);
                        reject(false);
                    })
            })
        })
    }
}
