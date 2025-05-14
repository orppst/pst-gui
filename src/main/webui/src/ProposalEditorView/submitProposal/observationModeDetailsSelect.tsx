import {ReactElement, useEffect, useState} from "react";
import {ObjectIdentifier, Observatory, ObservingMode} from "../../generated/proposalToolSchemas.ts";
import {
    useObservingModeResourceGetObservingModeObjects
} from "../../generated/proposalToolComponents.ts";
import {Badge, Box, ComboboxItem, Group, Text, Loader, Select, Stack, Fieldset, Space} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {UseFormReturnType} from "@mantine/form";
import {SubmissionFormValues} from "./submitPanel.tsx";
import ObservationModeDetailsShow from "./observationModeDetailsShow.tsx";
import * as React from "react";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";


/*
    ObservingModes consist of Instruments, Backends, and Filters. A distinct
    ObservingMode then is a unique combination of these parts, and there may be
    several modes that use the same instrument and/or backend and/or filter.
    Instruments and Backends are owned by Observatories and ObservingModes
    reference these. Notice that Filters are different in that they belong to
    ObservingMode objects only, and that ObservingModes do not cross-reference
    Filters. In other words, distinct Filters in the DB i.e., different DB
    entities, may actually be the "same" filter that just belong to different
    modes. As such we "sift" the filters based on name.
 */

interface SifterObject {
    instrumentTerm: number,
    backendTerm: number,
    filterTerm: string
}

export default
function ObservationModeDetailsSelect(p: {
    setObservingModes:  React.Dispatch<React.SetStateAction<{ value: string, label: string }[]>>
    observatory: Observatory,
    allFilters: ObjectIdentifier[],
    cycleId: number,
    form: UseFormReturnType<SubmissionFormValues>
}) : ReactElement {

    const modes = useObservingModeResourceGetObservingModeObjects({
        pathParams: {cycleId: p.cycleId}
    })

    const [instrument, setInstrument] = useState<ComboboxItem | null>(null);
    const [backend, setBackend] = useState<ComboboxItem | null>(null);
    const [filter, setFilter] = useState<ComboboxItem | null>(null);


    const [sifters, setSifters] = useState<SifterObject>({
        instrumentTerm: 0,
        backendTerm: 0,
        filterTerm: ''
    });

    const [siftedModes, setSiftedModes] = useState<ObservingMode[]>([])


    useEffect(()=>{
        if (modes.status === 'success') {
            setSiftedModes(modes.data)
        }
    }, [modes.data, modes.status])

    //set sifted modes depending on changes to the 'sifters'
    useEffect(() => {
        const siftModes = (sifterObject: SifterObject) => {
            if (!modes.data) {
                return []
            }
            // when a list of objects is returned the first distinct object of the list
            // is returned as that object. Subsequent objects that
            // are the same DB entity as the first are returned as references,
            // specifically their DB id. Notice this applies recursively to sub-objects
            // of objects, though in this case Instruments and Backends, which are sub-objects of
            // ObservingModes, only contain fundamental types.
            return (
                modes.data.filter(mode => {
                    return (
                        sifterObject.instrumentTerm > 0 ?
                            mode.instrument === sifterObject.instrumentTerm ||
                            mode.instrument?._id === sifterObject.instrumentTerm
                            : true
                    )
                }).filter(mode => {
                    return(
                        sifterObject.backendTerm > 0 ?
                            mode.backend === sifterObject.backendTerm ||
                            mode.backend?._id === sifterObject.backendTerm
                            : true
                    )
                }).filter(mode => {
                    return(
                        sifterObject.filterTerm.length > 0 ?
                            mode.filter?.name?.toLowerCase().includes(sifterObject.filterTerm.toLowerCase())
                            : true
                    )
                })
            )

        }


        setSiftedModes(siftModes(sifters))
    }, [modes.data, sifters])

    //this sets the observing modes available for individual select inputs of the observation table
    useEffect(() => {
        p.setObservingModes(siftedModes.map(mode =>(
            {value: String(mode._id), label: mode.name!}
        )))
    }, [p, siftedModes]);

    if (modes.isLoading) {
        return (
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (modes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load observing modes"}
                error={getErrorMessage(modes.error)}
            />
        )
    }

    return(
        <Stack>
            <Fieldset legend={"Search Filters"}>
                <ContextualHelpButton messageId={"ManageSubmitObservingModesFilter"}/>
                <Group grow>
                    <Select
                        label={"Instrument"}
                        placeholder={"none selected"}
                        searchable
                        description={"Total defined: " + p.observatory.instruments?.length}
                        data={p.observatory.instruments?.map(i =>
                            ({value: String(i._id!), label: i.name!})
                        )}
                        value={instrument ? instrument.value : null}
                        onChange={(_value, option) => {
                            setInstrument(option);
                            setSifters({
                                instrumentTerm: option? Number(option.value) : 0,
                                backendTerm: backend ? Number(backend.value) : 0,
                                filterTerm: filter? filter.label : ''
                            })
                        }}
                    />
                    <Select
                        label={"Backend"}
                        placeholder={"none selected"}
                        searchable
                        description={"Total defined: " + p.observatory.backends?.length}
                        data={p.observatory.backends?.map(b =>
                            ({value: String(b._id!), label: b.name!})
                        )}
                        value={backend ? backend.value : null}
                        onChange={(_value, option) => {
                            setBackend(option);
                            setSifters({
                                instrumentTerm: instrument ? Number(instrument.value) : 0,
                                backendTerm: option ? Number(option.value) : 0,
                                filterTerm: filter? filter.label : ''
                            })
                        }}
                    />
                    <Select
                        label={"Spectroscopic Filter"}
                        placeholder={"none selected"}
                        searchable
                        description={"Total defined: " + p.allFilters.length}
                        data={p.allFilters.map(f =>
                            ({value: String(f.dbid!), label: f.name!})
                        )}
                        value={filter ? filter.value : null}
                        onChange={(_value, option) => {
                            setFilter(option);
                            setSifters({
                                instrumentTerm: instrument ? Number(instrument.value) : 0,
                                backendTerm: backend ? Number(backend.value) : 0,
                                filterTerm: option ? option.label : ''
                            })
                        }}
                    />
                </Group>
                <Space h={"md"}/>
                <Group justify={"center"}>
                    <Text size={"sm"}>
                        Matching Observing Modes:
                    </Text>
                    <Badge radius={"xs"} color={siftedModes.length > 0 ? "green": "red"}>
                        {siftedModes.length} / {modes.data?.length}
                    </Badge>
                </Group>
            </Fieldset>

            <Fieldset legend={"Observing Mode Details"}>
                <ObservationModeDetailsShow
                    form={p.form}
                    allModes={siftedModes.map(mode =>(
                        {value: String(mode._id), label: mode.name!}
                    ))}
                    observatoryId={p.observatory._id!}
                />
            </Fieldset>
        </Stack>
    )
}