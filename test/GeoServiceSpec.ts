/**
 * Created by Ryan on 11/7/2016.
 */
import GeoService from "../src/controller/GeoService";
import {expect} from 'chai';
import {GeoResponse} from "../src/controller/GeoService";

describe("GeoService", function () {

    it ("Should correctly encode address and return webservice url to get latlon", function() {
        let geoService = new GeoService();
        let address = "6245 Agronomy Road V6T 1Z4";
        let expectedResult = "http://skaha.cs.ubc.ca:8022/api/v1/team52/6245%20Agronomy%20Road%20V6T%201Z4";

        let result = geoService.getWebServiceURL(address);
        expect(result).to.be.equal(expectedResult);
    });

    it ("Should return a GeoResponse with LatLon if the address is valid.", function (done) {
        let geoService = new GeoService();
        let address = "6245 Agronomy Road V6T 1Z4";
        let expectedResult: GeoResponse = {
            lat: 49.26125,
            lon: -123.24807
        };

        let result: any;
        geoService.getGeoInfo(address)
            .then((response: GeoResponse) => {
                result  = response;
                expect(result).to.be.deep.equal(expectedResult);
                done();
            })
            .catch((err) => {
                result = err;
                expect(true).to.not.be.true;
                done();
            });
    });

    it ("Should return an error if address is invalid", function (done) {
        let geoService = new GeoService();
        let address = "624512 Agronomy";

        let result: any;
        geoService.getGeoInfo(address)
            .then((response: GeoResponse) => {
                result  = response;
                expect(true).to.not.be.true;
                done();
            })
            .catch((err) => {
                result = err;
                done();
            });
    });


});