import {SyntheticEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

/*
    Could use http://www.skymaponline.net to show target?
    Could use Aladin lite to locate target?

 */

function AddTargetPanel() {
    const [formData, setFormData] = useState( {type: "CelestialTarget"});
    const navigate = useNavigate();

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    function handleChange(event : SyntheticEvent<HTMLInputElement|HTMLSelectElement>) {
        setFormData({
            ...formData,
            [event.currentTarget.name] : event.currentTarget.value
        });
    }

    function handleAdd(event: SyntheticEvent) {
        event.preventDefault();

        console.log("Add new target coming soon!");
        navigate(  "../", {relative:"path"});
    }

    return (
        <div>
            <h3>Add New Target Coming soon!</h3>
            <form>
                <div className={"form-group"}>
                    <label>Type</label>
                    <select className={"form-control"} name="type" onChange={handleChange}>
                        <option value="CelestialTarget">Celestial</option>
                    </select>
                </div>
                <button className={"btn btn-primary"} onClick={handleAdd}>Add</button>
            </form>
            <button className={"btn"} onClick={handleCancel}>Cancel</button>
        </div>
    );
}

export default AddTargetPanel