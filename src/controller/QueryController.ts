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
        var queryMessage : string;
        queryMessage = JSON.stringify(query);
        // TODO: implement this
        Log.trace('here is query message ' + queryMessage);
        return {status: 'received', ts: new Date().getTime()};
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
