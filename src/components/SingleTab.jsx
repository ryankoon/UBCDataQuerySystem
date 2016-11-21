"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
//TODO: REPLACE ALL THIS. THIS IS TEMPORARY SETUP FOR WEBPACK/REACT
// TODO: Props should change by state.
// TODO: need to setup content via this.props
var SingleTab = (function (_super) {
    __extends(SingleTab, _super);
    function SingleTab() {
        _super.apply(this, arguments);
    }
    SingleTab.prototype.render = function () {
        return (<li role="tab" tab-attr={this.state}>
                <a onClick={this.handleClick} href="#">  {this.props.name} </a>
            </li>);
    };
    SingleTab.prototype.handleClick = function (e) {
        e.preventDefault();
        this.props.handleClick();
    };
    return SingleTab;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SingleTab;
