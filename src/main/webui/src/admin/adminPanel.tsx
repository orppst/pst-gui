import {ReactElement} from "react";
import {ActionIcon, Box, Group, Table, Text, Tooltip} from "@mantine/core";
import {CLOSE_DELAY, ICON_SIZE, JSON_SPACES, OPEN_DELAY} from "../constants.tsx";
import {IconKey} from "@tabler/icons-react";
import {
    useSubjectMapResourceSubjectMapList
} from "../generated/proposalToolComponents.ts";
import {SubjectMap} from "../generated/proposalToolSchemas.ts";
import SubjectMapRow, {subjectMapsTableHeader} from './subjectMapsTable.tsx';

function AdminPanel(): ReactElement {

    const {
        data: subjectMaps,
        error: subjectMapsError,
        isLoading: subjectMapsIsLoading
    } = useSubjectMapResourceSubjectMapList({});

    if (subjectMapsError) {
        return (
            <Box>
                <pre>{JSON.stringify(subjectMapsError, null, JSON_SPACES)}</pre>
            </Box>
        )
    }

    /**
     * function to return the ReactElement for a Table displaying the People stored in
     * the database. The table row background is either green, for those People registered
     * with Keycloak, or orange, for those People not registered with Keycloak.
     */
    const SubjectMapsTableGenerator = () : ReactElement => {
        return (
            <Table>
                {subjectMapsTableHeader()}
                <Table.Tbody>
                    {
                        subjectMaps?.map((subjectMap : SubjectMap) => {
                            return (
                                <SubjectMapRow
                                    key={subjectMap.uid}
                                    subjectMap={subjectMap}
                                    inKeycloak={subjectMap.inKeycloakRealm!}
                                />
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

            {
                subjectMapsIsLoading ? "Loading ..." :
                    <SubjectMapsTableGenerator />
            }


        </>
    )
}

export default AdminPanel;