// Test a mantine modal

import { Modal } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {ReactNode, useContext} from "react";

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
    Could use Aladin lite, Simbad, or http://www.skymaponline.net resources here?

 */

const TargetForm = (props: FormPropsType<{ TargetName: string }>) => {
    const form = useForm({
        initialValues: props.initialValues ?? {
            TargetName: ""
        }
    });
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useContext(ProposalContext);

    const handleSubmit = form.onSubmit((val) => {
        console.log(form.values);

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
            sourceName: form.values.TargetName,
            sourceCoordinates: sourceCoords,
            positionEpoch: {value: "J2000.0"},
            "pmRA": {"@type": "ivoa:RealQuantity", unit: {}, value: 0},
            "pmDec": {"@type": "ivoa:RealQuantity", unit: {}, value: 0},
            "parallax": {"@type": "ivoa:RealQuantity", unit: {}, value: 0},
            "sourceVelocity": {"@type": "ivoa:RealQuantity", unit: {}, value: 0}
        }

        fetchProposalResourceAddNewTarget({pathParams:{proposalCode: selectedProposalCode}, body: Targ})
            .then(() => {return queryClient.invalidateQueries()})
            .then(() => {props.onSubmit?.(val)})
            .catch(console.log);

    });

    return (
        <form onSubmit={handleSubmit}>
            <input {...form.getInputProps("TargetName")} />
            <div>
                <button type="submit">Submit</button>
            </div>
        </form>
    );
};

export default function AddTargetPanel() {
    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <button className={"btn btn-primary"} onClick={open}>Add New</button>
            <Modal title="Target name form" opened={opened} onClose={close}>
                <TargetForm
                    onSubmit={() => {
                        close();
                    }}
                />
            </Modal>
        </>
    );
}

export type FormPropsType<T> = {
    initialValues?: T;
    onSubmit?: (values: T, form?: UseFormReturnType<T>) => void;
    actions?: ReactNode;
};

