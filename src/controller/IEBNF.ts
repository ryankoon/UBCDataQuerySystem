
export interface IMComparison {
  [colName: string]: number;
}

export interface ISComparison {
  // assuming that we will ignore any asterisk before and/or after string value
  [colName: string]: string;
}

export interface ILogicComparison {
  [filter: string]: IFilter;
}

export interface IFilter {
  AND?: IFilter;
  OR?: IFilter;
  NOT?: IFilter;
  LT?: IMComparison;
  GT?: IMComparison;
  EQ?: IMComparison;
  IS?: ISComparison;
}
