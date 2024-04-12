import {Modal, NumberInput, Select, TextInput, Grid} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
    FormEvent,
    MouseEvent,
    ReactElement,
    ReactNode,
    useEffect,
    useRef, useState
} from 'react';
import {
    CelestialTarget,
    EquatorialPoint, SimbadTargetResult, SpaceSys,
} from "src/generated/proposalToolSchemas.ts";
import {
    fetchProposalResourceAddNewTarget, fetchProposalResourceGetTargets,
    fetchSimbadResourceSimbadFindTarget, fetchSpaceSystemResourceGetSpaceSystem
} from "src/generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useParams} from "react-router-dom";
import AddButton from 'src/commonButtons/add';
import DatabaseSearchButton from 'src/commonButtons/databaseSearch';
import { SubmitButton } from 'src/commonButtons/save';
import { useHistoryState } from 'src/useHistoryState.ts';
import "./aladin.css";
import {
    AladinType,
    IAladinConfig
} from './aladinTypes.tsx';
import { ALADIN_SRC_URL, JQUERY_SRC_URL } from 'src/constants.tsx';
import {
    GetOffset,
    LoadScriptIntoDOM,
    PopulateAladin
} from './aladinHelperMethods.tsx';
import {notifications} from "@mantine/notifications";

// NOTE ABS: Aladin seems to be the global holder for the object that we can
// manipulate. This is different to NGOT, but at this point, ill buy anything.
declare var Aladin: AladinType;

// the initial config for the aladin viewer.
const initialConfig: IAladinConfig = {
    cooFrame: 'ICRS',
    survey: 'P/DSS2/color',
    fov: 0.25,
    showReticle: true,
    showZoomControl: false,
    showLayersControl: true,
    showGotoControl: false,
    showShareControl: false,
    showFullscreenControl: false,
    showFrame: false,
    fullScreen: false,
    reticleColor: 'rgb(178, 50, 178)',
    reticleSize: 22,
    showCooGridControl: false,
};

// state name for if aladin has been loaded boolean.
const ALADIN_STATE_NAME = "hasDoneAladin";


/**
 * creates the target new page.
 *
 * @param {FormPropsType<newTargetData>} props the data required for the
 * target page.
 * @return {ReactElement} the dynamic html for the new target page.
 * @constructor
 */
