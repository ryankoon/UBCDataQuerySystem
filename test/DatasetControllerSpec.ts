/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";
import JSZip = require('jszip');
import {expect} from 'chai';
import fs = require('fs');
import testGlobals from '../test/TestGlobals';
import {Datasets} from "../src/controller/DatasetController";
import path = require('path');

describe("DatasetController", function () {
    let controller = new DatasetController();
    it("Should be able to receive a Dataset and save it", (done) => {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));


        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setA', data)
        })
            .then(function (result) {
                Log.test('Dataset processed; result: ' + result);
                expect(result === 204).to.be.true;
            }).then(function () {
                return zip.generateAsync(opts).then(function (data) {
                    Log.test('Dataset created');
                    return controller.process('setA', data);
                });
            }).then(function (result) {
                expect(result === 201).to.be.true;
                done();
            });

    });
    it('should not return the proper dataset', function () {
        controller.getDataset('setMalfoy')
            .then(function (data: any) {
                expect(data).to.deep.equal(null);
            });
    });

    it('Should be able to getdatasets from memory', (done) => {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setB', data)
        })
            .then(function (result) {
                Log.test('Dataset processed; result: ' + result);
                expect(result === 204).to.be.true;
            }).then(function () {
                return zip.generateAsync(opts).then(function (data) {
                    Log.test('Dataset created');
                    return controller.process('setC', data);
                })
            }).then(function () {
                return controller.getDatasets();
            }).then(function (out) {
                expect(out['setB']).to.be.instanceOf(Object);
                expect(out['setC']).to.be.instanceOf(Object);
                done();
            });
    });

    it('Should be able to getdataset (singular)', (done) => {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function () {
            return controller.getDataset('setD');
        }).then(function (out) {
            expect(out['item1ThatShouldExist']).to.be.instanceOf(Object);
            expect(out['item2ThatShouldExist']).to.be.instanceOf(Object);
            done();
        });
    });
    it('should get null from non-existant dataset', (done) => {
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        zip.file('item2ThatShouldExist', JSON.stringify(content2));

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function () {
            return controller.getDataset('malfoy');
        }).then(function (out) {
            expect(out).to.equal(null);
            done();
        });
    });
    it('should get data from file and return a 201', (done) => {
        let content0 = {'NewData': 'SomeData'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('item2ThatShouldExist', JSON.stringify(content2));
        zip.file('SomerandomfilenotNamedHankHill', JSON.stringify(content0));
        var controller = new DatasetController();

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            return controller.process('setD', data)
        }).then(function (result) {
            expect(result === 201).to.be.true;
            done();
        });
    });
    it('should delete setA', (done) => {
        controller.deleteDataset('setA')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    });
    it('should delete setB', (done) => {
        controller.deleteDataset('setB')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    });
    it('should delete setC', (done) => {
        controller.deleteDataset('setC')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    });
    it('should delete setD', (done) => {
        controller.deleteDataset('setD')
            .then(function (resultObj) {
                expect(resultObj.status === 204).to.be.true;
                done();
            });
    });
    it('should fail to delete setA', (done) => {
        controller.deleteDataset('setA')
            .then(function forceFail() {
                expect(true).to.not.be.true;
            })
            .catch(function (resultObj) {
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
    it('should fail to delete setB', (done) => {
        controller.deleteDataset('setB')
            .then(function forceFail() {
                expect(true).to.not.be.true;

            })
            .catch(function (resultObj) {
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
    it('should fail to delete setC', (done) => {
        controller.deleteDataset('setC')
            .then(function forceFail(resultObj) {
                expect(true).to.not.be.true;
            })
            .catch(function (resultObj) {
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });
    it('should fail to delete setD', (done) => {
        controller.deleteDataset('setD')
            .then(function () {
                expect(true).to.not.be.true;
            })
            .catch(function (resultObj) {
                expect(resultObj.status === 404).to.be.true;
                done();
            });
    });

    it("Should be able to load datasets into memory", (done) => {
        let controller = new DatasetController();
        controller.getDatasets()
            .then(function (datasets: Datasets) {
                expect(datasets).to.not.equal(null);
                done();
            }).catch(function (err) {
            expect(err).to.not.equal(null);
            done();
        });
    });

    it("Should be able to remove extensions", (done) => {
        let controller = new DatasetController();
        let result = controller.removeExtension("testFile.json");
        expect(result).to.be.equal("testFile");
        done();
    });

    it("Should be able to check for files with leading dots", (done) => {
        let controller = new DatasetController();
        let result = controller.leadingDotCheck([".test"]);
        expect(result).to.be.deep.equal([]);
        done();
    });

    it("getDatasets - TestFlag 1", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 1;
        controller.getDatasets()
            .then(function (datasets: Datasets) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            }).catch(err => {
            expect(err).to.not.equal(null);
            done();
        });
    });

    it("getDatasets - TestFlag 2", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 2;
        controller.getDatasets()
            .then(function (datasets: Datasets) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            }).catch(function (err) {
            expect(err).to.not.equal(null);
            done();
        });
    });

    it('getDataset - TestFlag 1', function (done) {
        let controller = new DatasetController();
        controller.testFlag = 1;
        controller.getDataset('setMalfoy')
            .then(function (data: any) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });
    });

    it('getDataset - TestFlag 2', function (done) {
        let controller = new DatasetController();
        after((done) => {
            controller.deleteDataset('GDTestFlag2').then(function (result) {
                done();
            });
        })
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.file('item1ThatShouldExist', JSON.stringify(content1));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('GDTestFlag2', data)
        }).then(function () {

            controller.testFlag = 2;
            controller.getDataset('GDTestFlag2')
                .then(function (data: any) {
                    expect(() => {
                        expect(false).to.be.true
                    }).to.throw();
                    done(new Error("Should Fail because of testFlag!"));
                })
                .catch(err => {
                    expect(err).to.not.equal(null);
                    done();
                });
        });
    });

    it('createDataDirectory - TestFlag 1', function (done) {

        // var fs = require('fs');
        // var deleteFolderRecursive = (path: string) => {
        //     if( path.length > 0 && fs.existsSync(path) ) {
        //         fs.readdirSync(path).forEach((file: any, index: any) => {
        //             var curPath = path + "/" + file;
        //             if(fs.lstatSync(curPath).isDirectory()) { // recurse
        //                 deleteFolderRecursive(curPath);
        //             } else { // delete file
        //                 fs.unlinkSync(curPath);
        //             }
        //         });
        //         fs.rmdirSync(path);
        //     }
        // };
        //
        // deleteFolderRecursive("/data");

        let controller = new DatasetController();
        controller.testFlag = 1;
        controller.createDataDirectory()
            .then(()=> {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });
    });

    it("process nonHTML - Testflag 1", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 1;
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.folder("testfolder").file("testfolderfile", content1);
        zip.folder("testfolder").file("testfolderfile", content2);

        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('set1', data)
        })
            .then(function (result) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });

    });

    it("process nonHTML - Testflag 2", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 2;
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.folder("testfolder").file("testfolderfile", JSON.stringify(content1));
        zip.folder("testfolder").file("testfolderfile2", JSON.stringify(content2));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            Log.test("testflag" + controller.testFlag);
            return controller.process('set2', data)
        })
        .then(function (result) {
            expect(() => {
                expect(false).to.be.true
            }).to.throw();
            done(new Error("Should Fail because of testFlag!"));
        })
        .catch(err => {
            expect(err).to.not.equal(null);
            done();
        });

    });

    it("process nonHTML - Testflag 3", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 3;
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.folder("testfolder").file("testfolderfile", JSON.stringify(content1));
        zip.folder("testfolder").file("testfolderfile2", JSON.stringify(content2));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            Log.test("testflag" + controller.testFlag);
            return controller.process('set2', data)
        })
            .then(function (result) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });

    });
    it("process nonHTML - Testflag 4", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 4;
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.folder("testfolder").file("testfolderfile", JSON.stringify(content1));
        zip.folder("testfolder").file("testfolderfile2", JSON.stringify(content2));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            Log.test("testflag" + controller.testFlag);
            return controller.process('set2', data)
        })
            .then(function (result) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });

    });
    it("process nonHTML - Testflag  5", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 5;
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('rootThatShouldBeDeleted', JSON.stringify(content0));
        zip.folder("testfolder").file("testfolderfile", JSON.stringify(content1));
        zip.folder("testfolder").file("testfolderfile2", JSON.stringify(content2));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            Log.test("testflag" + controller.testFlag);
            return controller.process('set2', data)
        })
            .then(function (result) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });

    });

    it("process HTML - Testflag 1", (done) => {
        let controller = new DatasetController();
        controller.testFlag = 1;
        Log.test('Creating dataset');
        let content0 = {'DonkeyLandThemeParkRide': 'RollerCoaster'};
        let content1 = {'Batmanvs': 'Superman'};
        let content2 = {'job': 'AtSomeCompanyIHope'};
        let zip = new JSZip();
        zip.file('index.htm', JSON.stringify(content0));
        zip.folder("testfolder").file("testfolderfile1.html", JSON.stringify(content1));
        zip.folder("testfolder").file("testfolderfile2.html", JSON.stringify(content2));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then((data) => {
            Log.test('Dataset created');
            Log.test("testflag" + controller.testFlag);
            return controller.process('set2', data)
        })
            .then(function (result) {
                expect(() => {
                    expect(false).to.be.true
                }).to.throw();
                done(new Error("Should Fail because of testFlag!"));
            })
            .catch(err => {
                expect(err).to.not.equal(null);
                done();
            });

    });

});

