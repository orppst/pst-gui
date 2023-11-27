import {Modal, NumberInput, Select, TextInput, Grid} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { FormEvent, ReactElement, ReactNode, useRef } from 'react';
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
import AddButton from '../commonButtons/add';
import DatabaseSearchButton from '../commonButtons/databaseSearch';
import { SubmitButton } from '../commonButtons/save';
import AladinViewer from './aladin/AladinViewer.tsx';

/**
 * creates the target new page.
 *
 * @param {FormPropsType<newTargetData>} props the data required for the
 * target page.
 * @return {ReactElement} the dynamic html for the new target page.
 * @constructor
 */
const TargetForm = (props: FormPropsType<newTargetData>): ReactElement => {
    const form = useForm({
            initialValues: props.initialValues ?? {
                TargetName: "",
                RA: 0.00,
                Dec: 0.00,
                SelectedEpoch: "J2000",
                searching: false,
                lastSearchName: '',
            },
            validate: {
                TargetName: (value) => (
                    value.length < 1 ? 'Name cannot be blank ' : null),
                RA: (value) => (
                    value === null || value === undefined ?
                        'RA cannot be blank':
                        null)
            }
        });

    // create the database query client and get basic elements.
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();
    const targetNameRef = useRef(null);

    /**
     * executes a simbad query.
     */
    function simbadLookup() {
        function notFound() {
            const choice = window.confirm(
                "Unable to match source " + form.values.TargetName +
                " try again?");
            form.values.searching = false;
            if(!choice)
                props.onSubmit();
        }

        form.values.searching = true;
        form.values.lastSearchName = form.values.TargetName;
        fetchSimbadResourceSimbadFindTarget(
            {queryParams: {targetName: form.values.TargetName}})
            .then((data : SimbadTargetResult) => {
                console.log(data);
                form.setFieldValue('RA', data.raDegrees?data.raDegrees:0);
                form.setFieldValue('Dec', data.decDegrees?data.decDegrees:0);
                form.setFieldValue('SelectedEpoch', data.epoch!);
                form.values.searching = false;
            })
            .catch(() => notFound());
    }

    /**
     * saves the new target to the database.
     *
     * @param {newTargetData} val the new target data.
     */
    const saveToDatabase = (val: newTargetData) => {
        const sourceCoords: EquatorialPoint = {
            "@type": "coords:EquatorialPoint",
            coordSys: {},
            lat: {
                "@type": "ivoa:RealQuantity",
                value: val.RA, unit: { value: "degrees" }
            },
            lon: {
                "@type": "ivoa:RealQuantity",
                value: val.Dec, unit: { value: "degrees" }
            }
        }
        const Target: CelestialTarget = {
            "@type": "proposal:CelestialTarget",
            sourceName: val.TargetName,
            sourceCoordinates: sourceCoords,
            positionEpoch: { value: val.SelectedEpoch }
        };

        /**
         * assign the coord system to the target if feasible.
         * @param {SpaceSys} ss the coord system to set.
         */
        function assignSpaceSys(ss: SpaceSys) {
            if (Target.sourceCoordinates != undefined)
                if (Target.sourceCoordinates.coordSys != undefined)
                    Target.sourceCoordinates.coordSys = ss;
        }

        fetchSpaceSystemResourceGetSpaceSystem(
            {pathParams: { frameCode: 'ICRS'}})
            .then((spaceSys) => assignSpaceSys(spaceSys))
            .then(() => fetchProposalResourceAddNewTarget(
                {pathParams:{
                    proposalCode: Number(selectedProposalCode) },
                    body: Target})
                .then(() => {return queryClient.invalidateQueries()})
                .then(() => {props.onSubmit()})
                .catch(console.log)
            )
            .catch(console.log);
    }

    /**
     * handles the submission event.
     * @type {(event?: React.FormEvent<HTMLFormElement>) => void}
     */
    const handleSubmission: (event?: FormEvent<HTMLFormElement>) => void =
        form.onSubmit((val: newTargetData) => {
            if(document.activeElement === targetNameRef.current) {
                if (form.values.searching &&
                    val.TargetName === val.lastSearchName) {
                    // do nothing if were already searching.
                }
                else if (!form.values.searching &&
                        val.TargetName === val.lastSearchName) {
                    // if already searched and same name, assume submission
                    saveToDatabase(val);
                } else {
                    // name different, so do a simbad search.
                    simbadLookup();
                }
            } else {
                // not on target name, so assume submission
                saveToDatabase(val);
            }
    });

    return (
        <><Grid columns={4}>
            {/* handle aladin */}
            <Grid.Col span={2}>
                <AladinViewer/>
            </Grid.Col>

            {/* handle input */}
            <Grid.Col span={ 2 }>
                <form onSubmit={ handleSubmission }>
                    <TextInput
                        ref={ targetNameRef }
                        withAsterisk
                        label="Name"
                        placeholder="name of target"
                        { ...form.getInputProps('TargetName') } />
                    <DatabaseSearchButton
                        label={ 'Lookup' }
                        onClick={ simbadLookup }
                        toolTipLabel={ 'Search Simbad database' }/>
                    <NumberInput
                        required={ true }
                        label={ 'RA' }
                        decimalScale={ 5 }
                        step={ 0.00001 }
                        min={ 0 }
                        max={ 360 }
                        allowNegative={ false }
                        suffix="°"
                        stepHoldDelay={ 500 }
                        stepHoldInterval={ (t: number) => Math.max(1000 / t ** 2, 1) }
                        formatter={ (value: string) => !Number.isNaN(parseFloat(value))
                            ? `${ value }°`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                            : ' °' }
                        { ...form.getInputProps('RA') } />
                    <NumberInput
                        required={ true }
                        label={ 'Dec' }
                        decimalScale={ 5 }
                        step={ 0.00001 }
                        min={ -90 }
                        max={ 90 }
                        suffix="°"
                        stepHoldDelay={ 500 }
                        stepHoldInterval={ (t: number) => Math.max(1000 / t ** 2, 1) }
                        formatter={ (value: string) => !Number.isNaN(parseFloat(value))
                            ? `${ value }°`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                            : ' °' }
                        { ...form.getInputProps('Dec') } />
                    <Select
                        label={ 'Coordinate System' }
                        data={ [ { label: 'J2000', value: 'J2000' } ] }
                        { ...form.getInputProps('SelectedEpoch') } />
                    <div>
                        <SubmitButton
                            toolTipLabel={ 'Save this target' }
                            label={ 'Save' }
                            disabled={ !form.isValid() || form.values.searching ? true : undefined }/>
                    </div>
                </form>
            </Grid.Col>
        </Grid></>
    );
};


/**
 * On click the add button displays the add new target modal.
 *
 * @return a React Element of a visible add button and hidden modal.
 *
 */
export default function AddTargetModal(): ReactElement {
    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <AddButton onClick={open}
                       toolTipLabel={"Add new target."}/>
            <Modal title="New target"
                   opened={opened}
                   onClose={close}
                   fullScreen>
                <TargetForm
                    onSubmit={() => {
                        close();
                    }}
                />
            </Modal>
        </>
    );
}

/**
 * the form props.
 */
export type FormPropsType<T> = {
    initialValues?: T;
    onSubmit: () => void;
    actions?: ReactNode;
};

/**
 * the new data required for target form.
 *
 * @param SelectedEpoch which epoch to use.
 * @param RA the longitude
 * @param Dec the latitude
 * @param TargetName the name of the target
 * @param searching if the system is searching for a target at the moment.
 * @param lastSearchName: the last name searched for.
 */
export type newTargetData = {
    SelectedEpoch: string;
    RA: number;
    Dec: number;
    TargetName: string
    searching: boolean
    lastSearchName: string
}

