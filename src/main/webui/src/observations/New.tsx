import {ChangeEvent, SyntheticEvent, useState} from "react";

function NewObservationPanel() {

    const [formData, setFormData] =
        useState( {
            observationType:"Target",
            calibrationUse:"placeHolder",
            targetName: "",
            targetLongitude: 0,
            targetLatitude: 0,
            targetSpaceFrame:"placeHolder",
            targetPositionEpoch:"placeHolder"
        });

    function handleCreate(event:SyntheticEvent) {
        event.preventDefault();
        console.log(formData) //TODO: call the generated fetch(?) function to the API
    }


    function handleEvent(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
        setFormData({
            ...formData,
            [event.currentTarget.name] : event.currentTarget.value
        });
    }


    //The input type number allows for scientific notation
    // i.e., '[+,-] <mantissa> [e,E] [+,-] <exponent>'
    // restricting the input to contain a maximum of two sign characters and one 'e/E' character.
    // However, there are seemingly no restrictions on WHERE the '+/-' or 'e/E' characters can be inserted
    // into the input, with the exception that character following the 'e/E' must be a sign or a numeric and
    // after that character no more sign characters can be used. This means we could receive the following
    // input:
    // '+', '++', '-', '--', 'e+', 'e-', '+e+', '-e-', '<N>-<M>-<P>' plus other variations of these.
    //
    // For example, an input of '123-45+678' can be passed but is clearly meaningless in this context.

    function handleCoordinateChange (event : ChangeEvent<HTMLInputElement>) {
        const {value, min, max} = event.currentTarget;

        // check for null value such that coordinate isn't set to zero, which prevents the user
        // from entering a sign symbol on subsequent input
        const coordinate = !value ? "" : Math.max(+min, Math.min(+max, +value)).toString();

        //regex: optional +- then any number of digits finally limit to five decimal places if any
        if (!coordinate || coordinate.match(/^[-+]?\d+(\.\d{0,5})?$/)) {
            setFormData({
                ...formData,
                [event.currentTarget.name] : coordinate
            });
        }
    }

    function DisplayObservationType() {
        return (
            <div className={"form-group"}>
                <p>Please select the type of Observation: </p>
                <div className="radio">
                    <label>
                        <input type="radio" value="Target" name={"observationType"}
                               checked={formData.observationType === "Target"}
                               onChange={handleEvent}
                        />
                        Target
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" value="Calibration" name={"observationType"}
                               checked={formData.observationType === "Calibration"}
                               onChange={handleEvent}
                        />
                        Calibration
                    </label>
                </div>
                Observation type is: {formData.observationType}<br/>
            </div>
        )
    }

    function DisplayCalibrationUse() {
        return (
            <div className={"form-group"}>
                <label>Calibration intended use:</label>
                <select defaultValue={formData.calibrationUse} className={"form-control"}
                        name={"calibrationUse"} onChange={handleEvent}>
                    <option value="placeHolder" disabled hidden>
                        --calibration intended use--
                    </option>
                    <option value="AMPILTUDE">Amplitude</option>
                    <option value="ATMOSPHERIC">Atmospheric</option>
                    <option value="BANDPASS">Bandpass</option>
                    <option value="PHASE">Phase</option>
                    <option value="POINTING">Pointing</option>
                    <option value="FOCUS">Focus</option>
                    <option value="POLARIZATION">Polarization</option>
                    <option value="DELAY">Delay</option>
                </select>
                Calibration intended use is: {formData.calibrationUse}
            </div>
        )
    }

    function DisplayTimingWindow() {
        //start time: java util Date
        //end time: java util Date
        //note: String
        //isAvoidConstraint: boolean

        return (
            <div className={"form-group"}>
                Timing window here<br/>
            </div>
        )
    }

    function DisplayTarget() {

        // source name - string
        // source coordinates - longitude, latitude, space frame
        // position epoch e.g., J2000.0

        function TargetName() {
            return (
                <div className={"form-group"}>
                    <label>Target name</label>
                    <input className={"form-control"} name={"targetName"} onChange={handleEvent} />
                </div>
            )
        }

        function TargetCoordinates() {
            return (
                <div className={"form-group"}>
                    <label>longitude in degrees, range [-180.,+180.]</label>
                    <input className={"form-control"} name={"targetLongitude"} type="number"
                           min="-180.0" max="180.0" step="0.00001"
                           value={formData.targetLongitude}
                           onChange={handleCoordinateChange} />

                    <label>latitude in degrees, range [-90.,+90.]</label>
                    <input className={"form-control"} name={"targetLatitude"} type="number"
                           min="-90.0" max="90.0" step="0.00001"
                           value={formData.targetLatitude}
                           onChange={handleCoordinateChange} />

                    <label>space frame</label>
                    <select defaultValue={formData.targetSpaceFrame} className={"form-control"}
                            name={"targetSpaceFrame"}
                            onChange={handleEvent}>
                        <option value="placeHolder" disabled hidden>
                            --target space frame--
                        </option>
                        <option value="ICRS">ICRS</option>
                        <option value={"GEOCENTRIC"}>Geocentric</option>
                    </select>
                </div>
            )
        }

        function TargetPositionEpoch() {
            return (
                <div className={"form-group"}>
                    <label>position epoch</label>
                    <select defaultValue={formData.targetPositionEpoch} className={"form-control"}
                            name={"targetPositionEpoch"} onChange={handleEvent}>
                        <option value="placeHolder" disabled hidden>
                            --target position epoch--
                        </option>
                        <option value="J2000.0">J2000.0</option>
                        <option value="B1950.0">B1950.0</option>
                    </select>
                </div>
            )
        }

        return (
            <div>
                Specify a target:<br />
                {TargetName()}
                {TargetCoordinates()}
                <TargetPositionEpoch />
            </div>
        )
    }

    function DisplayField() {
        return (
            <div className={"form-group"}>
                Field input here<br/>
            </div>
        )
    }

    function DisplayTechnicalGoal()  {
        return (
            <div className={"form-group"}>
                Technical Goal input here<br/>
            </div>
        )
    }


    //curly brace call is required due to how React triggers a render of a form
    return (
        <div className={""}>
            <h3>Create an Observation</h3>
            <form>
                <DisplayObservationType/>

                {formData.observationType === "Calibration" &&
                    <DisplayCalibrationUse/>
                }

                <DisplayTimingWindow/>

                {DisplayTarget()}

                <DisplayField/>

                <DisplayTechnicalGoal/>

                <button className="btn btn-default" onClick={handleCreate}>
                    Create
                </button>
            </form>
        </div>
    )
}

export default NewObservationPanel;