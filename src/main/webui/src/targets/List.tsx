import {
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";

import AddTargetPanel from "./New";
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
                    <AddTargetPanel/>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                                return (<Box sx={(theme) => ({
                                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                                    padding: theme.spacing.xl,
                                    margin: theme.spacing.md,
                                    borderRadius: theme.radius.md,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor:
                                            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                                    },
                                })}><RenderTarget proposalCode={Number(selectedProposalCode)} dbid={item.dbid!} key={item.dbid}/></Box>)
                            } )
                    }
                </Box>
            </Box>
        );
    }


export default TargetPanel