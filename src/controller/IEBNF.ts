
export interface IMComparison {
  [colName: string]: number;
}

export interface ISComparison {
  // value may need to be of type any for wildcard
  [colName: string]: string;
}

export interface ILogicComparison {
  [filter: string]: IFilter;
}

export interface IFilter {
  AND?: IFilter[];
  OR?: IFilter[];
  NOT?: IFilter;
  LT?: IMComparison;
  GT?: IMComparison;
  EQ?: IMComparison;
  IS?: ISComparison;
}

export interface IOrderObject {
  dir: string;
  keys: string[];
}

export interface IApplyObject {
    [customKey: string]: IApplyTokenToKey;
}

export interface IApplyTokenToKey {
    MAX?: string;
    MIN?: string;
    AVG?: string;
    COUNT?: string;
}
