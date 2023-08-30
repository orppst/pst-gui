// Test a mantine modal

import {Modal, NumberInput, Select, TextInput} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {ReactNode, useContext, useState} from "react";

import {
    CartesianCoordSpace,
    CelestialTarget,
    CoordSys,
    EquatorialPoint,
    SpaceFrame
} from "../generated/proposalToolSchemas.ts";
import {
    fetchProposalResourceAddNewTarget,
    fetchSimbadResourceSimbadFindTarget
} from "../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {ProposalContext} from "../App2.tsx";

/*
    Could use Aladin lite, Simbad, or http://www.skymaponline.net resources here?

 */

const TargetForm = (props: FormPropsType<{ TargetName: string, lat: number, lon: number , SpaceFrame: string}>) => {
    const form = useForm({
        initialValues: props.initialValues ?? {
            TargetName: "",
            lat: 0,
            lon: 0,
            SpaceFrame: "",
            boo: "BOO!"
        },
        validate: {
            TargetName: (value) => (value.length < 1 ? 'Name cannot be blank ' : null),
            lat: (value: number) => (value < -90.0 || value > 90.0 ? 'Lat must be within +/-90°' : null),
            lon: (value: number) => (value < -180.0 || value > 180.0 ? 'Lon must be within +/-180°' : null),
        }
    });
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useContext(ProposalContext);

    const handleSubmit = form.onSubmit((val) => {
        form.validate();
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
            lat: {"@type": "ivoa:RealQuantity", value: form.values.lat, unit: {value: "degrees"}},
            lon: {"@type": "ivoa:RealQuantity", value: form.values.lon, unit: {value: "degrees"}}
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

        fetchSimbadResourceSimbadFindTarget({queryParams: {targetName: form.values.TargetName}})
            .then((data) => {console.log(data)});

        fetchProposalResourceAddNewTarget({pathParams:{proposalCode: selectedProposalCode}, body: Targ})
            .then(() => {return queryClient.invalidateQueries()})
            .then(() => {props.onSubmit?.(val)})
            .catch(console.log);

    });

    const [spaceFrame, setSpaceFrame] = useState( "");

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="name of target"
                {...form.getInputProps("TargetName")} />
            <NumberInput
                withAsterisk
                label="Latitude"
                precision={5} min={-90.0} max={90.0} step={0.00001}
                {...form.getInputProps("lat")} />
            <NumberInput
                withAsterisk
                label="Longitude"
                precision={5} min={-180.0} max={180.0} step={0.00001}
                {...form.getInputProps("lon")} />
            <Select  label="Space frame"
                     placeholder="Pick one"
                     data={[
                         { value: 'ICRS', label: 'ICRS' },
                         { value: 'GEOCENTRIC', label: 'Geocentric' },
                     ]}
                     />
            <TextInput name={"Boo!"} {...form.getInputProps("boo")} />
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
            <Modal title="New target    " opened={opened} onClose={close}>
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

