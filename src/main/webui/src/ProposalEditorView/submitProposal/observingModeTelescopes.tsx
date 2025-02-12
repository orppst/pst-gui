import {ReactElement, useState} from "react";
import {
    useObservatoryResourceGetTelescopeArray,
    useTelescopeResourceGetObservatoryTelescopes
} from "../../generated/proposalToolComponents.ts";
import {Box, Checkbox, Group, Loader} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export default
function observingModeTelescopes(p: {observatoryId: number, observingPlatformId: number}) : ReactElement {

    const telescopeArray = useObservatoryResourceGetTelescopeArray({
        pathParams: {
            observatoryId: p.observatoryId,
            arrayId: p.observingPlatformId
        }
    })

    const allTelescopes = useTelescopeResourceGetObservatoryTelescopes({
        pathParams: {observatoryId: p.observatoryId}
    })

    const [telescopes, setTelescopes] = useState<string[]>([]);


    if (telescopeArray.isLoading || allTelescopes.isLoading) {
        return (
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (telescopeArray.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load the Telescope Array"}
                error={getErrorMessage(telescopeArray.error)}
            />
        )
    }

    if (allTelescopes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load the observatory telescopes"}
                error={getErrorMessage(allTelescopes.error)}
            />
        )
    }

    return (
        <>
            {
                allTelescopes.data?.length && allTelescopes.data.length > 1 &&
                <Checkbox.Group
                    value={telescopes}
                    onChange={setTelescopes}
                    label={"Telescopes"}
                >
                    <Group mt={"sm"}>
                        {
                            allTelescopes.data?.map(t => (
                                <Checkbox
                                    key={t.dbid}
                                    value={String(t.dbid)}
                                    label={t.name}
                                />
                            ))
                        }
                    </Group>
                </Checkbox.Group>
            }
        </>
    )
}