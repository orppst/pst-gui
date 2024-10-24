import {Modal, TextInput, Stack, Fieldset, Grid, rem, Text} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {
    MouseEvent,
    ReactElement,
    useEffect,
    useState
} from 'react';
import {
    CelestialTarget,
    EquatorialPoint, SpaceSys,
} from "src/generated/proposalToolSchemas.ts";
import {
    fetchProposalResourceAddNewTarget, fetchProposalResourceGetTargets,
    fetchSpaceSystemResourceGetSpaceSystem
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
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SimbadSearch} from "./simbadSearch.tsx";
import SimbadSearchHelp from "./simbadSearchHelp.tsx";
import { AstroLib } from "@tsastro/astrolib";

export let Aladin: AladinType;

// the initial config for the aladin viewer.
const initialConfig: IAladinConfig = {
    cooFrame: 'ICRS',
    survey: 'P/DSS2/color',
    fov: 0.25,
    showReticule: true,
    showZoomControl: false,
    showLayersControl: false,
    showGotoControl: false,
    showShareControl: false,
    showFullscreenControl: false,
    showFrame: false,
    fullScreen: false,
    reticuleColor: 'rgb(178, 50, 178)',
    reticuleSize: 22,
    showCooGridControl: false,
};

const TargetForm = (props: {closeModal: () => void}): ReactElement => {

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

    //media query used to conditionally set the height of Aladin when the modal toggles
    // between fullscreen and not
    const isTablet = useMediaQuery('(max-width: 62em)');

    const form = useForm({
            initialValues: {
                TargetName: "",
                RA: "0.00",
                Dec: "0.00",
                SelectedEpoch: "J2000",
                sexagesimal: "00:00:00 +00:00:00"
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

    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();

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
                value: parseFloat(val.RA), unit: { value: "degrees" }
            },
            lon: {
                "@type": "ivoa:RealQuantity",
                value: parseFloat(val.Dec), unit: { value: "degrees" }
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
                                .then(() =>
                                    notifySuccess("Success",
                                        val.TargetName + " added to the proposal"))
                                .then(() => props.closeModal!())
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


    // alias for form.onSubmit that simply calls saveToDatabase
    const handleSubmission = form.onSubmit((val: newTargetData) => {
        saveToDatabase(val);
    });

    /**
     * handles the different mouse event types.
     * @param {React.MouseEvent<HTMLInputElement>} event the event that occurred.
     */
    const HandleEvent = (event: MouseEvent<HTMLInputElement>) => {
        const [ra, dec] = GetOffset(event);
        const [raCoords, decCoords] = Aladin.pix2world(ra, dec);
        form.setFieldValue('RA', raCoords.toString());
        form.setFieldValue('Dec', decCoords.toString());
        
        //we want to update the name if there is no entry OR if the entry is from the catalogue
        if (form.values["TargetName"].slice(0,6) != "Target" && form.values["TargetName"].slice(0,8) != "Modified")
        {
            //if we have a catalogue name, modify it to show that the target has moved
            if(form.values["TargetName"] != ""){
                ModifyTargetName(form.values["TargetName"]);               
            }
            //if we have no name, add one
            else{
                GenerateTargetDefaultName();  
            }
            
        }
    }

    /**
     * generate new default name for a target
     */
    const GenerateTargetDefaultName = () => {
        //BJLG
        //reset the name to something generic + random suffix
        let targetProxyName = "Target_";
        let randNum = Math.random();
        //convert the number into something using chars 0-9 A-Z
        let hexString = randNum.toString(36);
        targetProxyName += hexString.slice(6).toUpperCase();
        form.setFieldValue('TargetName', targetProxyName);
        
        //allow submission in case this was previously locked
        setNameUnique(true);
    }
    /**
     * modify the name for a target
     */
    const ModifyTargetName = (currentName :string) => {
        //BJLG
        //reset the name to something generic + random suffix
        let targetProxyName = "Modified " + currentName + "_";
        let randNum = Math.random();
        //convert the number into something using chars 0-9 A-Z
        let hexString = randNum.toString(36);
        targetProxyName += hexString.slice(6).toUpperCase();
        form.setFieldValue('TargetName', targetProxyName);
        
        //allow submission in case this was previously locked
        setNameUnique(true);
    }

    /**
     * updates the aladin viewer to handle changes to RA.
     * @param {number | string} value the new RA.
     */
    const UpdateAladinRA = (value: number | string) => {
        // acquire the aladin object and set it.
        Aladin.gotoRaDec(value as number, Number(form.values.Dec));
    }

    /**
     * updates the aladin viewer to handle changes to Dec.
     * @param {number | string} value the new Dec.
     */
    const UpdateAladinDec = (value: number | string) => {
        // acquire the aladin object and set it.
        Aladin.gotoRaDec(Number(form.values.RA), value as number);
    }

    const responsiveSpan = {base: 2, md: 1}


    return (
        <Grid columns={2}>
            <Grid.Col span={2}>
                <Fieldset legend={"User Information"}>
                    <Text size={"xs"} c={"gray.6"}>Click on a tab to toggle its content</Text>
                    <SimbadSearchHelp/>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={2}>
                <Fieldset legend={"SIMBAD search"} pt={10}>
                    <SimbadSearch form={form}/>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={responsiveSpan}>
                <Fieldset legend={"Target Form"}>
                <form onSubmit={handleSubmission}>
                    <Stack gap={"xs"}>
                        <TextInput
                            withAsterisk
                            label="Name"
                            placeholder="User provided or use the SIMBAD search"
                            {...form.getInputProps("TargetName")}
                            onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                setNameUnique(true);
                                if(form.getInputProps("TargetName").onChange)
                                    form.getInputProps("TargetName").onChange(e);

                            }}
                        />
                        <TextInput
                            //hideControls
                            required={true}
                            label={"RA"}
                            //decimalScale={6}
                            //min={0}
                            //max={360}
                            //allowNegative={false}
                            //suffix="°"
                            {...form.getInputProps("RA")}
                            onChange={(e) => {
                                if (form.getInputProps("RA").onChange) {
                                    form.getInputProps("RA").onChange(e);
                                }
                                //get the live value from the input
                                let raValue: string = form.getValues()["RA"];
                                
                                const regexp = new RegExp(/(\d{1,3})\D(\d{1,2})\D(\d{1,2}(\.\d+)[sS]*)/);
                                //first filter to ensure input is at least in the ball park of sensible
                                if(regexp.test(raValue))
                                {
                                    //convert Sexagemsimal to degrees (Sxg representation is displayed separately)
                                    raValue = String(AstroLib.HmsToDeg(raValue));
                                    //update the value to degrees
                                    form.setFieldValue("RA", raValue);
                                }
                                //if we don't have a name for this object, generate one
                                if(form.values["TargetName"] == "")
                                {
                                    GenerateTargetDefaultName();
                                }                             
                                //update the Aladdin viewport
                                UpdateAladinRA(Number(raValue));
                            }}

                                
                        />
                        <Text size={"xs"} 
                                c={"gray.6"} 
                                style={{margin: "-4px 0px 0px 12px"}}>
                                    {AstroLib.DegToHms(Number(form.getValues()["RA"]),3)}
                            </Text>
                        <TextInput
                            //hideControls
                            required={true}
                            label={"Dec"}
                            //decimalScale={6}
                            min={-90}
                            max={90}
                            //suffix="°"
                            {...form.getInputProps("Dec")}
                            onChange={(e) => {
                                if (form.getInputProps("Dec").onChange) {
                                    form.getInputProps("Dec").onChange(e);
                                }
                                //get the live value from the input
                                let decValue: string = form.getValues()["Dec"];
                                
                                const regexp = new RegExp(/(\d{1,2})\D(\d{1,2})\D(\d{1,2}(\.\d+)[sS]*)/);
                                //first filter to ensure input is at least in the ball park of sensible
                                if(regexp.test(decValue))
                                {
                                    //convert Sexagemsimal to degrees (Sxg representation is displayed separately)
                                    decValue = String(AstroLib.DmsToDeg(decValue));
                                    //update the value to degrees
                                    form.setFieldValue("Dec", decValue);
                                }          
                                //if we don't have a name for this object, generate one
                                if(form.values["TargetName"] == "")
                                {
                                    GenerateTargetDefaultName();
                                }                   
                                //update the Aladdin viewport
                                UpdateAladinDec(Number(decValue));
                            }}
                        />
                        <Text size={"xs"}
                                c={"gray.6"}
                                style={{margin: "-4px 0px 0px 12px"}}>
                                    {AstroLib.DegToDms(Number(form.getValues()["Dec"]),3)}
                            </Text>
                        <SubmitButton
                            toolTipLabel={"Save this target"}
                            disabled={!form.isValid()}
                        />
                    </Stack>
                </form>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={responsiveSpan}>
                <Fieldset
                    legend={"Aladin Sky Atlas"}
                    style={{height: isTablet? rem(350) : "100%"}}
                >
                    <div
                        id="aladin-lite-div"
                        onMouseUpCapture={HandleEvent}
                    >
                    </div>
                </Fieldset>
            </Grid.Col>
        </Grid>
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
    const isMobile = useMediaQuery('(max-width: 75em)');

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
                   size={"60%"}
                   closeOnClickOutside={false}
            >
                <TargetForm closeModal={close}/>
            </Modal>
        </>
    );
}

/**
 * the new data required for target form.
 *
 * @param SelectedEpoch which epoch to use.
 * @param RA the longitude
 * @param Dec the latitude
 * @param TargetName the name of the target
 * @param sexagesimal sexagesimal string representation of Ra & Dec
 * @param objectDescription description of the target object type from SIMBAD, optional
 */
export type newTargetData = {
    SelectedEpoch: string;
    RA: string;
    Dec: string;
    TargetName: string
    sexagesimal: string
    objectDescription?: string
}


