import React, {useReducer} from "react";
import {formReducer} from "../App2";

function NewObservationPanel() {

    const [formData, setFormData] =
        useReducer(formReducer, {observationType:"Target", calibrationUse:"placeHolder"});

    function handleCreate(event: React.SyntheticEvent) {
        event.preventDefault();
        console.log("create pressed") //TODO: call the generated fetch(?) function to the API
    }

    function handleChange(event : React.SyntheticEvent) {
        setFormData({
            // @ts-ignore
            name: event.target.name,
            value: event.target.value,
        });
    }

    function DisplayObservationType() {
        return (
            <div className={"form-group"}>
                <p>Please select the type of Observation: </p>
                <div className="radio">
                    <label>
                        <input type="radio" value="Target" name={"observationType"}
                               checked={formData.observationType === "Target"}
                               onChange={handleChange}
                        />
                        Target
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" value="Calibration" name={"observationType"}
                               checked={formData.observationType === "Calibration"}
                               onChange={handleChange}
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
                <select defaultValue={formData.calibrationUse} className={"form-control"} name={"calibrationUse"} onChange={handleChange}>
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
        return (
            <div className={"form-group"}>
                Timing window here<br/>
            </div>
        )
    }

    function DisplayTarget() {
        return (
            <div className={"form-group"}>
                Target selection here<br/>
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


    return (
        <div className={""}>
            <h3>Create an Observation</h3>
            <form>
                <DisplayObservationType/>

                {formData.observationType === "Calibration" &&
                    <DisplayCalibrationUse/>
                }

                <DisplayTimingWindow/>

                <DisplayTarget/>

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