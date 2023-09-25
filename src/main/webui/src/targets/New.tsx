// Test a mantine modal

import {Button, Modal, NumberInput, Select, TextInput} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
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
                { // @ts-ignore
                    props.onSubmit?.('CANCEL' );
                }
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

    function createNewTarget(val :{ TargetName: string }, data: SimbadTargetResult) {
        const sourceCoords: EquatorialPoint = {
            "@type": "coords:EquatorialPoint",
            coordSys: {},
            lat: {"@type": "ivoa:RealQuantity", value: data.raDegrees, unit: {value: "degrees"}},
            lon: {"@type": "ivoa:RealQuantity", value: data.decDegrees, unit: {value: "degrees"}}
        }
        const Target: CelestialTarget = {
                "@type": "proposal:CelestialTarget",
                sourceName: data.targetName,
                sourceCoordinates: sourceCoords,
                positionEpoch: {value: data.epoch}
        };

        function assignSpaceSys(ss: SpaceSys) {
            if(Target.sourceCoordinates != undefined)
                if(Target.sourceCoordinates.coordSys != undefined)
                    Target.sourceCoordinates.coordSys = ss;
        }

        if(data.spaceSystemCode != undefined) {
            fetchSpaceSystemResourceGetSpaceSystem({pathParams: {frameCode: data.spaceSystemCode}})
                .then((spaceSys) => assignSpaceSys(spaceSys))
                .then(() => fetchProposalResourceAddNewTarget({pathParams:{proposalCode: Number(selectedProposalCode)}, body: Target})
                    .then(() => {return queryClient.invalidateQueries()})
                    .then(() => {props.onSubmit?.(val)})
                    .catch(console.log)
                )
                .catch(console.log);
        } else {
            console.log("Unable to fetch space system, failed :-(")
        }

    }

    const handleSubmit = form.onSubmit((val) => {
        form.validate();

        const target: SimbadTargetResult = {
            targetName: form.values.TargetName,
            spaceSystemCode: 'ICRS',
            epoch: form.values.SelectedEpoch,
            raDegrees: form.values.RA,
            decDegrees: form.values.Dec
        };

        createNewTarget({ TargetName: form.values.TargetName }, target);
    });

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="name of target"
                {...form.getInputProps("TargetName")} />
            <Button onClick={simbadLookup}>Lookup</Button>
            <NumberInput
                withAsterisk
                label={"RA"}
                precision={5}
                step={0.00001}
                min={0}
                max={360}
                stepHoldDelay={500}
                stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                {...form.getInputProps("RA")}/>
            <NumberInput
                withAsterisk
                label={"Dec"}
                precision={5}
                step={0.00001}
                min={-90}
                max={90}
                stepHoldDelay={500}
                stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                {...form.getInputProps("Dec")} />
            <Select
                label={"Coordinate System"}
                data={[{label:"J2000",value:"J2000"}]}
                {...form.getInputProps("SelectedEpoch")} />
            <div>
                <Button type="submit">Submit</Button>
            </div>
        </form>
    );
};

export default function AddTargetPanel() {
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
    onSubmit?: (values: T, form?: UseFormReturnType<T>) => void;
    actions?: ReactNode;
};

