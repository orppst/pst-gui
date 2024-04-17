import {ReactElement} from "react";
import {
    ActionIcon,
    AppShell,
    Burger, Checkbox, Container,
    Grid,
    Group, ScrollArea,
    Tooltip, useMantineColorScheme, useMantineTheme
} from "@mantine/core";
import {
    APP_HEADER_HEIGHT, CLOSE_DELAY, ICON_SIZE,
    NAV_BAR_DEFAULT_WIDTH,
    NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH,
    OPEN_DELAY
} from "../constants.tsx";
import {IconLicense, IconLogout} from "@tabler/icons-react";
import {Outlet, useNavigate} from "react-router-dom";
import {ColourSchemeToggle} from "../ColourSchemeToggle.tsx";
import {useDisclosure} from "@mantine/hooks";
import CycleList from "./cycleList.tsx";

export default function ProposalManagerStartPage() : ReactElement {
    const navigate = useNavigate();
    const [opened, {toggle}] = useDisclosure();
    const theme = useMantineTheme();
    const {colorScheme} = useMantineColorScheme();

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
                    <Container
                        fluid
                        bg={colorScheme === 'dark' ? theme.colors.cyan[9] : theme.colors.blue[1]}
                        py={"xs"}
                    >
                        <Checkbox.Group
                            defaultValue={['active']}
                            label={"Proposal Cycle Status"}
                        >
                            <Group mt={"md"}>
                                <Checkbox value={"active"} label={"Active"} />
                                <Checkbox value={"closed"} label={"Closed"} />
                            </Group>
                        </Checkbox.Group>
                    </Container>
                </AppShell.Section>
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