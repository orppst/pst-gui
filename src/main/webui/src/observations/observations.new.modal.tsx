import {Button, Group, Modal, Select} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {useContext} from "react";
import {useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {ProposalContext} from "../App2.tsx";

const ObservationForm = () => {
    const form = useForm({
        initialValues: {
            observationType:'Calibration',
            calibrationUse:'placeHolder',
            targetName: '',
            targetLongitude: 0,
            targetLatitude: 0,
            targetSpaceFrame:'placeHolder',
            targetPositionEpoch:'placeHolder',
        },

        validate: {

        },
    });

    function SelectTargets() {

        const { selectedProposalCode} = useContext(ProposalContext);

        const { data: targets , error } =
            useProposalResourceGetTargets({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )
        }

        let selectTargets = targets?.map((target) => {
            return {
                value: target.dbid,
                label: target.name
            }
        })

        return (
            <>
                {selectTargets ?
                    <Select
                        label={"Observation target: "}
                        placeholder={"pick one"}
                        searchable
                        data={selectTargets}
                        {...form.getInputProps('targetName')}
                        required
                    />
                    : null
                }
            </>
        )
    }

    function SelectObservationType() {
        return (
            <Select
                label={"Observation type: "}
                placeholder={"please select the observation type"}
                data = {[
                    'Calibration', 'Target'
                ]}
                {...form.getInputProps('observationType')}
            />
        )
    }

    function SelectCalibrationUse()
    {
        //maxDropDownHeight to limit scrollable height less than the modal height otherwise gets clipped
        return (
            <Select
                label={"Calibration intended use: "}
                placholder={"please select the calibration intended use"}
                maxDropdownHeight={100}
                data = {[
                    'Amplitude',
                    'Atmospheric',
                    'Bandpass',
                    'Phase',
                    'Pointing',
                    'Focus',
                    'Polarization',
                    'Delay'
                ]}
                {...form.getInputProps('calibrationUse')}
            />
        )
    }

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            {SelectTargets()}
            {SelectObservationType()}

            {form.values.observationType === 'Calibration' &&
                SelectCalibrationUse()
            }


            <Group position="right" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
}


export default function ObservationsNewModal() {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <Button onClick={open}>Create new observation</Button>
            <Modal
                opened={opened}
                onClose={close}
                centered
            >
                <ObservationForm/>
            </Modal>
        </>
    );
}