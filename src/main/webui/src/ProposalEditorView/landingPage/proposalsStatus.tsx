import {PanelHeader} from "../../commonPanel/appearance.tsx";
import {
    useProposalResourceGetProposals
} from "../../generated/proposalToolComponents.ts";
import {List, Table} from "@mantine/core";
import {randomId} from "@mantine/hooks";

type ProposalRowProps = {
    title: string
    kind: string
}

function ProposalsTableRow(props: ProposalRowProps) {
    return <Table.Tr>
        <Table.Td>{props.title}</Table.Td>
        <Table.Td>{props.kind}</Table.Td>
    </Table.Tr>

}

function ProposalsStatus () {
    const {data, error, isLoading} = useProposalResourceGetProposals({});

    if(error) {
        return <><PanelHeader itemName={"Proposals"} panelHeading={"Unavailable"}/></>
    }

    const listProposals = () => {
        if(data?.length == 0) {
            return <List key={randomId()}>Please create a proposal</List>
        }
        return <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Type</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data?.map((proposal) => {
                    return <ProposalsTableRow key={proposal.code}
                                              title={proposal.title!}
                                              kind={proposal.kind!} />;
                })}
            </Table.Tbody>
        </Table>
    }

    return <><PanelHeader itemName={"Proposals"} panelHeading={"Status"}/>
        {isLoading?'Loading...':listProposals()}
        </>

}

export default ProposalsStatus