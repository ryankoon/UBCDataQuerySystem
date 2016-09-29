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

    /*
    Does the directory eist on disk?
    Yes? Then load the data into memory.
    No? Then return null.

     */

    private loadDataIntoMemory(id : string) : any{
        var that = this;
        return new Promise(function (fulfill, reject){
            let path:string = './data/' + id + ".json";
            fs.readFile(path, (err, data) => {
                if (err) {
                    console.log('HI I GOT REJECTED: ' + err);
                    reject(err);
                }
                try {
                    // we have a buffer here..sad story
                    // Uint8Array[67]
                    let out = JSON.parse(data.toString('utf8'));
                    that.datasets[id] = out
                    fulfill(that.datasets[id]);
                }
                catch(err){
                    console.log('errrored out in get');
                    reject('Error : ' + err);
                }
            });
        });
    }


    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): Promise<any> {
      console.log("GetDataset datasets: " + JSON.stringify(this.datasets));
        var that = this;
      return new Promise( (fulfill, reject) => {
        Log.trace('Entering getDataset ...');
        fs.readdir('./data', (err, files) => {
          if (err){
            reject(err);
          }
          if (files.indexOf(id + '.json') === -1){
            fulfill(null);
          }
           that.loadDataIntoMemory(id)
               .then(function (data:any) {
                   fulfill(data);
               })
               .catch(function (err:any){
                   reject(err);
               });
        });
      });
    }
    /*
    @function parses out the last '.ext'.
     */
    private removeExtension(nameWithExtension: string) : string {
        let fileName:string = nameWithExtension.substr(0, nameWithExtension.lastIndexOf('.'));
        return fileName;
    }
    /*
    @function removes files that lead with dot resulting from fs usage.
     */
    private leadingDotCheck(list : Array<any>): Array<any>{
        let newList = list;
        let leadingDotCheck : RegExp = new RegExp('/^[.]/', 'g');
        newList.forEach( (item, index) => {
            if (leadingDotCheck.test(item)){
                newList.splice(index, 1);
            }
        });
        return newList;
    }
    /**
    @function: if datasets is empty, load all dataset files in ./data from disk
     Used to have a DataSets return value... but i dont think that's correct...
    */
    public getDatasets(): Promise<Datasets> {
        //setup loadData promise function.
        return new Promise((fulfill, reject) => {
            var that = this;
            let keysArray = Object.keys(that.datasets);
            if (keysArray.length === 0) {
                fs.readdir('./data', (err, files) => {
                    if (err) {
                        Log.error('oh noes an err: ' + err);
                        reject(err);
                    }
                    let promiseArray = new Array();
                    files = that.leadingDotCheck(files);
                    files.forEach((key, index) => {
                        let fileIdName:string = that.removeExtension(key);
                        promiseArray.push(that.loadDataIntoMemory(fileIdName));
                    });
                    Promise.all(promiseArray)
                        .then(() => {
                            fulfill(this.datasets);
                        })
                        .catch((err) => {
                            Log.error('Uhoh promise array failed to resolve');
                            reject(err);
                        });
                });

            } else {
                fulfill(that.datasets);
            }
        });
    }

    /**
     * Delete the targeted dataset from memory.
     *
     * Returns: Boolean.
     */
    public deleteDataset(id: string) : void {
        delete this.datasets[id];
    }

    // !!! how do we know the ID is new?
    // new is 204
    // old is 201 (prev cached or on the disk).
    // This will determine our Code.
    // I think if the zip ISNT base 64 encoded, we should throw an error.


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
          let myZip = new JSZip();
          myZip.loadAsync(data, {base64: true})  // TODO: look at myZip.loadAsync, perhaps it has a config I can use.
          .then(function processZipFile(zip: JSZip) {
              let processedDataset : {[key:string]:string}  = {};
              Log.trace('DatasetController::process(..) - unzipped');
              var fileKeys = Object.keys(zip.files);
              if (fileKeys.length <= 1) {
                  reject('Error this zip has no content in it');
              }
              let zipObject  = zip.files;
              let rootFolder:string = Object.keys(zipObject)[0];
              delete zipObject[rootFolder]
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
                    let file = parsedFileName;
                    zipObject[filePath].async('string')
                  .then(function storeDataFromFilesInDictionary(data) {
                      try {
                          processedDataset[file] = JSON.parse(data); // we parse it into json... will succed
                          fulfill();
                      }
                      catch(err) {
                          Log.error('Error for the parsing of JSON in Process: ' + err);
                          reject(err);
                      }
                    // file can now be accessed in dictionary
                  })
                  .catch(function errorFromFailingToStoreInDict(err) {
                    Log.error('Error! : ' + err);
                    reject(false);
                  });
                });

                filePromises.push(filePromise);
              }
              // i dont think this has to wait.... does it?

              // wait until all files have been processed and stored in dictionary
              Promise.all(filePromises)
              .then(() => {
                that.save(id, processedDataset);
                fulfill(true);
              });
            })
            .catch(function (err) {
              Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
              reject(false);
            });
          }
        catch (err) {
            Log.trace('DatasetController::process(..) - ERROR: ' + err);
            reject(false);
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
      fs.writeFile('./data/' + id + '.json', jsonData,(err) => {
        if (err){ Log.trace('Writefile error! ' + err);}
      });
    }
  }
