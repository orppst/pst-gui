// Test a mantine modal

import {Button, Modal, NumberInput, Select, TextInput} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {ReactNode} from "react";

import {
    CelestialTarget,
    EquatorialPoint, SimbadTargetResult, SpaceSys,
} from "../generated/proposalToolSchemas.ts";
import {
    fetchProposalResourceAddNewTarget,
    fetchSimbadResourceSimbadFindTarget, fetchSpaceSystemResourceGetSpaceSystem
} from "../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useParams} from "react-router-dom";

const TargetForm = (props: FormPropsType<{
        SelectedEpoch: string;
        RA: number;
        Dec: number;
        TargetName: string }>) => {
    const form = useForm({
            initialValues: props.initialValues ?? {
                TargetName: "",
                RA: 0.00,
                Dec: 0.00,
                SelectedEpoch: "J2000"
            },
            validate: {
                TargetName: (value) => (value.length < 1 ? 'Name cannot be blank ' : null)
            }
        });
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();

    function simbadLookup() {
        function notFound() {
            const choice = window.confirm("Unable to match source " + form.values.TargetName + " try again?");
            if(!choice)
                props.onSubmit();
        }

        fetchSimbadResourceSimbadFindTarget({queryParams: {targetName: form.values.TargetName}})
            .then((data : SimbadTargetResult) => {
                console.log(data);
                form.setFieldValue('RA', data.raDegrees?data.raDegrees:0);
                form.setFieldValue('Dec', data.decDegrees?data.decDegrees:0);
                form.setFieldValue('SelectedEpoch', data.epoch!);
            })
            .catch(() => notFound());
    }

    const createNewTarget = form.onSubmit((val) => {
        const sourceCoords: EquatorialPoint = {
            "@type": "coords:EquatorialPoint",
            coordSys: {},
            lat: {"@type": "ivoa:RealQuantity", value: val.RA, unit: {value: "degrees"}},
            lon: {"@type": "ivoa:RealQuantity", value: val.Dec, unit: {value: "degrees"}}
        }
        const Target: CelestialTarget = {
                "@type": "proposal:CelestialTarget",
                sourceName: val.TargetName,
                sourceCoordinates: sourceCoords,
                positionEpoch: {value: val.SelectedEpoch}
        };

        function assignSpaceSys(ss: SpaceSys) {
            if(Target.sourceCoordinates != undefined)
                if(Target.sourceCoordinates.coordSys != undefined)
                    Target.sourceCoordinates.coordSys = ss;
        }

        fetchSpaceSystemResourceGetSpaceSystem({pathParams: {frameCode: 'ICRS'}})
            .then((spaceSys) => assignSpaceSys(spaceSys))
            .then(() => fetchProposalResourceAddNewTarget({pathParams:{proposalCode: Number(selectedProposalCode)}, body: Target})
                .then(() => {return queryClient.invalidateQueries()})
                .then(() => {props.onSubmit()})
                .catch(console.log)
            )
            .catch(console.log);

    });

    return (
        <form onSubmit={createNewTarget}>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="name of target"
                {...form.getInputProps("TargetName")} />
            <Button onClick={simbadLookup}>Lookup</Button>
            <NumberInput
                required={true}
                label={"RA"}
                decimalScale={5}
                step={0.00001}
                min={0}
                max={360}
                allowNegative={false}
                suffix="°"
                stepHoldDelay={500}
                stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                formatter={(value: string) =>
                    !Number.isNaN(parseFloat(value))
                        ? `${value}°`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                        : ' °'}
                {...form.getInputProps("RA")}/>
            <NumberInput
                required={true}
                label={"Dec"}
                decimalScale={5}
                step={0.00001}
                min={-90}
                max={90}
                suffix="°"
                stepHoldDelay={500}
                stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                formatter={(value: string) =>
                    !Number.isNaN(parseFloat(value))
                        ? `${value}°`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                        : ' °'}
                {...form.getInputProps("Dec")} />
            <Select
                label={"Coordinate System"}
                data={[{label:"J2000",value:"J2000"}]}
                {...form.getInputProps("SelectedEpoch")} />
            <div>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};

export default function AddTargetModal() {
    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <Button onClick={open}>Add New</Button>
            <Modal title="New target" opened={opened} onClose={close}>
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
    onSubmit: () => void;
    actions?: ReactNode;
};

