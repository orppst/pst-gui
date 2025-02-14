import {ReactElement, useEffect, useState} from "react";
import {ObjectIdentifier, ObservingMode} from "../../generated/proposalToolSchemas.ts";
import {
    useObservingModeResourceGetObservingModeObjects
} from "../../generated/proposalToolComponents.ts";
import {Box, ComboboxItem, List, Loader, Select, Stack} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";



/*
    Please note that sometimes there are not enough words in the English language hence the use of 'Sift'
 */

interface SifterObject {
    instrumentTerm: string,
    backendTerm: string,
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
        instrumentTerm: '',
        backendTerm: '',
        filterTerm: ''
    });

    const [siftedModes, setSiftedModes] = useState<ObservingMode[]>([])


    const siftModes = (sifterObject: SifterObject) => {
        if (!modes.data) {
            return []
        }
        return (
            modes.data.filter(mode => {
                return (
                    sifterObject.instrumentTerm.length > 0 ?
                        mode.instrument?.name?.toLowerCase().includes(sifterObject.instrumentTerm.toLowerCase())
                        : true
                )
            }).filter(mode => {
                return(
                    sifterObject.backendTerm.length > 0 ?
                        mode.backend?.name?.toLowerCase().includes(sifterObject.backendTerm.toLowerCase())
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

            console.log(modes)
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
                        instrumentTerm: option? option.label : '',
                        backendTerm: backend ? backend.label : '',
                        filterTerm: filter ? filter.label : ''
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
                        instrumentTerm: instrument ? instrument.label : '',
                        backendTerm: option ? option.label : '',
                        filterTerm: filter ? filter.label : ''
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
                        instrumentTerm: instrument ? instrument.label : '',
                        backendTerm: backend ? backend.label : '',
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