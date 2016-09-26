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
      let dataset: any = this.datasets[0]
      let courseKeys: string[] = Object.keys(dataset);
      let allMatches: any[] = [];
      for(let courseKey in courseKeys) {
       let matches: any[] = this.filterCourseResults(query.WHERE, courseKey, dataset[courseKey]);
       // combine matches in other courses
       allMatches.concat(matches);
      }
      // ORDER
      // BUILD
      return { render: 'TABLE', result: [] };
    }

    public filterCourseResults(queryfilter: IFilter, courseKey: string, courseDataSet: any): Object[] {
      // for each result in each course, add to results array if it matches
      // query conditions
      // translatekey as needed
      let matches: any[] = [];
      for(let courseData in courseDataSet) {
        this.queryResult(queryfilter, courseKey, courseData);
      }
      return matches;
    }

    public queryResult(queryfilter: any, courseKey: string, courseData: any): boolean {
      // apply query on a result in a Course
      // return true if it matches the query
      let queryKeys: string[] = Object.keys(queryfilter);
      for(let queryKey in queryKeys) {
        switch(queryKey) {
          case "AND":
          return this.queryResult(queryfilter["AND"][0], courseKey, courseData)
          && this.queryResult(queryfilter["AND"][1], courseKey, courseData);

          case "OR":
          return this.queryResult(queryfilter["OR"][0], courseKey, courseData)
          || this.queryResult(queryfilter["OR"][1], courseKey, courseData);

          case "NOT":
          return !this.queryResult(queryfilter["NOT"], courseKey, courseData)

          case "LT":
          return this.numberCompare(queryfilter["LT"], "LT", courseData);

          case "GT":
          return this.numberCompare(queryfilter["GT"], "GT", courseData);

          case "EQ":
          return this.numberCompare(queryfilter["GT"], "GT", courseData);

          case "IS":
          return this.stringCompare(queryfilter["IS"], "IS", courseData);
        }
      }
      return false;
    }

    public numberCompare(col: IMComparison, operation: string, courseData: any): boolean {
      let colName: string = Object.keys(col)[0];
      let queryColValue: number = col[0];
      let courseColValue: number = courseData[this.translateKey(colName)];
      switch(operation) {

        case "LT":
        return courseColValue < queryColValue;

        case "GT":
        return courseColValue > queryColValue;

        case "EQ":
        return courseColValue == queryColValue;

        default:
        return false;
      }
    }

    public stringCompare(col: ISComparison, operation: string, courseData: any): boolean {
      let colName: string = Object.keys(col)[0];
      let queryColValue: string = col[0];
      let courseColValue: string = courseData[this.translateKey(colName)];
      switch(operation) {

        case "IS":
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
