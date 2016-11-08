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
     * Adapted from: https://nodejs.org/api/http.html#http_http_get_options_callback
     * @param address - E.g. 6245 Agronomy Road V6T 1Z4 (Note: address does not have city or province)
     * @returns {Promise<T>}
     */
    public getGeoInfo(address: string): Promise<GeoResponse> {
        let http = require('http');
        let webServiceURL = this.getWebServiceURL(address);
        return new Promise((resolve, reject) => {

            http.get(webServiceURL, (res: any) => {
                const statusCode = res["statusCode"];

                if (statusCode !== 200) {
                    reject(statusCode);
                }

                res.setEncoding('utf8');
                let rawData = '';
                let latLon: IObject;

                res.on('data', (chunk: any) => rawData += chunk);
                res.on('end', () => {
                    try {
                        latLon = JSON.parse(rawData);
                    } catch (e) {
                        reject(e.message);
                    }
                    let geoResponse: GeoResponse = {};
                    geoResponse.lat = latLon["lat"];
                    geoResponse.lon = latLon["lon"];
                    resolve(geoResponse);
                });
            }).on('error', (e: any) => {
                reject(e.message);
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
