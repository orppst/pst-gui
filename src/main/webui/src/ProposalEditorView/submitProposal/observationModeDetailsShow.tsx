import {ReactElement, useState} from "react";
import {
    ActionIcon,
    Anchor,
    Badge, Box, Button, Checkbox,
    Collapse,
    Fieldset, Grid,
    Group, Loader,
    Select,
    Stack,
    Text,
    Textarea, Tooltip
} from "@mantine/core";
import {
    useObservingModeResourceGetCycleObservingMode,
    useTelescopeResourceGetObservatoryTelescopes
} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {
    Backend,
    Filter,
    Instrument,
    ObjectIdentifier,
    RealQuantity,
} from "../../generated/proposalToolSchemas.ts";
import {useDisclosure} from "@mantine/hooks";
import {IconEye, IconEyeClosed} from "@tabler/icons-react";
import {UseFormReturnType} from "@mantine/form";
import {SubmissionFormValues} from "./submitPanel.tsx";
import ObservingModeTelescopes from "./observingModeTelescopes.tsx";
import {CLOSE_DELAY, OPEN_DELAY} from "../../constants.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";


function DisplayInstrument (p: {instrument?: Instrument}): ReactElement {

    const Name = () => (
        p.instrument &&
        <Badge radius={"xs"} color={"blue"}>
            {p.instrument.name}
        </Badge>

    )

    const Kind = () => (
        p.instrument &&
        <Badge radius={"xs"} color={"blue"}>
            Kind: {p.instrument.kind}
        </Badge>
    )

    const Description = () => (
        <Textarea
            label="Description"
            value={p.instrument ? p.instrument.description ? p.instrument.description : "none" : ""}
            readOnly
        />
    )

    const WikiId = () => (
        <Text>
            WikiId: {
            p.instrument ? p.instrument.wikiId && p.instrument.wikiId.value &&
            p.instrument.wikiId.value.length > 0 ?
            <Anchor href={p.instrument.wikiId.value} target="_blank" rel="noopener noreferrer">
                {p.instrument.wikiId.value}
            </Anchor> : "No value" : ""
        }
        </Text>
    )

    const Reference = () => (
        <Text>
            External Link: {
            p.instrument ? p.instrument.reference && p.instrument.reference.length > 0 ?
            <Anchor href={p.instrument.reference} target="_blank" rel="noopener noreferrer">
                {p.instrument.name}
            </Anchor> : "No value" : ""
        }
        </Text>
    )

    return (
        <Fieldset legend={"Instrument"}>
            <Stack>
                <Group grow>
                    <Name/>
                    <Kind/>
                    <WikiId/>
                    <Reference/>
                </Group>
                <Description/>
            </Stack>
        </Fieldset>
    )
}

function DisplayBackend(p: {backend?: Backend}) : ReactElement {

    const Name = () => (
        p.backend &&
        <Badge radius={"xs"} color={"blue"}>
            {p.backend.name}
        </Badge>
    )

    const Parallel = () => (
        p.backend && p.backend.parallel &&
        <Badge radius={"xs"} color={"blue"}>
            Parallel? {p.backend.parallel ? "Yes" : "No"}
        </Badge>
    )

    return (
        <Fieldset legend={"Backend"}>
            <Group justify="center">
                <Name/>
                <Parallel/>
            </Group>
        </Fieldset>
    )
}

function DisplayFilter(p: {filter?: Filter} ) : ReactElement {

    function displayRealQuantity(r: RealQuantity) : string {
        return r.value?.toExponential(6) + " " + r.unit?.value
    }

    const Name = () => (
        p.filter &&
        <Badge radius={"xs"} color={"blue"}>
            {p.filter.name}
        </Badge>
    )

    const Description = () => (
        <Textarea
            label="Description"
            value={p.filter ? p.filter.description ? p.filter.description : "none" : ""}
            readOnly
        />
    )

    const RangeStart = () => (
        p.filter &&
        <Badge radius={"xs"} color={"blue"}>
            Start: {displayRealQuantity(p.filter.frequencyCoverage?.start!)}
        </Badge>
    )

    const RangeEnd = () => (
        p.filter &&
        <Badge radius={"xs"} color={"blue"}>
           End: {displayRealQuantity(p.filter.frequencyCoverage?.end!)}
        </Badge>
    )

    const Resolution = () => (

        p.filter &&
        <Badge radius={"xs"} color={"blue"}>
           Res.: {displayRealQuantity(p.filter.frequencyCoverage?.spectralResolution!)}
        </Badge>

    )

    const Polarisation = () => (
        p.filter &&
        <Badge radius={"xs"} color={"blue"}>
            Pol.: {p.filter.frequencyCoverage?.polarization}
        </Badge>
    )

    const SkyFrequency = () => (
        p.filter && p.filter.frequencyCoverage?.isSkyFrequency &&
        <Badge radius={"xs"} color={"blue"}>
            Sky Freq.? {p.filter.frequencyCoverage.isSkyFrequency ? "Yes" : "No"}
        </Badge>
    )


    return (
        <Fieldset legend={"Spectroscopic Filter"}>
        <Stack>
            <Group grow>
                <Name/>
                <Polarisation/>
                <SkyFrequency/>
            </Group>
            <Group grow>
                <RangeStart/>
                <RangeEnd/>
                <Resolution/>
            </Group>
            <Description/>
        </Stack>
        </Fieldset>
    )
}

