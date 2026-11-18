import {TextInput, Stack, Fieldset, Grid, rem, Text, Loader, Group} from "@mantine/core";
import {useForm} from "@mantine/form";
import { useMediaQuery} from "@mantine/hooks";
import {
    ReactElement,
    useEffect,
    useState
} from 'react';
import {
    CelestialTarget,
} from "src/generated/proposalToolSchemas.ts";
import {
    useProposalResourceAddNewTarget,
    useProposalResourceGetTargets
} from "src/generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router-dom";
import {FormSubmitButton} from 'src/commonButtons/save';
import "./aladin.css";
import {
    AladinType,
    IAladinConfig
} from './aladinTypes.tsx';
import { ALADIN_SRC_URL } from 'src/constants.tsx';
import {
    LoadScriptIntoDOM
} from './aladinHelperMethods.tsx';
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SimbadSearch} from "./simbadSearch.tsx";
import SimbadSearchHelp from "./simbadSearchHelp.tsx";
import { AstroLib } from "@tsastro/astrolib";
import * as React from "react";

//move along, nothing to see here
//@ts-ignore
import A from 'aladin-lite';
import TargetRaInput from "./TargetRaInput.tsx";
import TargetDecInput from "./TargetDecInput.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import CancelButton from "../../commonButtons/cancel.tsx";

export let Aladin: AladinType;

// setup for Aladin viewer in Polaris - settings where the defaults aren't right for us
const initialConfig: IAladinConfig = {
    projection: 'STG',
    showFrame: false,
    showZoomControl: false,
    showProjectionControl: false,
    showGotoControl: false,
    showFullscreenControl: false,
    reticleColor: 'rgb(150, 255, 75)'
};

// future update: add optional fields for proper motions, parallax, and radial velocity

export interface NewTargetFormValues {
    targetName: string
    ra: string
    dec: string
    sexagesimal: string
    objectDescription?: string
}

/**
 * generate new default name for a target
 */
export
const generateTargetDefaultName = () : string => {
    //reset the name to something generic + random suffix
    let targetProxyName = "Target_";
    let randNum = Math.random();
    //convert the number into something using chars 0-9 A-Z
    let hexString = randNum.toString(36);
    targetProxyName += hexString.slice(6).toUpperCase();
    return targetProxyName;
}

