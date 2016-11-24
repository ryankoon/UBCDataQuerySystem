/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');
import path = require('path');
import InsightFacade from '../controller/InsightFacade';
import {QueryRequest, default as QueryController} from "../controller/QueryController";
import Log from '../Util';

export default class RouteHandler {

    public static deleteDataset(req: restify.Request, res:restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::deleteDataSet(..) - params: ' + JSON.stringify(req.params.id));
        var id: string = req.params.id;
        try {
            let controller = new InsightFacade();
            controller.removeDataset(id)
                .then( (result) => {
                    res.json(result.code,result.body);
                    return next();

                })
                .catch( (err) => {
                    res.json(err.code,err.body);
                    return next();

                });
        }
        catch (err) {
            res.send(400, 'ERROR: ' + err);
            return next();
        }
    }

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static getUIPage(req : restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::getUIPage(..)');
        fs.readFile('./src/rest/views/ui.html', 'utf8', function (err: Error, file: Buffer) {
           if (err){
               res.send(500);
               Log.error(JSON.stringify(err));
               return next();
           }
           res.write(file);
           res.end();
           return next();
        });
    }


    public static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;
            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);
                let controller = new InsightFacade();

                controller.addDataset(id, req.body)
                    .then(function (result) {
                        res.json(result.code, result.body);
                        return next();
                    }).catch(function (err) {
                    Log.trace('RouteHandler::postDataset.addDataset(..) - ERROR: ' + err.message);
                        res.json(err.code, err.body);
                        return next();
                    });
            });
        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
            return next();
        }
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        //   Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;
            let controller = new InsightFacade();
            let queryController = new QueryController();
            let isValidResult: boolean | string = queryController.isValid(query);
            if (queryController.isValid(query) === true){
            controller.performQuery(query)
                .then(function (result) {
                    res.json(result.code, result.body);
                    return next();
                })
                .catch(function (err) {
                    res.json(err.code, err.body);
                    return next();
                });
            }
            else{
                res.json(400, {error : isValidResult});
                return next();
            }
        }
        catch (err){
            Log.error('RouteHandler::postQuery(...) - ERROR' + err);
            res.json(403, err);
            return next();
        }
    }

    public static getRoomInformation (req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let controller = new InsightFacade();
            controller.getRoomInformation()
                .then(function (result) {
                    res.json(result.code, result.body);
                    return next();
                }).catch(function (err){
                    res.json(400, {error : 'Error accessing room info due to invalid data'})
            });
        }
        catch (err) {
            res.json(400, {error : 'Failed trying to get room information'});
            return next();
        }
    };
    public static getCourseInformation (req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let controller = new InsightFacade();
            controller.getCourseInformation()
                .then(function (result) {
                    res.json(result.code, result.body);
                    return next();
                }).catch(function (err){
                res.json(400, {error : 'Error accessing course info due to invalid data'})
            });
        }
        catch (err) {
            res.json(400, {error : 'Failed trying to get course information'});
            return next();
        }
    };
    public static handleRoomExploration(req : restify.Request, res : restify.Response, next : restify.Next){
        try {
            console.log(req.params);
            res.json(200, req.params);
        }
        catch (err){

        }
    }
    public static handleCourseExploration(req : restify.Request, res : restify.Response, next : restify.Next){
        try {
            console.log(req.params);
            res.json(200, req.params);
        }
        catch (err){

        }
    }
}
