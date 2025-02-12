import {ReactElement, useEffect, useState} from "react";
import {Box, ComboboxItem, List, Loader, Select, Stack} from "@mantine/core";
import {
    useBackendResourceGetObservatoryBackends,
    useInstrumentResourceGetObservatoryInstruments,
    useTelescopeResourceGetObservatoryTelescopes,
} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ObservingModeTelescopes from "./observingModeTelescopes.tsx";
import {Filter} from "../../generated/proposalToolSchemas.ts";


type SelectData = {
    value: string,
    label: string
}


export default
function ObservationModeDetails(
    p: {
        observatoryId: number,
        selectedCycleId: number,
        filters: Filter[]
    })
    : ReactElement {


    const allTelescopes = useTelescopeResourceGetObservatoryTelescopes({
        pathParams: {observatoryId: p.observatoryId}
    })

    const allInstruments = useInstrumentResourceGetObservatoryInstruments({
        pathParams: {observatoryId: p.observatoryId}
    })

    const allBackends = useBackendResourceGetObservatoryBackends({
        pathParams: {observatoryId: p.observatoryId}
    })

    // the data lists for the 'Select' inputs
    const [instruments, setInstruments] = useState<SelectData[]>([]);
    const [backends, setBackends] = useState<SelectData[]>([]);

    //the instrument and backend chosen
    const [instrument, setInstrument] = useState<ComboboxItem | null>(null);
    const [backend, setBackend] = useState<ComboboxItem | null>(null);

    useEffect(() => {
        if (allInstruments.status === 'success' &&
            allBackends.status === 'success')
        {
            setInstruments(
                allInstruments.data.map(i => (
                    {value: String(i.dbid), label: i.name!}
                ))
            )
            setBackends(
                allBackends.data.map(b => (
                    {value: String(b.dbid), label: b.name!}
                ))
            )
        }
    }, [allInstruments.status, allBackends.status])


    if (allTelescopes.isLoading || allInstruments.isLoading || allBackends.isLoading) {
        return(
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (allTelescopes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load observatory telescopes"}
                error={getErrorMessage(allTelescopes.error)}
            />
        )
    }

    if (allInstruments.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load observatory instruments"}
                error={getErrorMessage(allInstruments.error)}
            />
        )
    }

    if (allBackends.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load observatory backends"}
                error={getErrorMessage(allBackends.error)}
            />
        )
    }

    return (
        <Stack>
            {
                allTelescopes.data && allTelescopes.data.length > 1 &&
                <ObservingModeTelescopes
                    observingPlatformId={1} //fixme
                    observatoryId={p.observatoryId}
                    allTelescopes={allTelescopes.data}
                />
            }
            <Select
                label={"Instruments"}
                placeholder={"pick one"}
                data={instruments}
                value={instrument ? instrument.value : null}
                onChange={(_value, option) => {
                    setInstrument(option)
                }}
            />
            <Select
                label={"Backends"}
                placeholder={"pick one"}
                data={backends}
                value={backend ? backend.value : null}
                onChange={(_value, option) => {
                    setBackend(option)
                }}
            />
            <List>
                {
                    p.filters.map(f => (
                        <List.Item>{f.name}</List.Item>
                    ))
                }
            </List>

        </Stack>
    )

}