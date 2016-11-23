import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';

import FormControl = ReactBootstrap.FormControl;
import ControlLabel = ReactBootstrap.ControlLabel;
import FormGroup = ReactBootstrap.FormGroup;
import Button = ReactBootstrap.Button;
export class RoomForm extends React.Component<any, any> {
    constructor(props : any){
    super (props)
    }
    render() {
        return (
            <FormGroup>
                <ControlLabel> Building Name </ControlLabel>
                <FormControl id="buildingName" componentClass="textarea" placeholder="textarea">
                </FormControl>

                <ControlLabel> Furniture Type </ControlLabel>
                <FormControl componentClass="textarea" placeholder="textarea">
                </FormControl>

                <ControlLabel> RoomType </ControlLabel>
                <FormControl componentClass="textarea" placeholder="textarea">
                </FormControl>

                <ControlLabel> Within Distance </ControlLabel>
                <FormControl componentClass="textarea" placeholder="textarea">
                </FormControl>

                <ControlLabel> Within Size </ControlLabel>
                <FormControl componentClass="textarea" placeholder="textarea">
                </FormControl>

                <Button type="submit"> Submit </Button>
            </FormGroup>
            );
    }

        }