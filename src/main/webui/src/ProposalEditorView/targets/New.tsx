import {Modal, TextInput, Stack, Fieldset, Grid, rem, Text, Loader} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {
    ReactElement,
    useEffect,
    useState
} from 'react';
import {
    CelestialTarget,
    EquatorialPoint,
} from "src/generated/proposalToolSchemas.ts";
import {
    useProposalResourceAddNewTarget,
    useProposalResourceGetTargets,
    useSpaceSystemResourceGetSpaceSystem
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

export interface NewTargetFormValues {
    targetName: string
    ra: string
    dec: string
    selectedEpoch: 'J2000'  // | 'B1950' | etc ??
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


const TargetForm = (props: {closeModal: () => void}): ReactElement => {

    useEffect(() => {

        const bodyElement =
            document.getElementsByTagName('BODY')[0] as HTMLElement;

        LoadScriptIntoDOM(
            bodyElement, ALADIN_SRC_URL,
            () => {
                Aladin = A.aladin('#aladin-lite-div', initialConfig);
            })
    }, []);

    const queryClient = useQueryClient();
    const {selectedProposalCode} = useParams();
    const [nameUnique, setNameUnique] = useState(true);

    const newTargetMutation = useProposalResourceAddNewTarget();

    //we want targets to check that names are unique
    const targets = useProposalResourceGetTargets({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    });

    const spaceSystem = useSpaceSystemResourceGetSpaceSystem({
        pathParams: {frameCode: 'ICRS'}
    })

    //media query used to conditionally set the height of Aladin when the modal toggles
    // between fullscreen and not
    const isTablet = useMediaQuery('(max-width: 62em)');

    const form = useForm<NewTargetFormValues>({
            initialValues: {
                targetName: "",
                ra: "",
                dec: "",
                selectedEpoch: "J2000",
                sexagesimal: "00:00:00 +00:00:00"
            },
            validate: {
                targetName: (value) => (
                    value.length < 1 ? 'Name cannot be blank ' : nameUnique? null : 'Source name must be unique'
                ),
                ra: (value) => {
                    //at this point ra is always in sexagesimal
                    if (value === null || value === '') return 'RA cannot be blank'
                    const validRaSgm = /^\d{1,2}([ :])\d{1,2}([ :])\d{1,2}(?:[.]\d+)?$/
                    if (!validRaSgm.test(value)) return 'Invalid value format'
                    let noDecimal = !value.includes('.')
                    let raDegrees = AstroLib.HmsToDeg(noDecimal ? value + '.0' : value)
                    if (raDegrees < 0 || raDegrees > 360) return 'Value out-of-range'
                    return null
                },
                dec: (value) => {
                    //at this point dec is always in sexagesimal
                    if (value === null || value === '') return 'Dec cannot be blank'
                    const validDecSgm = /^[-+]?\d{1,2}([ :])\d{1,2}([ :])\d{1,2}(?:[.]\d+)?$/
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

    const handleSubmission = form.onSubmit((val: NewTargetFormValues) => {
        //remember to convert the sexagesimal to decimal
        const sourceCoords: EquatorialPoint = {
            "@type": "coords:EquatorialPoint",
            coordSys: spaceSystem.data!,
            lat: {
                "@type": "ivoa:RealQuantity",
                value: AstroLib.HmsToDeg(val.ra), unit: { value: "degrees" }
            },
            lon: {
                "@type": "ivoa:RealQuantity",
                value: AstroLib.DmsToDeg(val.dec), unit: { value: "degrees" }
            }
        }
        const Target: CelestialTarget = {
            "@type": "proposal:CelestialTarget",
            sourceName: val.targetName,
            sourceCoordinates: sourceCoords,
            positionEpoch: { value: "J2000"}
        };

        newTargetMutation.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            body: Target
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then();
                notifySuccess("Target added", val.targetName + " has been added successfully.");
                props.closeModal!();
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

    const responsiveSpan = {base: 2, md: 1}

    if (targets.isLoading || spaceSystem.isLoading) {
        return (
            <Loader />
        )
    }

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
                        onDoubleClick={handleDoubleClick}
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



