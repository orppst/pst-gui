import {ReactElement} from "react";
import {Box, List} from "@mantine/core";
import {
    useProposalCyclesResourceGetOpenProposalCycles,
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";


function ObservatoriesCyclesPanel (): ReactElement {
    const { data , error, isLoading } = useProposalCyclesResourceGetOpenProposalCycles({queryParams: {}});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }


    const listCycles = () => {
        return <List>
            {data?.map((cycle) => {
                return <List.Item>{cycle.name}</List.Item>;
            })}
        </List>
    };


    return <>Open cycles available for your proposals

        {isLoading? 'Loading' : listCycles()}

    </>;

}

export default ObservatoriesCyclesPanel