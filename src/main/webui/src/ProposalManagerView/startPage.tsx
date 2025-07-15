import {ReactElement} from "react";
import {
    ActionIcon,
    AppShell,
    Burger,
    Grid,
    Group, Modal, ScrollArea,
    Tooltip, useMantineTheme
} from "@mantine/core";
import {
    APP_HEADER_HEIGHT,
    NAV_BAR_DEFAULT_WIDTH,
    NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH,
    OPEN_DELAY
} from "../constants.tsx";
import {IconLicense} from "@tabler/icons-react";
import {Outlet, useNavigate} from "react-router-dom";
import {ColourSchemeToggle} from "../ColourSchemeToggle.tsx";
import {useDisclosure} from "@mantine/hooks";
import CycleList from "./cycleList.tsx";
import AddButton from "../commonButtons/add.tsx";
import NewCycleForm from "./proposalCycle.new.form.tsx";
import {HaveRole} from "../auth/Roles.tsx";
import UserMenu from "../userMenu.tsx";

export default function ProposalManagerStartPage() : ReactElement {
    const navigate = useNavigate();
    const [opened, {toggle}] = useDisclosure();
    const theme = useMantineTheme();

    const [modalOpened, {close, open}] = useDisclosure();

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
                                color={theme.colors.gray[6]}
                                mr="xl"
                            />
                            <img src={"/pst/gui/polaris4.png"}
                                 alt="Polaris"
                                 width={60}/>
                            <Tooltip
                                label={"go to proposal editor view"}
                                openDelay={OPEN_DELAY}
                            >
                                <ActionIcon
                                    onClick={() => {navigate("/")}}
                                    color={"pink"}
                                    variant={"subtle"}
                                >
                                    <IconLicense />
                                </ActionIcon>
                            </Tooltip>
                            {HaveRole(["obs_administration"]) &&
                            <AddButton toolTipLabel={"new proposal cycle"}
                                       label={"Create a new Proposal Cycle"}
                                       onClick={open}
                            />}
                            <Modal
                                opened={modalOpened}
                                onClose={close}
                                title={"New Proposal Cycle Form"}
                                size={"40%"}
                                closeOnClickOutside={false}
                            >
                                <NewCycleForm closeModal={close} />
                            </Modal>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <Group justify={"flex-end"}>
                            <UserMenu />
                            {ColourSchemeToggle()}
                        </Group>
                    </Grid.Col>
                </Grid>
            </AppShell.Header>
            <AppShell.Navbar>
                <AppShell.Section component={ScrollArea}>
                    <CycleList/>
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main pr={"sm"}>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    )
}