export default
function AddTargetPanel(): ReactElement {

    const aladinLiteDiv = document.getElementById("aladin-lite-div")

    const [skyAtlasReady, setSkyAtlasReady] = useState(false);

    useEffect(() => {
        if (aladinLiteDiv) {
            const bodyElement =
                document.getElementsByTagName('BODY')[0] as HTMLElement;

            LoadScriptIntoDOM(
                bodyElement, ALADIN_SRC_URL,
                () => {
                    Aladin = A.aladin('#aladin-lite-div', initialConfig);
                })
            setSkyAtlasReady(true);
        }
    }, [aladinLiteDiv]);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {selectedProposalCode} = useParams();
    const [nameUnique, setNameUnique] = useState(true);

    const newTargetMutation = useProposalResourceAddNewTarget();

    //we want targets to check that names are unique
    const targets = useProposalResourceGetTargets({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    });

    //media queries to attempt to make the page look okay at different screen widths
    const isTablet = useMediaQuery('(max-width: 90em)');
    const isWide = useMediaQuery("(max-width: 2000px)");

    const form = useForm<NewTargetFormValues>({
            initialValues: {
                targetName: "",
                ra: "",
                dec: "",
                sexagesimal: "00:00:00 +00:00:00"
            },
            validate: {
                targetName: (value) => (
                    value.length < 1 ? 'Name cannot be blank ' : nameUnique? null : 'Source name must be unique'
                ),
                ra: (value) => {
                    //at this point ra is always in sexagesimal
                    if (value === null || value === '') return 'RA cannot be blank'
                    const validRaSgm = /^\d{2}([ :])\d{2}([ :])\d{2}(?:[.]\d+)?$/
                    if (!validRaSgm.test(value)) return 'Invalid value format'
                    let noDecimal = !value.includes('.')
                    let raDegrees = AstroLib.HmsToDeg(noDecimal ? value + '.0' : value)
                    if (raDegrees < 0 || raDegrees > 360) return 'Value out-of-range'
                    return null
                },
                dec: (value) => {
                    //at this point dec is always in sexagesimal
                    if (value === null || value === '') return 'Dec cannot be blank'
                    const validDecSgm = /^[-+]?\d{2}([ :])\d{2}([ :])\d{2}(?:[.]\d+)?$/
                    if (!validDecSgm.test(value)) return 'Invalid value format'
                    let noDecimal = !value.includes('.')
                    let decDegrees = AstroLib.DmsToDeg(noDecimal ? value + '.0' : value);
                    if (decDegrees < -90 || decDegrees > 90 ) return 'Value out-of-range'
                    return null
                }
            },
        });

    useEffect(() => {
        setNameUnique(!targets.data?.find(t => t.name === form.getValues().targetName));
    }, [form.getValues().targetName]);

    /*
        DEV NOTE: We have simpilfied this by ASSUMING a reference frame of 'ICRS' which in turn uses
        the J2000.0 (or 51544.5 MJD equivalent) epoch. In future updates, we may have a selection of
        refrence frames, which then would include a selection of epochs (or equinoxs, I'm not quite
        clear on the difference).
     */

    const handleSubmission = form.onSubmit((val: NewTargetFormValues) => {
        //remember to convert the sexagesimal to decimal
        const Target: CelestialTarget = {
            "@type": "proposal:CelestialTarget",
            sourceName: val.targetName,
            coord: {
                sourceCoordinates: {
                    alpha: AstroLib.HmsToDeg(val.ra),
                    delta: AstroLib.DmsToDeg(val.dec)
                },
                referenceFrame: "ICRS" // see ivoa.net/rdf/refframe for acceptable strings
            },
            coordUnit: {value: "degrees"}, // always use degrees in DB
            positionEpoch: {value: 51544.5} //MJD equivalent of J2000.0
        };

        newTargetMutation.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            body: Target
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then();
                notifySuccess("Target added", val.targetName + " has been added successfully.");
                navigate("../", {relative:"path"})
            },
            onError: (error) =>
                notifyError("Failed to add Target", getErrorMessage(error))
        })
    });

    const handleDoubleClick = () => {

        //Notice: on double-click the sky atlas centers the view on the mouse pointer location
        // therefore we only need to extract the central location coordinates

        const [raCoords, decCoords] = Aladin.getRaDec(); //gets the view central coordinates

        //DJW: Astrolib DegToHms prepend sign issue
        form.setFieldValue('ra', AstroLib.DegToHms(raCoords).slice(1));
        form.setFieldValue('dec', AstroLib.DegToDms(decCoords));
        
        //we want to update the name if there is no entry OR if the entry is from the catalogue
        if (form.getValues().targetName.slice(0,6) != "Target" && form.getValues().targetName.slice(0,8) != "Modified")
        {
            //if we have a catalogue name, modify it to show that the target has moved
            if(form.getValues().targetName != ""){
                ModifyTargetName(form.getValues().targetName);
            }
            //if we have no name, add one
            else{
                let generatedName = generateTargetDefaultName();

                form.setFieldValue('targetName',generatedName);

                //allow submission in case this was previously locked
                setNameUnique(true);
            }
            
        }
    }


    /**
     * modify the name for a target
     */
    const ModifyTargetName = (currentName :string) => {
        //reset the name to something generic + random suffix
        let targetProxyName = "Modified " + currentName + "_";
        let randNum = Math.random();
        //convert the number into something using chars 0-9 A-Z
        let hexString = randNum.toString(36);
        targetProxyName += hexString.slice(6).toUpperCase();
        form.setFieldValue('targetName', targetProxyName);
        
        //allow submission in case this was previously locked
        setNameUnique(true);
    }

    if (targets.isLoading) {
        return (
            <Loader />
        )
    }

    let responsiveSpan = {base: 12, xl: 6}

    return (
        <PanelFrame
            mx={isWide ? "0" : "10%"}
        >
            <EditorPanelHeader
                proposalCode={Number(selectedProposalCode)}
                panelHeading={"Add a Target"}
            />
            <Grid columns={12}>
                <Grid.Col span={12}>
                    <Fieldset legend={"User Information"}>
                        <Text size={"xs"} c={"gray.6"}>Click on a tab to toggle its content</Text>
                        <SimbadSearchHelp largeScrollArea={!isWide}/>
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={responsiveSpan}>
                    <Stack gap={"xs"}>
                        <Fieldset legend={"SIMBAD search"} pt={10}>
                            <SimbadSearch form={form}/>
                        </Fieldset>
                        <Fieldset legend={"Target Form"}>
                            <form onSubmit={handleSubmission}>
                                <Stack gap={"xs"}>
                                    <TextInput
                                        label="Name your target"
                                        placeholder="User provided or use the SIMBAD search"
                                        description={nameUnique ? "Something descriptive is recommended" : null}
                                        error={nameUnique ? null :
                                            form.getValues().targetName + " is in use, choose another name"}
                                        inputWrapperOrder={['label', 'description', 'error', 'input']}
                                        value={form.getValues().targetName}
                                        onChange={(e: React.FormEvent<HTMLInputElement>) =>{
                                            form.setFieldValue('targetName', e.currentTarget.value)
                                        }}
                                    />
                                    <TargetRaInput form={form} setNameUnique={setNameUnique} />
                                    <TargetDecInput form={form} setNameUnique={setNameUnique} />

                                    <Group justify={"flex-end"}>
                                        <FormSubmitButton form={form} />
                                        <CancelButton
                                            toolTipLabel={"Go back without saving"}
                                            onClick={() => navigate("../", {relative:"path"})}
                                        />
                                    </Group>

                                </Stack>
                            </form>
                        </Fieldset>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={responsiveSpan}>
                    <Fieldset
                        legend={"Aladin Sky Atlas"}
                        style={{height: isTablet? rem(350) : "100%"}}
                    >
                        <div
                            id="aladin-lite-div"
                            onDoubleClick={handleDoubleClick}
                        >
                            { !skyAtlasReady &&  <Loader />}
                        </div>
                    </Fieldset>
                </Grid.Col>
            </Grid>
        </PanelFrame>
    );
};



