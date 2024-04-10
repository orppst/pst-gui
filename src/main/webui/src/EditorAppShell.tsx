import {ReactElement, SyntheticEvent, useContext} from "react";
import {
    ActionIcon,
    AppShell,
    Burger,
    Container,
    FileButton,
    Grid,
    Group, ScrollArea,
    Text,
    TextInput,
    Tooltip, useMantineColorScheme, useMantineTheme
} from "@mantine/core";
import {
    APP_HEADER_HEIGHT, CLOSE_DELAY, ICON_SIZE,
    NAV_BAR_DEFAULT_WIDTH,
    NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH,
    OPEN_DELAY
} from "./constants.tsx";
import DatabaseSearchButton from "./commonButtons/databaseSearch.tsx";
import AddButton from "./commonButtons/add.tsx";
import {handleUploadZip} from "./ProposalEditorView/proposal/UploadProposal.tsx";
import UploadButton from "./commonButtons/upload.tsx";
import {ColourSchemeToggle} from "./ColourSchemeToggle.tsx";
import {IconLogout, IconUniverse} from "@tabler/icons-react";
import {Outlet, useNavigate} from "react-router-dom";
import {useDisclosure} from "@mantine/hooks";
import {ProposalContext} from "./App2.tsx";
import {useHistoryState} from "./useHistoryState.ts";
import {ProposalList} from "./ProposalList.tsx";

export default function EditorAppShell()
    : ReactElement {

    const [opened, {toggle}] = useDisclosure();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const {colorScheme} = useMantineColorScheme();
    const [proposalTitleFilter, setProposalTitleFilter] = useHistoryState(
        "proposalTitle", "");
    const [investigatorNameFilter, setInvestigatorNameFilter] = useHistoryState(
        "investigatorName", "");
    const proposalContext = useContext(ProposalContext);

    const GRAY = theme.colors.gray[6];

    /**
     * resolves the routing for when making a new proposal.
     *
     * @param {React.SyntheticEvent} event the event.
     */
    function handleAddNew(event: SyntheticEvent): void {
        event.preventDefault();
        navigate("proposal/new");
    }

    /**
     * resolves the routing for when searching for a proposal.
     *
     * @param {React.SyntheticEvent} event the event.
     */
    function handleSearch(event: SyntheticEvent): void {
        event.preventDefault();
        navigate("/editor");
    }

    function ProposalListWrapper(props:{proposalTitle: string, investigatorName:string, auth:boolean}) : ReactElement {

        if (props.auth) {
            return <ProposalList proposalTitle={props.proposalTitle} investigatorName={props.investigatorName} />
        }
        else {
            return <></>
        }
    }

    return (
        <AppShell
            header={{height: APP_HEADER_HEIGHT}}
            navbar={{
                width: {
                    base: NAV_BAR_DEFAULT_WIDTH,
                    md: NAV_BAR_MEDIUM_WIDTH,
                    lg: NAV_BAR_LARGE_WIDTH},
                breakpoint: 'sm',
                collapsed: {mobile: !opened},
            }}
        >
            <AppShell.Header p="md">
                <Grid columns={2}>
                    <Grid.Col span={1}>
                        <Group h="100%" px="md" wrap={"nowrap"}>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom={"sm"}
                                size="lg"
                                color={GRAY}
                                mr="xl"
                            />
                            <img src={"/pst/gui/polaris4.png"}
                                 alt="Polaris"
                                 width={60}
                            />
                            <ActionIcon
                                color={"pink"}
                                variant={"subtle"}
                                onClick={(e: SyntheticEvent)=>{e.preventDefault(); navigate("/manager")}}
                            >
                                <IconUniverse />
                            </ActionIcon>
                            <DatabaseSearchButton
                                toolTipLabel={
                                    "Locate proposals by " +
                                    proposalContext.user.fullName + "."}
                                label={"Proposals for " + proposalContext.user.fullName}
                                onClickEvent={handleSearch}
                            />
                            <AddButton toolTipLabel={"new proposal"}
                                       label={"Create a new proposal"}
                                       onClickEvent={handleAddNew}/>
                            <FileButton onChange={handleUploadZip}
                                        accept={".zip"}>
                                {(props) => <UploadButton
                                    toolTipLabel="select a file from disk to upload"
                                    label={"Import"}
                                    onClick={props.onClick}/>}
                            </FileButton>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <Group justify={"flex-end"}>
                            {ColourSchemeToggle()}
                            <Tooltip label={"logout"}
                                     openDelay={OPEN_DELAY}
                                     closeDelay={CLOSE_DELAY}
                            >
                                <ActionIcon color={"orange.8"}
                                            variant={"subtle"}
                                            component={"a"}
                                            href={"/pst/gui/logout"}
                                >
                                    <IconLogout size={ICON_SIZE}/>
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Grid.Col>
                </Grid>
            </AppShell.Header>

            <AppShell.Navbar>
                <AppShell.Section>
                    <Container fluid bg={colorScheme === 'dark' ? theme.colors.cyan[9] : theme.colors.blue[1]}>
                        <Text fz="sm">
                            Filter existing proposals by:
                        </Text>
                        <TextInput label="Title"
                                   value={proposalTitleFilter}
                                   onChange={(e: { target: { value: string; }; }) =>
                                       setProposalTitleFilter(e.target.value)}
                        />
                        <TextInput label="Investigator name"
                                   value={investigatorNameFilter}
                                   onChange={(e: { target: { value: string; }; }) =>
                                       setInvestigatorNameFilter(e.target.value)}
                                   pb={"md"}
                        />
                    </Container>
                </AppShell.Section>
                <AppShell.Section component={ScrollArea}>
                    <ProposalListWrapper
                        proposalTitle={proposalTitleFilter}
                        investigatorName={investigatorNameFilter}
                        auth={proposalContext.authenticated}
                    />
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main pr={"sm"}>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    )
}