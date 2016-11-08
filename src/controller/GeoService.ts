import {IObject} from "./IObject";
/**
 * Created by Ryan on 11/7/2016.
 */

export interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class GeoService{

    /**
     * Given an address, makes a webservice call that returns a GeoResponse Object
     * @param address - E.g. 6245 Agronomy Road V6T 1Z4 (Note: address does not have city or province)
     * @returns {Promise<T>}
     */
    public getGeoInfo(address: string): Promise<GeoResponse> {
        let request = require('request');
        let webServiceURL = this.getWebServiceURL(address);

        return new Promise((resolve, reject) => {
            request(webServiceURL, (error: any, response: any, body: any) => {
                if (!error && response.statusCode === 200) {
                    let latLon: IObject;

                    try {
                        latLon = JSON.parse(body);
                    } catch (err) {
                        reject(err);
                    }

                    let geoResponse: GeoResponse = {};
                    geoResponse.lat = latLon["lat"];
                    geoResponse.lon = latLon["lon"];
                    resolve(geoResponse);

                } else if (body && body.error) {
                    reject(body.error);
                } else {
                    reject(error);
                }
            });
        });
    }


    /**
     * Given a URL-endoded version of an address, returns API URL to call to get a GeoResponse
     * @param address
     * @returns {string}
     */
    public getWebServiceURL(address: string): string {
        return "http://skaha.cs.ubc.ca:8022/api/v1/team52/" + encodeURIComponent(address);
    }
}
