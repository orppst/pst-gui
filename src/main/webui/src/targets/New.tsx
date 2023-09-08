// Test a mantine modal

import {Button, Modal, TextInput} from "@mantine/core";
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

const TargetForm = (props: FormPropsType<{ TargetName: string }>) => {
    const form = useForm({
        initialValues: props.initialValues ?? {
            TargetName: ""
        },
        validate: {
            TargetName: (value) => (value.length < 1 ? 'Name cannot be blank ' : null)
        }
    });
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();

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

        function notFound() {
            const choice = window.confirm("Unable to match source " + form.values.TargetName + " try again?");
            if(!choice)
                props.onSubmit?.(val);
        }

        fetchSimbadResourceSimbadFindTarget({queryParams: {targetName: form.values.TargetName}})
            .then((data : SimbadTargetResult) => createNewTarget(val, data))
            .catch(() => notFound());
    });

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="name of target"
                {...form.getInputProps("TargetName")} />
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

