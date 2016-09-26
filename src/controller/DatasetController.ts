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
      return new Promise( (fulfill, reject) => {
        Log.trace('Entering getDataset ...');
        fs.readdir('./data', (err, files) => {
          if (err){
            reject(null);
          }
          if (files.indexOf(id) === -1){
            fulfill(null);
          }
          let path:string = './data/' + id;
          fs.readFile(path, (err, data) => {
            if (err) {
              reject(null);
            }
            this.datasets[id] = data;
            fulfill(this.datasets[id]);
          });
        });
      });
    }
    /**
    @function: if datasets is empty, load all dataset files in ./data from disk
    */
    public getDatasets(): Datasets {
        //setup loadData promise function.
        var loadDataFromDisk = new Promise(function (fulfill, reject) {
        let promiseArr:Promise<any>[] = [];

        fs.readdir('./data', function (err, files) {
          files.forEach(function (file, index) {
            // remove .json from file.
            let fileId:string = file.slice(0, -5);
            let path:string = './data/' + file;
            let filePromise = new Promise( (fulfill, reject) => {
              fs.readFile(path, (err, data) => {
                if (err) {
                  reject(err);
                }
                this.datasets[fileId] = data;
              });
            });
            // need to get ID from file.
            // need to get data from file.
            promiseArr.push(filePromise);

          });
          Promise.all(promiseArr)
          .then(() => {
            fulfill(true);
          });
        });
      });
        if (Object.keys(this.datasets).length === 0) {
          loadDataFromDisk
          .then(function () {
            return this.datasets;
          });
        }
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
        Log.trace('DatasetController saving zip files to disk ...');
        this.datasets[id] = processedDataset;
        let jsonData:string = JSON.stringify(this.datasets[id]);
        let pathToData:string = './data';
        let filePath:string;

      let checkDirExists = function () {
        try {
          return fs.statSync(pathToData).isDirectory();
        } catch (e) {
          if (e.code === 'ENOENT') {
            console.log("ENOENT - directory does not exist")
           return false;
          } else {
            Log.trace('StatSync error! ' + e);
            //  throw e;
            return false;
          }
        }
      }

      let directoryCreation = function () {
        if (!checkDirExists()) {
            Log.trace('Directory for data is being created ...');
            fs.mkdirSync(pathToData);
        }
      }

      directoryCreation();
      fs.writeFile('./data/' + id + '.json', jsonData, (err) => {
        if (err){ Log.trace('Writefile error! ' + err);}
      });
    }
  }
