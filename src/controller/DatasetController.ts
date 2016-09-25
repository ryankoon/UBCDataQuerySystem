/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

export default class DatasetController {

    private datasets: Datasets = {};

    constructor() {
        Log.trace('DatasetController::init()');
    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): any {
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.

        return this.datasets[id];
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

        return this.datasets;
    }
    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
      var that = this;
      return new Promise(function (fulfill, reject) {
        try {
        let processedDataset : {[key:string]:string}  = {};
          let myZip = new JSZip();
          myZip.loadAsync(data, {base64: true})
          .then(function processZipFile(zip: JSZip) {
              Log.trace('DatasetController::process(..) - unzipped');
              let zipObject  = zip.files;
              var rootFolder:string = Object.keys(zipObject)[0];
              delete zipObject[rootFolder];

              // keeps track of all promises for each file as it is being stored
              // in the dictionary
              let filePromises: Promise<any>[] = [];

              for (let filePath in zipObject){
                var fileName:string;
                var splitPath:Array<string>;
                var parsedFileName:string;

                splitPath = zipObject[filePath]['name'].split(rootFolder);
                // only remove root folder path if file is not in root folder
                // e.g. list_courses is not in the courses folder
                if (splitPath[0] == rootFolder) {
                  delete splitPath[0];
                }

                parsedFileName = splitPath.join("");

                let filePromise: Promise<any> = new Promise((fulfill, reject) => {
                  let pfn = parsedFileName;
                  zipObject[filePath].async('text')
                  .then(function storeDataFromFilesInDictionary(data) {
                    processedDataset[pfn] = data;
                    // file can now be accessed in dictionary
                    fulfill();
                  })
                  .catch(function errorFromFailingToStoreInDict(err) {
                    Log.error('Error! : ' + err);
                    reject();
                  });
                });

                filePromises.push(filePromise);
              }

              // wait until all files have been processed and stored in dictionary
              Promise.all(filePromises)
              .then(() => {
                that.save(id, processedDataset);
                fulfill(true);
              });
            })
            .catch(function (err) {
              Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
              reject(err);
            });
          }
        catch (err) {
            Log.trace('DatasetController::process(..) - ERROR: ' + err);
            reject(err);
        }
      });
    }
    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // TODO:
        /**
        For this task, what needs to be done:
        (1) Check the directory is there.
        (2) If it isnt there, then create one.
        (3) Create a file with a buffer and take the contents from process and write to the file
        In the case the file exists already, overwrite the buffer.
        */
      //  console.log(JSON.stringify(processedDataset));
        Log.trace('DatasetController saving zip files to disk ...');
        this.datasets[id] = processedDataset;
        let dir:string = './data';
        let filePath:string;

        var checkDirectory:any = new Promise(function (fulfill, reject) {
          fs.stat(dir, function (err, stats) {
            if (err){
              reject(err);
            }
            if (stats && stats.isDirectory()){
              fulfill(stats.isDirectory());
            }
            else {
              fulfill(false);
            }
          });
        });

        var writeFile = new Promise(function (fulfill, reject) {
          fs.writeFile(dir, this.datasets[id], function (err, data){
            if (err){
              console.log('hi we have an error!');
            }
          });
        });

        var generateDirectory = new Promise(function (fulfill, reject){
          checkDirectory
          /*
          // TODO: implement directory creation in-case not provided.
          .then(function makeDirectory(success:boolean){
            if (!success){
              fs.mkdir(dir, function(err) {
                if (err){
                  reject(err);
                }
                fulfill(true);
              });
          }
          })
          */
          .then(function() {
            fs.writeFile(filePath, this.datasets[id], function (err, data){
              if (err){
                console.log('hi we have an error!');
              }
            });
          })
          .catch(function (err: string) {
            Log.error('Error when saving files: ' + err);
          })
        });

        /*
        fs.writeFile(‘id.json’, ‘data’, function err(err) {
	throw new Error(‘file writing was unsuccessful for new json file: ‘ + err)
});
*/
        // TODO: actually write to disk in the ./data directory
    }
  }
