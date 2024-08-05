import {Modal, NumberInput, TextInput, Stack, Group, Fieldset, Radio, Grid, rem} from "@mantine/core";
import { useForm } from "@mantine/form";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
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
import { SubmitButton } from 'src/commonButtons/save';
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
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SimbadSearch} from "./simbadSearch.tsx";
import SimbadSearchHelp from "./simbadSearchHelp.tsx";

export let Aladin: AladinType;

// the initial config for the aladin viewer.
const initialConfig: IAladinConfig = {
    cooFrame: 'ICRS',
    survey: 'P/DSS2/color',
    fov: 0.25,
    showReticule: true,
    showZoomControl: false,
    showLayersControl: true,
    showGotoControl: false,
    showShareControl: false,
    showFullscreenControl: false,
    showFrame: false,
    fullScreen: false,
    reticuleColor: 'rgb(178, 50, 178)',
    reticuleSize: 22,
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

    const [queryChoice, setQueryChoice] = useState('nameQuery');

    /**
     * handler that creates the Aladin interface from Javascript.
     * Empty 'deps' array in useEffect to load on initial render only.
     * Note that in 'dev mode' (React 18) this actually runs twice for reasons.
     */
    useEffect(() => {

        const bodyElement =
            document.getElementsByTagName('BODY')[0] as HTMLElement;

        // jQuery is a dependency for aladin-lite and must be inserted in the DOM.
        LoadScriptIntoDOM(bodyElement, JQUERY_SRC_URL);

        // Then we load the aladin lite script.
        LoadScriptIntoDOM(
            bodyElement, ALADIN_SRC_URL,
            () => {
                Aladin = PopulateAladin(initialConfig);
            })
    }, []);


    const [nameUnique, setNameUnique] = useState(true);
    const isTablet = useMediaQuery('(max-width: 62em)');

    const form = useForm({
            initialValues: props.initialValues ?? {
                TargetName: "",
                RA: 0.00,
                Dec: 0.00,
                SelectedEpoch: "J2000",
                sexagesimal: "00:00:00 +00:00:00",
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
            if(!choice) props.onSubmit();
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
            coordSys: {val: "ICRS"},
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
            positionEpoch: { value: "J2000"}
        };

        /**
         * assign the coord system to the target if feasible.
         * @param {SpaceSys} ss the coord system to set.
         */
        const assignSpaceSys = (ss: SpaceSys) => {
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
                        .then(() =>
                            fetchProposalResourceAddNewTarget({
                                pathParams:{proposalCode: Number(selectedProposalCode) },
                                body: Target
                            })
                                .then(() => queryClient.invalidateQueries())
                                .then(() => {props.onSubmit()})
                                .catch(error => notifyError("Failed to add Target",
                                    getErrorMessage(error)))
                        )
                        .catch(error => notifyError("Failed to get Space Coordinate System",
                            getErrorMessage(error)))
                } else {
                    //Target already exists on this proposal
                    setNameUnique(false);
                    notifyError("Duplicate target",
                        "A target called '"+val.TargetName+"' already exists");
                }
            })
            .catch(error => notifyError("Failed to get existing Targets",
                getErrorMessage(error)));
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
     * updates the aladin viewer to handle changes to Dec.
     * @param {number | string} value the new Dec.
     */
    const UpdateAladinDec = (value: number | string) => {
        // acquire the aladin object and set it.
        Aladin.gotoRaDec(form.values.RA, value as number);
    }

    const responsiveSpan = {base: 2, md: 1}

    return (
        <>
            <Grid columns={2}>
                <Grid.Col span={responsiveSpan}>
                    <Fieldset legend={"SIMBAD search"} pb={150}>
                        <Stack>
                            <Radio.Group
                                value={queryChoice}
                                onChange={setQueryChoice}
                                name={"queryChoice"}
                                label={'Choose the query type'}
                            >
                                <Group p={"sm"}>
                                    <Radio value={'nameQuery'} label={'Alternate Name'} />
                                    <Radio value={'catQuery'} label={'Catalogue Ref.'} />
                                    <Radio value={'idQuery'} label={'Identity'} />
                                </Group>
                            </Radio.Group>
                            <SimbadSearch form={form} queryChoice={queryChoice}/>
                        </Stack>
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={responsiveSpan}>
                    <Fieldset legend={"SIMBAD information"}>
                        <SimbadSearchHelp queryChoice={queryChoice}/>
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={responsiveSpan}>
                    <Fieldset legend={"Target Form"}>
                    <form onSubmit={handleSubmission}>
                        <Stack gap={"lg"}>
                            <TextInput
                                ref={targetNameRef}
                                withAsterisk
                                label="Name"
                                placeholder="User provided or use the SIMBAD search"
                                {...form.getInputProps("TargetName")}
                                onChange={(e: string) => {
                                    setNameUnique(true);
                                    if(form.getInputProps("TargetName").onChange)
                                        form.getInputProps("TargetName").onChange(e);

                                }}
                            />
                            <NumberInput
                                hideControls
                                required={true}
                                label={"RA"}
                                decimalScale={6}
                                min={0}
                                max={360}
                                allowNegative={false}
                                suffix="°"
                                {...form.getInputProps("RA")}
                                onChange={(e) => {
                                    UpdateAladinRA(e);
                                    if (form.getInputProps("RA").onChange) {
                                        form.getInputProps("RA").onChange(e);
                                    }}}
                            />
                            <NumberInput
                                hideControls
                                required={true}
                                label={"Dec"}
                                decimalScale={6}
                                min={-90}
                                max={90}
                                suffix="°"
                                {...form.getInputProps("Dec")}
                                onChange={(e) => {
                                    UpdateAladinDec(e);
                                    if (form.getInputProps("Dec").onChange) {
                                        form.getInputProps("Dec").onChange(e);
                                    }}}
                            />
                            <SubmitButton
                                toolTipLabel={"Save this target"}
                                disabled={!form.isValid() ||
                                form.values.searching? true : undefined}
                            />
                        </Stack>
                    </form>
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={responsiveSpan}>
                    <Fieldset
                        legend={"Aladin Sky Atlas"}
                        style={{height: isTablet? rem(300) : "100%"}}
                    >
                        <div
                            id="aladin-lite-div"
                            onMouseUpCapture={HandleEvent}>
                        </div>
                    </Fieldset>
                </Grid.Col>
            </Grid>
        </>
    );
};


/**
 * On click the add button displays the add new target modal.
 *
 * @return a React Element of a visible add button and hidden modal.
 *
 */
export default function AddTargetModal(props: {proposalTitle: string}): ReactElement {
    const [opened, { close, open }] = useDisclosure();
    const isMobile = useMediaQuery('(max-width: 50em)');

    return (
        <>
            <AddButton
                onClick={open}
                toolTipLabel={"Add new target."}
            />
            <Modal title={`Add a Target to '${props.proposalTitle}'`}
                   opened={opened}
                   onClose={() => {close();}}
                   fullScreen={isMobile}
                   size={"75%"}
            >
                <TargetForm onSubmit={() => {close();}}/>
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
    sexagesimal: string
    searching: boolean
    lastSearchName: string
}


