import {
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";

import AddTargetModal from "./New";
import {useParams} from "react-router-dom";
import {Box, Text} from "@mantine/core";
import {RenderTarget} from "./RenderTarget";

function TargetPanel() {
    const { selectedProposalCode} = useParams();


    const {  data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    return (
            <Box>
                <Text fz="lg" fw={700}>Add and edit targets</Text>
                <Box>
                    <AddTargetModal/>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                                return (<Box key={item.dbid}>
                                    <RenderTarget proposalCode={Number(selectedProposalCode)} dbid={item.dbid!} showRemove={true}/></Box>)
                            } )
                    }
                </Box>
            </Box>
        );
    }


export default TargetPanel