function EmptyDetails(p: {allTelescopes: ObjectIdentifier[]}) : ReactElement {
    return (
        <Stack>
            <DisplayInstrument />
            <DisplayFilter/>
            <DisplayBackend/>
            {
                p.allTelescopes.length > 1 &&
                <Fieldset legend={"Telescopes"}>
                    <Group mt={"sm"} justify={"center"}>
                    {
                        p.allTelescopes.map(t => (
                            <Checkbox
                                key={t.dbid}
                                label={t.name}
                            />
                        ))
                    }
                    </Group>
                </Fieldset>
            }
        </Stack>
    )
}


function ActualDetails(p: {
    cycleId: number,
    modeId: number,
    allTelescopes: ObjectIdentifier[],
    observatoryId: number
}) : ReactElement {

    const mode = useObservingModeResourceGetCycleObservingMode({
        pathParams: {cycleId: p.cycleId, modeId: p.modeId},
    })

    if (mode.isLoading) {
        return (<EmptyDetails allTelescopes={p.allTelescopes}/>)
    }

    if (mode.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load the observing mode"}
                error={getErrorMessage(mode.error)}
            />
        )
    }

    return (
        <Stack>
            <DisplayInstrument instrument={mode.data?.instrument} />
            <DisplayFilter filter={mode.data?.filter} />
            <DisplayBackend backend={mode.data?.backend} />
            {
                p.allTelescopes.length > 1 &&
                <Fieldset legend={"Telescopes"}>
                    <ObservingModeTelescopes
                        observingPlatformId={mode.data?.telescope?._id!}
                        observatoryId={p.observatoryId}
                        allTelescopes={p.allTelescopes}
                    />
                </Fieldset>
            }
        </Stack>
    )
}


export default
function ObservationModeDetailsShow(p: {
    form: UseFormReturnType<SubmissionFormValues>,
    allModes: {value: string, label: string}[],
    observatoryId: number
}) : ReactElement {

    const allTelescopes = useTelescopeResourceGetObservatoryTelescopes({
        pathParams: {observatoryId: p.observatoryId}
    })

    const [mode, setMode] = useState<{value: string, label: string}>()

    const [opened, {toggle}] = useDisclosure(false)

    const setAllObservations = () => {
        p.form.setValues({
            selectedModes: p.form.getValues().selectedModes.map(
                m => ({
                    ...m,
                    modeId: Number(mode!.value),
                    modeName: mode!.label
                })
            )
        })
    }

    if (allTelescopes.isLoading) {
        return (
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (allTelescopes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load telescopes"}
                error={getErrorMessage(allTelescopes.error)}
            />
        )
    }


    return(
        <Stack>
            <ContextualHelpButton messageId={"ManageSubmitObservingModesShow"}/>
            <Grid columns={12}>
                <Grid.Col span={9}>
                    <Select
                        placeholder={"select mode"}
                        data={p.allModes}
                        value={mode ? mode.value : null}
                        onChange={(_value, option) => {
                            setMode(option)
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <Group mt={3}>
                        <Tooltip
                            label={opened ? "Close mode details" : "Show mode details"}
                            openDelay={OPEN_DELAY}
                            closeDelay={CLOSE_DELAY}
                        >
                            <ActionIcon
                                onClick={toggle}
                            >
                                {opened ? <IconEyeClosed /> : <IconEye />}
                            </ActionIcon>
                        </Tooltip>
                        <Button
                            onClick={setAllObservations}
                            size={"compact-md"}
                            disabled={!mode}
                        >
                            Set for all
                        </Button>
                    </Group>
                </Grid.Col>
            </Grid>
            <Collapse in={opened}>
            {
                mode ?
                    <ActualDetails
                        cycleId={p.form.getValues().selectedCycle}
                        modeId={Number(mode.value)}
                        allTelescopes={allTelescopes.data!}
                        observatoryId={p.observatoryId}
                    /> :
                    <EmptyDetails allTelescopes={allTelescopes.data!} />
            }
            </Collapse>
        </Stack>
    )
}

