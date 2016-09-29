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
    WHERE: IFilter;
    ORDER: string;
    AS: string;
}

export interface QueryResponse {
  render: string;
  result: IObject[];
}

export default class QueryController {
    private dataset: IObject = null;

    constructor(dataset?: IObject) {
        this.dataset = dataset;
    }

    public setDataset(dataset: IObject) {
      this.dataset = dataset;
    }

    public isValid(query: QueryRequest): boolean | string {
        if (typeof query === 'undefined') {
          return 'Query is undefined!';
        } else if (query === null) {
          return 'Query is null!';
        } else if (Object.keys(query).length === 0) {
          return 'Query is empty!';
        } else if (query.GET && query.GET.length === 0) {
          return 'Query GET does not have any keys!'
        } else if (query.ORDER && query.ORDER.length === 1) {
          // are the keys in ORDER also in GET?
          let result: boolean = true;
          if (query.GET.length === 1) {
            result = query.GET[0] === query.ORDER;
          } else {
            let queryGETArray: string[] = <string[]> query.GET;
            queryGETArray.forEach((getKey: string) => {
              result = result && getKey === query.ORDER;
            });
          }
            if (result === false) {
              // stop finding on first key that cannot be found in GET
              // behaviour similar to arrayFirst
                return 'A key in ORDER does not exist in GET!';
            }
        } else if (!query.AS) {
          return "Query AS has not been defined!";
        } else if (query.AS && query.AS !== 'TABLE') {
          return "Query AS must be 'TABLE'!"
        }

        return true;
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
      let isValidQuery: boolean | string = this.isValid(query);
      if (isValidQuery === true) {

        // 1. FILTER
        let courses: string[] = Object.keys(this.dataset);
        let allCourseResults: IObject[] = [];
        let filteredResults: IObject[];

        console.log("dataset: " + JSON.stringify(this.dataset));
        console.log("courseKeys: " + courses);

        courses.forEach((course) => {
          // combine results of all courses
          let courseResults: IObject;
          courseResults = this.dataset[course]["result"];
          if (courseResults) {
              allCourseResults = allCourseResults.concat(courseResults);
          }
        });

        filteredResults = this.filterCourseResults(query.WHERE, allCourseResults);


        // 2. ORDER
        // 3. BUILD
        console.log("# of Matches: " + filteredResults.length);
        console.log("allMatches: " + JSON.stringify(filteredResults));
        return { render: 'TABLE', result: filteredResults};

      }  else {
        throw new Error(<string> isValidQuery);
      }
    }

    public filterCourseResults(queryFilter: IFilter, allCourseResults: IObject[]): IObject[] {
      // for each courseResult, add to results array if it matches
      // query conditions
      // translatekey as needed
      let queryFilterMatches: IObject[] = [];

      allCourseResults.forEach((courseResult: IObject) => {
        let queryResult: boolean = this.queryACourseResult(queryFilter, courseResult);
        console.log("course result satisfies query?: " + queryResult);

        if (queryResult !== null) {
          if(queryResult) {
          // add courseResult to matches collection
          queryFilterMatches.push(courseResult);
          console.log("pushed courseResult: " + queryFilterMatches);
          }
        } else {
          throw new Error('No match result returned from queryResult on courseResult!')
        }
      });

      return queryFilterMatches;
    }

    public queryACourseResult(queryFilter: IFilter, courseResult: IObject): boolean {
      // apply query on a result in a Course
      // return true if it matches the query
      //console.log("filtering a  course result: " + JSON.stringify(courseData));
      console.log("queryfilter: " + JSON.stringify(queryFilter));
      let result: boolean;
      let queryKeys: string[] = Object.keys(queryFilter);

      queryKeys.forEach((queryKey) => {
        let keyValue: IObject;
        let newQueryFilter1: IObject;
        let newQueryFilter2: IObject;
        switch(queryKey) {
          case "AND":
          console.log("AND case");
          let ANDResult: boolean = true;
          queryFilter.AND.forEach((filter) => {
            ANDResult = ANDResult && this.queryACourseResult(filter, courseResult);
          });
          result = ANDResult;
          break;

          case "OR":
          console.log("OR case");
          let ORResult: boolean = false;
          queryFilter.OR.forEach((filter) => {
            ORResult = ORResult || this.queryACourseResult(filter, courseResult);
          });
          result = ORResult;
          break;

          case "NOT":
          console.log("NOT case");
          result = !this.queryACourseResult(queryFilter.NOT, courseResult);
          break;

          case "LT":
          console.log("LT case");
          result = this.numberCompare(queryFilter.LT, "LT", courseResult);
          break;

          case "GT":
          console.log("GT case");
          result = this.numberCompare(queryFilter.GT, "GT", courseResult);
          break;

          case "EQ":
          console.log("EQ case");
          result = this.numberCompare(queryFilter.EQ, "EQ", courseResult);
          break;

          case "IS":
          console.log("IS case");
          result = this.stringCompare(queryFilter.IS, "IS", courseResult);
          break;

          default:
          console.log("Default case");
          result = false;
          break;
        }
      });
      return result;
    }

    public numberCompare(queryKeyWithDatasetIDAndValue: IMComparison, operation: string, courseResult: IObject): boolean {
      let queryKeyWithDatasetID: string = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["key"];

      let queryKey: string = this.getQueryKey(queryKeyWithDatasetID);
      let queryKeyValue: number = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["value"];
      // translate querykey to corresponding datasetkey
      let dataKeyValue: number = courseResult[this.translateKey(queryKey)];
      switch(operation) {

        case "LT":
        console.log(dataKeyValue + " is less than " + queryKeyValue + "?");
        return dataKeyValue < queryKeyValue;

        case "GT":
        console.log(dataKeyValue + " is greater than " + queryKeyValue + "?");
        return dataKeyValue > queryKeyValue;

        case "EQ":
        console.log(dataKeyValue + " is equal to" + queryKeyValue + "?");
        return dataKeyValue == queryKeyValue;

        default:
        return false;
      }
    }

    public stringCompare(queryKeyWithDatasetIDAndValue: ISComparison, operation: string, courseResult: IObject): boolean {
      let queryKeyWithDatasetID: string = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["key"];

      let queryKey: string = this.getQueryKey(queryKeyWithDatasetID);
      let queryKeyValue: number = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["value"];
      // translate querykey to corresponding datasetkey
      let dataKeyValue: number = courseResult[this.translateKey(queryKey)];
      switch(operation) {

        case "IS":
        console.log(dataKeyValue + " is " + queryKeyValue + "?");
        return dataKeyValue === queryKeyValue;

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
    public translateKey(queryKey: string): string {
      let result: string;

      switch(queryKey) {
        case 'dept':
          result = 'Subject';
          break;

        case 'id':
          result = 'Course';
          break;

        case 'avg':
          result = 'Avg';
          break;

        case 'instructor':
          result = 'Professor';
          break;

        case 'title':
          result = 'Title';
          break;

        case 'pass':
          result = 'Pass';
          break;

        case 'fail':
          result = 'Fail';
          break;

        case 'audit':
          result = 'Audit';
          break;

        default:
          result = 'unknownKey'
          break
      }

      return result;
    }
}
