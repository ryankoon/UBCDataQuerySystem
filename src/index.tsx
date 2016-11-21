/**
 * Created by alekspc on 2016-11-16.
 */
/*
TODO: REPLACE ALL THIS. THIS IS TEMPORARY SETUP FOR WEBPACK/REACT
 */

import * as React from "react";
import * as ReactDOM from "react-dom";

import {App} from "./components/App";


ReactDOM.render(
    <App compiler="TypeScript" framework="React" />,
    document.getElementById("reacts-render-id"));