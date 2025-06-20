import {ReactElement} from "react";
import {ActionIcon, Group, Loader, Table, Text, Tooltip} from "@mantine/core";
import {CLOSE_DELAY, ICON_SIZE, OPEN_DELAY} from "../constants.tsx";
import {IconKey} from "@tabler/icons-react";
import {
    useSubjectMapResourceSubjectMapList
} from "../generated/proposalToolComponents.ts";
import {SubjectMap} from "../generated/proposalToolSchemas.ts";
import {SubjectMapsTableRow, SubjectMapsTableHeader} from './subjectMapsTable.tsx';
import AlertErrorMessage from "../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";

function AdminPanel(): ReactElement {

    const subjectMap  = useSubjectMapResourceSubjectMapList({});

    if (subjectMap.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to fetch subject map list"}
                error={getErrorMessage(subjectMap.error)}
            />
        )
    }


    if (subjectMap.isLoading) {
        return (<Loader/>)
    }


    /**
     * function to return the ReactElement for a Table displaying the People stored in
     * the database. The table row background is either green, for those People registered
     * with Keycloak, or orange, for those People not registered with Keycloak.
     */
    const SubjectMapsTable = () : ReactElement => {
        return (
            <Table>
                <SubjectMapsTableHeader />
                <Table.Tbody>
                    {
                        subjectMap.data?.map((subjectMap : SubjectMap) => {
                            return (
                                <SubjectMapsTableRow key={subjectMap.uid} {...subjectMap}/>
                            )
                        })
                    }
                </Table.Tbody>
            </Table>
        )
    }


    /**
     * function to return the ReactElement for an action icon that links to
     * the keycloak administration console. Notice this requires an
     * administrator username and password.
     *
     */
    const DisplayKeycloakAdminConsoleButton = () : ReactElement => {
        return (
            <Group justify={"flex-end"}>
                <Text>
                    Keycloak Administration Console:
                </Text>
                <Tooltip label={"Keycloak administration console"}
                         openDelay={OPEN_DELAY}
                         closeDelay={CLOSE_DELAY}
                >
                    <ActionIcon color={"blue.7"}
                                variant={"outline"}
                                component={"a"}
                                href={"http://localhost:53536/admin"}
                                target={"_blank"}
                                rel={"noopener noreferrer"}
                    >
                        <IconKey size={ICON_SIZE}/>
                    </ActionIcon>
                </Tooltip>
            </Group>
        )
    }


    return(
        <>
            <DisplayKeycloakAdminConsoleButton />
            <SubjectMapsTable />
        </>
    )
}

export default AdminPanel;