/**
 * Created by rtholmes on 2016-06-19.
 */
import {Datasets} from "./DatasetController";
import Log from "../Util";
import {IObject} from "./IObject";
import {IMComparison} from "./IEBNF";
import {ISComparison} from "./IEBNF";
import {ILogicComparison} from "./IEBNF";
import {IFilter} from "./IEBNF";

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string;
    AS: string;
}

export interface QueryResponse {
  render: string;
  result: IObject[];
}

export default class QueryController {
    private datasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    /**
     * Splits the key (refer to EBNF for definition of key) into two parts:
     * 1. DatasetId   2.QueryKey (e.g. Professor)
     * 'courses_id' will be split into 'courses' and 'id'
     *
     * @param key
     */
    public splitKey(key: string): string[] {
      let parts: string[] = [];
      if (key) {
      parts = key.split('_');
      }
      return parts;
    }

    public getDatasetId(key: string) {
      let datasetId: string = '';
      let keyParts: string[] = this.splitKey(key);
      // make sure key is not null
      if (keyParts.length === 2) {
        datasetId = keyParts[0];
      }
      return datasetId;
    }

    // remove the first part of key to get the column name
    // e.g. courses_avg -> avg
    public getQueryKey(key: string) {
      let queryKey: string = '';
      let keyParts: string[] = this.splitKey(key);
      // make sure key is not null
      if (keyParts.length === 2) {
        queryKey = keyParts[1];
      }
      return queryKey;
    }

    public query(query: QueryRequest): QueryResponse {
      Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
      //get dataset based on first item in GET array.
      let dataset: IObject;
      // make sure there is at least one key in GET
      if (query.GET && query.GET.length > 0) {
        let firstGETKey: string = query.GET[0];
        let datasetId: string = this.getDatasetId(firstGETKey);
        if (datasetId != '') {
          //TODO call getDataset from DatasetController
          dataset = this.getStringIndexKVByNumber(this.datasets, 0)["value"];
        }

      } else {
        throw new Error("No columns have been defined in GET!");
      }

      // FILTER
      let courseKeys: string[] = Object.keys(dataset);

      console.log("dataset: " + dataset);
      console.log("courseKeys: " + courseKeys);

      let allMatches: IObject[] = [];
      courseKeys.forEach((courseKey) => {
        let matches: IObject[] = this.filterCourseResults(query.WHERE, courseKey, dataset[courseKey]["results"]);
        // combine matches in other courses
        allMatches = allMatches.concat(matches);
      });
      // ORDER
      // BUILD

      console.log("allMatches: " + JSON.stringify(allMatches));
      return { render: 'TABLE', result: allMatches };
    }


    public filterCourseResults(queryfilter: IFilter, courseKey: string, courseDataSet: IObject[]): IObject[] {
      // for each result in each course, add to results array if it matches
      // query conditions
      // translatekey as needed
      // courseDataSet accessed with Hardcoded Key "results"
      console.log("filtering course: " + courseKey);
      let matches: IObject[] = [];
      courseDataSet.forEach((courseData: IObject) => {
        let result: boolean = this.queryResult(queryfilter, courseKey, courseData);
        console.log("course match result: " + result);
        if (result) {
          // add coursedata (ie. a result in course object) to matches collection
          matches.push(courseData);
          console.log("pushed course match: " + matches);
        }
      });
      return matches;
    }

    public queryResult(queryfilter: IObject, courseKey: string, courseData: IObject): boolean {
      // apply query on a result in a Course
      // return true if it matches the query
      //console.log("filtering a  course result: " + JSON.stringify(courseData));
        console.log("queryfilter: " + JSON.stringify(queryfilter));
      let result: boolean;
      let queryKeys: string[] = Object.keys(queryfilter);
      queryKeys.forEach((queryKey) => {
        let keyValue: IObject;
        let newQueryFilter1: IObject;
        let newQueryFilter2: IObject;
        switch(queryKey) {
          case "AND":
          console.log("AND case");
          keyValue = this.getStringIndexKVByNumber(queryfilter["AND"], 0);
          newQueryFilter1 = this.buildObject([keyValue["key"]], [keyValue["value"]]);
          keyValue = this.getStringIndexKVByNumber(queryfilter["AND"], 1);
          newQueryFilter2 = this.buildObject([keyValue["key"]], [keyValue["value"]]);
          result = this.queryResult(newQueryFilter1, courseKey, courseData)
          && this.queryResult(newQueryFilter2, courseKey, courseData);
          break;

          case "OR":
          console.log("OR case");
          keyValue = this.getStringIndexKVByNumber(queryfilter["OR"], 0);
          newQueryFilter1 = this.buildObject([keyValue["key"]], [keyValue["value"]]);
          keyValue = this.getStringIndexKVByNumber(queryfilter["OR"], 1);
          newQueryFilter2 = this.buildObject([keyValue["key"]], [keyValue["value"]]);
          result = this.queryResult(newQueryFilter1, courseKey, courseData)
          || this.queryResult(newQueryFilter2, courseKey, courseData);
          break;

          case "NOT":
          console.log("NOT case");
          result = !this.queryResult(queryfilter["NOT"], courseKey, courseData);
          break;

          case "LT":
          console.log("LT case");
          result = this.numberCompare(queryfilter["LT"], "LT", courseData);
          break;

          case "GT":
          console.log("GT case");
          result = this.numberCompare(queryfilter["GT"], "GT", courseData);
          break;

          case "EQ":
          console.log("EQ case");
          result = this.numberCompare(queryfilter["GT"], "GT", courseData);
          break;

          case "IS":
          console.log("IS case");
          result = this.stringCompare(queryfilter["IS"], "IS", courseData);
          break;

          default:
          console.log("Default case");
          result = false;
          break;
        }
      });
      return result;
    }