const TargetForm = (props: FormPropsType<newTargetData>): ReactElement => {
    const [nameUnique, setNameUnique] = useState(true);
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
                    value.length < 1 ? 'Name cannot be blank ' : nameUnique? null : 'Source name must be unique'),
                RA: (value) => (
                    value === null || value === undefined ?
                        'RA cannot be blank':
                        null)
            },
        });

    // this is needed to ensure that aladin is only loaded once, and not each
    // time the renderer engages. The reason for this is that it makes
    // duplicates which steal screen restate, making it unusable.
    let [hasDoneAladin, setHasDoneAladin] =
        useHistoryState(ALADIN_STATE_NAME, false);

    // create the database query client and get basic elements.
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();
    const targetNameRef = useRef(null);

    /**
     * executes a simbad query.
     */
    function simbadLookup() {
        /**
         * function for handling when simbad fails to find the target.
         */
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

                // acquire the aladin object and set it.
                Aladin?.gotoRaDec(
                    data.raDegrees?data.raDegrees:0,
                    data.decDegrees?data.decDegrees:0);
            })
            .catch((reason: any) => {
                console.error(reason);
                notFound()});
    }

    /**
     * saves the new target to the database, if it doesn't already exist on this proposal.
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


        fetchProposalResourceGetTargets({
                pathParams: {proposalCode: Number(selectedProposalCode) },
                queryParams: {sourceName: val.TargetName}})
            .then((data) => {
                if(data.length == 0) {
                    setNameUnique(true);
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
                } else {
                    //Target already exists on this proposal
                    setNameUnique(false);
                    notifications.show({
                        autoClose:5000,
                        title:"Duplicate target",
                        message:"A target called '"+val.TargetName+"' already exists",
                        color:"red",
                        className:'my-notifications-class'
                    })
                }
            })
            .catch(console.log);


    }

    /**
     * handles the submission event.
     * @type {(event?: React.FormEvent<HTMLFormElement>) => void} the event.
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

    /**
     * handler that eventually creates the aladin interface from Javascript.
     * This code was swiped from stack overflow for loading in the Javascript
     * to a React system.
     */
    useEffect(() => {
        if (!hasDoneAladin) {
            setHasDoneAladin(true);
            hasDoneAladin = true;

            // Now the component is mounted we can load aladin lite.
            const bodyElement =
                document.getElementsByTagName('BODY')[0] as HTMLElement;

            // jQuery is a dependency for aladin-lite and therefore must be
            // inserted in the DOM.
            LoadScriptIntoDOM(bodyElement, JQUERY_SRC_URL);

            // Then we load the aladin lite script.
            LoadScriptIntoDOM(
                bodyElement, ALADIN_SRC_URL,
                () => {
                    // to stop reloading aladin into the browser on every render.
                    setHasDoneAladin(true);
                    Aladin = PopulateAladin(initialConfig);
                })
        }});

    /**
     * handles the different mouse event types.
     * @param {React.MouseEvent<HTMLInputElement>} event the event that occurred.
     */
    const HandleEvent = (event: MouseEvent<HTMLInputElement>) => {
        const [ra, dec] = GetOffset(event);
        const [raCoords, decCoords] = Aladin.pix2world(ra, dec);
        form.setFieldValue('RA', raCoords);
        form.setFieldValue('Dec', decCoords);
    }

    /**
     * updates the aladin viewer to handle changes to RA.
     * @param {number | string} value the new RA.
     */
    const UpdateAladinRA = (value: number | string) => {
        // acquire the aladin object and set it.
        Aladin.gotoRaDec(value as number, form.values.Dec);
    }

    /**
     * updates the aladin viewer to handle changes to RA.
     * @param {number | string} value the new RA.
     */
    const UpdateAladinDec = (value: number | string) => {
        // acquire the aladin object and set it.
        Aladin.gotoRaDec(form.values.RA, value as number);
    }

    // return the dynamic HTML.
    return (
        <><Grid columns={4}>
            {/* handle aladin */}
            <Grid.Col span={2}>
                <div id="aladin-lite-div"
                     style={{height: 400}}
                     onMouseUpCapture={HandleEvent}>
                </div>
            </Grid.Col>

            {/* handle input */}
            <Grid.Col span={ 2 }>
                <form onSubmit={handleSubmission}>
                    <TextInput
                        ref={targetNameRef}
                        withAsterisk
                        label="Name"
                        placeholder="Name of target"
                        {...form.getInputProps("TargetName")}
                        onChange={(e: string) => {
                            setNameUnique(true);
                            if(form.getInputProps("TargetName").onChange)
                                form.getInputProps("TargetName").onChange(e);
                        }}
                    />
                    <DatabaseSearchButton
                        label={"Lookup"}
                        onClick={simbadLookup}
                        toolTipLabel={"Search Simbad database"}/>
                    <NumberInput
                        required={true}
                        label={"RA"}
                        decimalScale={5}
                        step={0.00001}
                        min={0}
                        max={360}
                        allowNegative={false}
                        suffix="°"
                        {...form.getInputProps("RA")}
                        onChange={(e) => {
                            UpdateAladinRA(e);
                            if (form.getInputProps("RA").onChange) {
                                form.getInputProps("RA").onChange(e);
                        }}}/>
                    <NumberInput
                        required={true}
                        label={"Dec"}
                        decimalScale={5}
                        step={0.00001}
                        min={-90}
                        max={90}
                        suffix="°"
                        {...form.getInputProps("Dec")}
                        onChange={(e) => {
                            UpdateAladinDec(e);
                            if (form.getInputProps("Dec").onChange) {
                                form.getInputProps("Dec").onChange(e);
                            }}}/>
                    <Select
                        label={"Coordinate System"}
                        data={[{label:"J2000",value:"J2000"}]}
                        {...form.getInputProps("SelectedEpoch")} />
                    <div>
                        <SubmitButton
                            toolTipLabel={"Save this target"}
                            label={"Save"}
                            disabled={!form.isValid() ||
                                      form.values.searching? true : undefined}/>
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
    const [_, setHasDoneAladin] =
        useHistoryState(ALADIN_STATE_NAME, false);

    return (
        <>
            <AddButton onClick={open}
                       toolTipLabel={"Add new target."}/>
            <Modal title="New target"
                   opened={opened}
                   onClose={() => {
                       setHasDoneAladin(false);
                       close();
                   }}
                   fullScreen>
                <TargetForm
                    onSubmit={() => {
                        setHasDoneAladin(false);
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


