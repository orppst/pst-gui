import {Modal, NumberInput, Select, TextInput, Grid} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
    FormEvent,
    MouseEvent,
    ReactElement,
    ReactNode,
    useEffect,
    useRef
} from 'react';
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
import { useHistoryState } from '../useHistoryState.ts';
import "./aladin.component.css";

// A is a global variable from aladin lite source code.
// It is declared for the typescript checker to understand it.
declare var A: any;

// NOTE ABS: Aladin seems to be the global holder for the object that we can
// manipulate. This is different to NGOT, but at this point, ill buy anything.
declare var Aladin: any;

// the initial config for the aladin viewer.
const initialConfig = {
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

    // this is needed to ensure that aladin is only loaded once, and not each
    // time the renderer engages. The reason for this is that it makes
    // duplicates which steal screen restate, making it unusable.
    let [hasDoneAladin, setHasDoneAladin] =
        useHistoryState("hasDoneAladin", false);

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
                Aladin?.gotoRaDec(data.raDegrees, data.decDegrees);
            })
            .catch((reason: any) => {
                console.error(reason);
                notFound()});
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
     * code swiped from stack overflow which loads the javascript into the
     * React HTML.
     * @param {HTMLElement} bodyElement the main body of the html.
     * @param {string} url the url where the javascript is located.
     * @param {() => void} onloadCallback the callback once the script has
     * been loaded.
     * @constructor
     */
    const LoadScriptIntoDOM = (
        bodyElement: HTMLElement, url: string,
        onloadCallback?: () => void) => {
        const scriptElement = document.createElement("script");
        scriptElement.setAttribute('src', url);
        scriptElement.async = false;
        if (onloadCallback) {
            scriptElement.onload = onloadCallback;
        }
        bodyElement.appendChild(scriptElement);
    }

    /**
     * handler that eventually creates the aladin interface from Javascript.
     * This code was swiped from stack overflow for loading in the Javascript
     * to an react system.
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
            LoadScriptIntoDOM(
                bodyElement,
                'http://code.jquery.com/jquery-1.12.1.min.js');
            // Then we load the aladin lite script.
            LoadScriptIntoDOM(
                bodyElement,
                'https://aladin.u-strasbg.fr/AladinLite/api/v2/beta/aladin.min.js',
                () => {
                    // to stop reloading aladin into the browser on every render.
                    setHasDoneAladin(true);

                    // When the import has succeeded we store the aladin js instance
                    // into its component
                    Aladin = A.aladin('#aladin-lite-div', initialConfig);

                    // add the catalog.
                    const catalogue = A.catalog({
                        name: 'Pointing Catalogue',
                        shape: 'cross',
                        sourceSize: 20,
                    });

                    // is not null, created from javascript.
                    Aladin.addCatalog(catalogue);

                    // add the overlay.
                    const overlay = A.graphicOverlay({
                        color: '#009900',
                        lineWidth: 3
                    });

                    // is not null, created from javascript.
                    Aladin.addOverlay(overlay);
                })
        }});

    /**
     * gets some form of offset. Swiped from the NGOT source code.
     *
     * @param {MouseEvent} event the mouse event that contains a drag.
     */
     const GetOffset = (event: MouseEvent): number[] => {
        let el: HTMLElement = event.target as HTMLElement;
        let x = 0;
        let y = 0;

        while (el && !Number.isNaN(el.offsetLeft) &&
               !Number.isNaN(el.offsetTop)) {
            x += el.offsetLeft - el.scrollLeft;
            y += el.offsetTop - el.scrollTop;
            el = el.offsetParent as HTMLElement;
        }

        x = event.clientX - x;
        y = event.clientY - y;

        return [x, y];
    }

    /**
     * handles the different mouse event types.
     * @param {React.MouseEvent<HTMLInputElement>} event the event that occurred.
     */
    const handleEvent = (event: MouseEvent<HTMLInputElement>) => {
        const [ra, dec] = GetOffset(event);
        const [raCoords, decCoords] = Aladin.pix2world(ra, dec);
        form.setFieldValue('RA', raCoords);
        form.setFieldValue('Dec', decCoords);
    }

    // return the dynamic HTML.
    return (
        <><Grid columns={4}>
            {/* handle aladin */}
            <Grid.Col span={2}>
                <div id="aladin-lite-div"
                     style={{height: 400}}
                     onMouseUpCapture={handleEvent}>
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
                        {...form.getInputProps("TargetName")} />
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
                        {...form.getInputProps("RA")}/>
                    <NumberInput
                        required={true}
                        label={"Dec"}
                        decimalScale={5}
                        step={0.00001}
                        min={-90}
                        max={90}
                        suffix="°"
                        {...form.getInputProps("Dec")} />
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
        useHistoryState("hasDoneAladin", false);

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

