import {ReactElement, useEffect, useState} from "react";
import {ObjectIdentifier, ObservingMode} from "../../generated/proposalToolSchemas.ts";
import {
    useObservingModeResourceGetObservingModeObjects
} from "../../generated/proposalToolComponents.ts";
import {Box, ComboboxItem, List, Loader, Select, Stack} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


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
    allInstruments: ObjectIdentifier[],
    allBackends: ObjectIdentifier[],
    allFilters: ObjectIdentifier[],
    cycleId: number
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


    const siftModes = (sifterObject: SifterObject) => {
        if (!modes.data) {
            return []
        }
        // when a list of objects is returned the first distinct object of
        // is returned as that object. Subsequent objects that
        // are the same DB entity as the first are returned as references,
        // specifically their DB id. Notice this applies recursively to sub-objects
        // of objects, though in this case Instruments and Backends only contain
        // fundamental types.
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

    useEffect(()=>{
        if (modes.status === 'success') {
            setSiftedModes(modes.data)
        }
    }, [modes.status])

    useEffect(() => {
        setSiftedModes(siftModes(sifters))
    }, [sifters])


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
            <Select
                label={"Instrument"}
                data={p.allInstruments.map(i =>
                    ({value: String(i.dbid!), label: i.name!})
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
                data={p.allBackends.map(b =>
                    ({value: String(b.dbid!), label: b.name!})
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
            <List>
                {
                    siftedModes.map(mode => (
                        <List.Item key={mode._id}>
                            {mode.name}
                        </List.Item>
                    ))
                }
            </List>
        </Stack>
    )
}