/**
 * Created by Ryan on 11/23/2016.
 */

import Log from "../Util";
import {QueryResponse} from "./QueryController";
import {IRoom} from "./IBuilding";

export interface latLon {
    lat: number,
    lon: number
}

export interface gDistanceRequest {
    origin: string,
    destination: string,
    mode: string,
    units: string
}

export interface gDistanceResponse {
    index: number,
    distance: string,
    distanceValue: number,
    duration: string,
    durationValue: number,
    origin: string,
    destination: string,
    mode: string,
    units: string,
    language: string,
    avoid: string,
    sensor: boolean
}

export default class DataController {

    constructor() {
        Log.trace('DataController::init()');
    }

    public roomsWithinDistance(from: latLon, rooms: IRoom[], distance: number, travelBy: string): Promise<IRoom[]> {
        return new Promise((resolve, reject) => {

            let fromArr: latLon[] = [from];
            let toArr: latLon[] = [];

            rooms.forEach((room: IRoom) => {
                if (room.lat && room.lon) {
                    let aLatLon = {
                        lat: room.lat,
                        lon: room.lon
                    }
                    toArr.push(aLatLon)
                }
            });
            this.makeGDistanceRequest(fromArr, toArr, travelBy)
                .then((result: gDistanceResponse[]) => {
                    if (result){
                        if (result.length !== rooms.length) {
                            reject("Number of distance results from google does not match number of rooms!");
                        } else {
                            let roomsNearby: IRoom[] = [];

                            result.forEach((response: gDistanceResponse, index: number) => {
                                if (response.distanceValue <= distance) {
                                    let travelModeColumnName: string = travelBy + "_distance";
                                    rooms[index].traveldistance = response.distanceValue;
                                    roomsNearby.push(rooms[index]);
                                }
                            });
                            resolve(roomsNearby);
                        }
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public makeGDistanceRequest(fromArr: latLon[], toArr: latLon[], mode: string): Promise<gDistanceResponse[]> {
        return new Promise ((resolve, reject) => {
            const apiKey = 'AIzaSyBlMhLjn3J1r5A6f0H28dVZSsLx9OmHOXY';
            let gDistance = require('google-distance');
            gDistance.apiKey = apiKey;

            let fromStringArr = fromArr.map((from: latLon) => {
                return this.latLontoString(from);
            });
            let toStringArr = toArr.map((to: latLon) => {
                return this.latLontoString(to);
            });

            gDistance.get(
                {
                    origins: fromStringArr,
                    destinations: toStringArr,
                    mode: mode,
                    units: 'metric'
                },
                (err: any, data: gDistanceResponse) => {
                    if (err) {
                        reject("Error making google distance request: " + err);
                    } else {
                        resolve(data);
                    }

                });

        });
    }

    private latLontoString(latlon: latLon): string {
        let result = "";

        if (latlon.lat && latlon.lon) {
            result = latlon.lat.toString().trim() + "," + latlon.lon.toString().trim();
        }
        return result;
    }
}