    public numberCompare(col: IMComparison, operation: string, courseData: IObject): boolean {
      let colName: string = Object.keys(col)[0];
      let queryColValue: number = this.getStringIndexKVByNumber(col, 0)["value"];
      let courseColValue: number = courseData[this.translateKey(colName)];
      switch(operation) {

        case "LT":
        console.log(courseColValue + " is less than " + queryColValue + "?");
        return courseColValue < queryColValue;

        case "GT":
        console.log(courseColValue + " is greater than " + queryColValue + "?");
        return courseColValue > queryColValue;

        case "EQ":
        console.log(courseColValue + " is equal to" + queryColValue + "?");
        return courseColValue == queryColValue;

        default:
        return false;
      }
    }

    public stringCompare(col: ISComparison, operation: string, courseData: IObject): boolean {
      let colName: string = Object.keys(col)[0];
      let queryColValue: string = this.getStringIndexKVByNumber(col, 0)["value"];
      let courseColValue: string = courseData[this.translateKey(colName)];
      switch(operation) {

        case "IS":
        console.log(courseColValue + " is " + queryColValue + "?");
        return courseColValue == queryColValue;

        default:
        return false;
      }
    }

    public orderDataset(filteredData: {}): IObject[] {
      // implement sort method and pass in method to be able to compare letters
      // TODO
      let matches: Object[] = []
      return matches;
    }

    public buildDataset(orderedDataSet: {}): IObject[] {
      //create new objects based on given columns and return format.
      // TODO
      let matches: Object[] = []
      return matches;
    }

    public getStringIndexKVByNumber(object: IObject, index: number): IObject {
      let keys: string[] = Object.keys(object);
      if (keys && keys.length > index){
        return {
          key: keys[index],
          value: object[keys[index]]
        };
      } else {
        console.log("index greater than number of keys!", "object: " + JSON.stringify(object), "index: " + index);
        return {key: "", value: ""};
      }
    }

    public buildObject(keys: string[], values: IObject[]){
      //length of keys must be equal to the length of values
      let newObject: IObject = {};
      for(let i = 0; i < keys.length; i++){
        if (values[i]) {
          newObject[keys[i]] = values[i];
        }
      }
      return newObject;
    }
    /**
     * Translates the keys in the query to the corresponding keys in the dataset
     * parses department and course id given the key of the current iteration in dataset
     *
     * @param queryKey
     * @param objectKey?
     */
    public translateKey(queryKey: string, objectKey?: string): string {
      let dept: string;
      let id: string;
      let result: string;

      if (objectKey) {
        // may be better to move this out to utility class
        let keyParts: string[] = objectKey.match(/([A-Za-z]+)([0-9]+)/);
        // make sure objectKey is valid in the format:
        // <dept><courseId>
        if (keyParts && keyParts.length == 3) {
          dept = keyParts[1];
          id = keyParts[2];
        }
        console.log("dept: " + dept);
        console.log("id: " + id);
      }

      switch(queryKey) {
        case 'courses_dept':
          result = (dept)? dept : 'unknownDept';
          break;

        case 'courses_id':
          result = (id)? id: "unknownId";
          break;

        case 'courses_avg':
          result = 'Avg';
          break;

        case 'courses_instructor':
          result = 'Professor';
          break;

        case 'courses_title':
          result = 'Title';
          break;

        case 'courses_pass':
          result = 'Pass';
          break;

        case 'courses_fail':
          result = 'Fail';
          break;

        case 'courses_audit':
          result = 'Audit';
          break;

        default:
          result = 'unknownKey'
          break
      }

      return result;
    }
}
