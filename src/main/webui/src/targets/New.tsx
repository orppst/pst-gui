import {SyntheticEvent, useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    CartesianCoordSpace,
    CelestialTarget,
    CoordSys,
    EquatorialPoint,
    SpaceFrame
} from "../generated/proposalToolSchemas.ts";
import {fetchProposalResourceAddNewTarget} from "../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {ProposalContext} from "../App2.tsx";

/*
    Could use http://www.skymaponline.net to show target?
    Could use Aladin lite to locate target?

 */

function AddTargetPanel() {
    const [formData, setFormData] = useState( {type: "CelestialTarget"});
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { selectedProposalCode} = useContext(ProposalContext);

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

        const coordSpace: CartesianCoordSpace = {
            "@type": "coords:CartesianCoordSpace",
            "axis": []
        }

        const frame: SpaceFrame = {
            "@type": "coords:SpaceFrame",
            "spaceRefFrame": "ICRS",
            "equinox": {},
            "planetaryEphem": ""
        }

        const coordSys: CoordSys = {
            "@type": "coords:SpaceSys",
            // FIXME shouldn't have hard coded value
            "_id": 2,
            coordSpace: coordSpace,
            frame: frame
        }

        const sourceCoords: EquatorialPoint = {
            "@type": "coords:EquatorialPoint",
            coordSys: coordSys,
            lat: {"@type": "ivoa:RealQuantity", value: Math.floor(Math.random()*180), unit: {value: "degrees"}},
            lon: {"@type": "ivoa:RealQuantity", value: Math.floor(Math.random()*90), unit: {value: "degrees"}}
        }

        const Targ: CelestialTarget = {
            "@type": "proposal:CelestialTarget",
            sourceName: "Random fake source #"+Math.floor(Math.random()*999),
            sourceCoordinates: sourceCoords,
            positionEpoch: {value: "J2000.0"},
            "pmRA": {"@type": "ivoa:RealQuantity", unit: {}, value: 0},
            "pmDec": {"@type": "ivoa:RealQuantity", unit: {}, value: 0},
            "parallax": {"@type": "ivoa:RealQuantity", unit: {}, value: 0},
            "sourceVelocity": {"@type": "ivoa:RealQuantity", unit: {}, value: 0}
        }

        console.log(JSON.stringify(Targ,null,2));

        fetchProposalResourceAddNewTarget({pathParams:{proposalCode: selectedProposalCode}, body: Targ})
            .then(() => {return queryClient.invalidateQueries()})
            .then(() => navigate(  "../", {relative:"path"}))
            .catch(console.log);

    }

    return (
        <div>
            <h3>Add a random fake target</h3>
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