import {ReactElement, useEffect, useState} from "react";
import {
    useObservatoryResourceGetTelescopeArray
} from "../../generated/proposalToolComponents.ts";
import {Box, Checkbox, Group, Loader} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

export default
function ObservingModeTelescopes(
    p: {
        observingPlatformId: number,
        observatoryId: number,
        allTelescopes: ObjectIdentifier[]
    })
    : ReactElement {

    const telescopeArray = useObservatoryResourceGetTelescopeArray({
        pathParams: {
            observatoryId: p.observatoryId,
            arrayId: p.observingPlatformId
        }
    })

    const [telescopes, setTelescopes] = useState<string[]>([]);


    useEffect(() => {
        if (telescopeArray.status === 'success') {
            setTelescopes(
                telescopeArray.data.arrayMembers!.map(t => (
                    String(t.telescope?._id)
                ))
            )
        }
    }, [telescopeArray.status, p.observingPlatformId]);


    if (telescopeArray.isLoading) {
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

    return (
        <Checkbox.Group
            value={telescopes}
        >
            <Group mt={"sm"} justify={"center"}>
                {
                    p.allTelescopes.map(t => (
                        <Checkbox
                            key={t.dbid}
                            value={String(t.dbid)}
                            label={t.name}
                            color={"blue"}
                        />
                    ))
                }
            </Group>
        </Checkbox.Group>
    )
}