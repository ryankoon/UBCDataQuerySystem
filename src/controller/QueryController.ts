/**
 * Created by rtholmes on 2016-06-19.
 */
import {Datasets} from "./DatasetController";
import Log from "../Util";
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
  result: any[];
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

    public query(query: QueryRequest): QueryResponse {
      Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
      // FILTER
      // get first dataset for now
      let dataset: any = this.getStringIndexValueByNumber(this.datasets, 0);
      let courseKeys: string[] = Object.keys(dataset);

      console.log("dataset: " + dataset);
      console.log("courseKeys: " + courseKeys);

      let allMatches: any[] = [];
      courseKeys.forEach((courseKey) => {
        let matches: any[] = this.filterCourseResults(query.WHERE, courseKey, dataset[courseKey]["results"]);
        // combine matches in other courses
        allMatches = allMatches.concat(matches);
      });
      // ORDER
      // BUILD

      console.log("allMatches: " + allMatches);
      return { render: 'TABLE', result: allMatches };
    }

    public filterCourseResults(queryfilter: IFilter, courseKey: string, courseDataSet: any): Object[] {
      // for each result in each course, add to results array if it matches
      // query conditions
      // translatekey as needed
      // courseDataSet accessed with Hardcoded Key "results"
      console.log("filtering course: " + courseKey);
      let matches: any[] = [];
      courseDataSet.forEach((courseData: any) => {
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

    public queryResult(queryfilter: any, courseKey: string, courseData: any): boolean {
      // apply query on a result in a Course
      // return true if it matches the query
      console.log("filtering a  course result: " + JSON.stringify(courseData));
      let result: boolean = false;
      let queryKeys: string[] = Object.keys(queryfilter);
      queryKeys.forEach((queryKey) => {
        switch(queryKey) {
          case "AND":
          console.log("AND case");
          result = this.queryResult(this.getStringIndexValueByNumber(queryfilter["AND"], 0),
          courseKey, courseData)
          && this.queryResult(this.getStringIndexValueByNumber(queryfilter["AND"], 1),
          courseKey, courseData);
          break;

          case "OR":
          console.log("OR case");
          result = this.queryResult(this.getStringIndexValueByNumber(queryfilter["OR"], 0),
          courseKey, courseData)
          || this.queryResult(this.getStringIndexValueByNumber(queryfilter["OR"], 1),
          courseKey, courseData);
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

      console.log("Return result: " + result);
      return result;
    }

    public numberCompare(col: IMComparison, operation: string, courseData: any): boolean {
      let colName: string = Object.keys(col)[0];
      let queryColValue: number = this.getStringIndexValueByNumber(col, 0);
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

    public stringCompare(col: ISComparison, operation: string, courseData: any): boolean {
      let colName: string = Object.keys(col)[0];
      let queryColValue: string = this.getStringIndexValueByNumber(col, 0);
      let courseColValue: string = courseData[this.translateKey(colName)];
      switch(operation) {

        case "IS":
        console.log(courseColValue + " is " + queryColValue + "?");
        return courseColValue == queryColValue;

        default:
        return false;
      }
    }

    public orderDataset(filteredData: {}): Object[] {
      // implement sort method and pass in method to be able to compare letters
      // TODO
      let matches: Object[] = []
      return matches;
    }

    public buildDataset(orderedDataSet: {}): Object[] {
      //create new objects based on given columns and return format.
      // TODO
      let matches: Object[] = []
      return matches;
    }

    public getStringIndexValueByNumber(object: any, index: number) {
      let keys: string[] = Object.keys(object);
      if (keys && keys.length > index){
        return object[keys[index]];
      } else {
        return "";
      }
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
