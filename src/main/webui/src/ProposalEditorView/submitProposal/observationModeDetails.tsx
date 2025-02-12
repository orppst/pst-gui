import {ReactElement, useEffect, useState} from "react";
import {Box, ComboboxItem, Loader, Select, Stack} from "@mantine/core";
import {
    useBackendResourceGetObservatoryBackends,
    useInstrumentResourceGetObservatoryInstruments,
    useObservingModeResourceGetCycleObservingMode,
} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


type SelectData = {
    value: string,
    label: string
}

export default
function ObservationModeDetails(
    p: {observatoryId: number, observingModeId: number, selectedCycleId: number})
    : ReactElement {

    const observingMode = useObservingModeResourceGetCycleObservingMode({
        pathParams: {cycleId: p.selectedCycleId, modeId: p.observingModeId}
    })

    const allInstruments = useInstrumentResourceGetObservatoryInstruments({
        pathParams: {observatoryId: p.observatoryId}
    })

    const allBackends = useBackendResourceGetObservatoryBackends({
        pathParams: {observatoryId: p.observatoryId}
    })

    // the data lists for the 'Select' Input
    const [instruments, setInstruments] = useState<SelectData[]>([]);
    const [backends, setBackends] = useState<SelectData[]>([]);

    //the instrument and backend chosen
    const [instrument, setInstrument] = useState<ComboboxItem | null>(null);
    const [backend, setBackend] = useState<ComboboxItem | null>(null);

    useEffect(() => {
        if (allInstruments.status === 'success' && allBackends.status === 'success')
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


    if (allInstruments.isLoading || allBackends.isLoading || observingMode.isLoading) {
        return(
            <Box mx={"20%"}>
                <Loader />
            </Box>
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

    if (observingMode.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load observatory mode"}
                error={getErrorMessage(observingMode.error)}
            />
        )
    }

    return (
        <Stack>
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

        </Stack>
    )

}