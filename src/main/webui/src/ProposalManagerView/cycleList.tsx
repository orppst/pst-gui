import {ReactElement, useState} from "react";
import {
    Accordion,
    Checkbox,
    Container, Flex,
    Group,
    NavLink,
    Select,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import {
    IconBike,
    IconCalendar, IconClipboardPlus, IconEdit,
    IconSquareChevronsRight, IconThumbUp,
    IconUfo, IconUserPin,
    IconUsersGroup
} from "@tabler/icons-react";
import {
    useObservatoryResourceGetObservatories,
    useProposalCyclesResourceGetMyTACMemberProposalCycles, useProposalCyclesResourceGetProposalCycles,
} from "src/generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "src/generated/proposalToolSchemas.ts";
import {Link} from "react-router-dom";
import {HaveRole} from "../auth/Roles.tsx";

/*
    FYI: We have made composite roles that are recursive e.g. a
    "tac_admin" is composed of "tac_member" which in turn is composed
    of "reviewer"; think of it like class inheritance, a "tac_admin"
    is a "tac_member" and all "tac_members" are "reviewers", but not
    all "reviewers" are "tac_members".
 */

export default function CycleList() : ReactElement {
    const {colorScheme} = useMantineColorScheme();
    const theme = useMantineTheme();
    const [onlyOpen, setOnlyOpen] = useState<boolean>(false);
    const [observatoryFilter, setObservatoryFilter] = useState<boolean>(false);
    const [selectedObservatory, setSelectedObservatory] = useState<number>(0);

    const obsList = useObservatoryResourceGetObservatories(
        {queryParams: {}}
    );

    const observatoryList = obsList.data?.map(obs => {
        if(obs.dbid) {
            if (selectedObservatory == 0)
                setSelectedObservatory(obs.dbid)
            if (obs.name)
                return {value: obs.dbid.toString(), label: obs.name};
        }
    })


    //this check may be redundant
    if(!HaveRole(["obs_administration", "tac_member", "reviewer"])) {
        return <>Not authorised</>
    }

    //FIXME: use an actual query

    const cycles = observatoryFilter
        ? useProposalCyclesResourceGetMyTACMemberProposalCycles(
            {queryParams: {includeClosed: !onlyOpen, observatoryId: selectedObservatory}}
        ) : useProposalCyclesResourceGetProposalCycles(
            {queryParams: {includeClosed: !onlyOpen}}
        )

    const [accordionValue, setAccordionValue]
        = useState<string | null>(null);


    const cyclesList = cycles.data?.map((cycle) => {
        return <CycleItem key={cycle.dbid} cycle={cycle} />
    })

    return (
        <>
        <Container
            fluid
            bg={colorScheme === 'dark' ? theme.colors.cyan[9] : theme.colors.blue[1]}
            py={"xs"}
        >
            <Checkbox.Group
                defaultValue={['active']}
                label={"Proposal Cycle Filter"}
            >
                <Group mt={"md"}>
                    <Checkbox
                        value={"closed"}
                        label={"Only open cycles"}
                        onChange={(event) => setOnlyOpen(event.currentTarget.checked)}
                    />
                    {HaveRole(["obs_administration"]) &&
                    <Checkbox
                        value={"allcycles"}
                        label={"By observatory"}
                        onChange={(event) => setObservatoryFilter(event.currentTarget.checked)}
                    />}
                </Group>
            </Checkbox.Group>
            {observatoryFilter &&
                <Flex
                    mih={50}
                    justify="Flex-start"
                    align="Flex-end">
                    <Select
                        miw={'100%'}
                        defaultValue={selectedObservatory.toString()}
                        allowDeselect={false}
                        comboboxProps={{ width: 200, position: 'bottom-start' }}
                        aria-label="Select an observatory"
                        //@ts-ignore
                        data={observatoryList}
                        onChange={(_value) => {
                        if(_value)
                            setSelectedObservatory(+_value)
                            }
                        }
                    />
                </Flex>
            }
        </Container>

        <Accordion value={accordionValue}
                   onChange={setAccordionValue}
                   variant={"filled"}
        >
            {cyclesList}
        </Accordion>
        </>
    )
}

function CycleItem(props:{cycle: ObjectIdentifier}): ReactElement {
    const cycle = props.cycle;
    const [active, setActive] = useState("");

    return (
        <Accordion.Item value={String(cycle.dbid)}>
            <Accordion.Control>
                <Group>
                    <IconBike/>
                    {cycle.name}
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <NavLink to={"cycle/" + cycle.dbid}
                         component={Link}
                         key={"Overview"}
                         label={"Overview"}
                         leftSection={<IconUfo/>}
                         active={"Overview" + cycle.code === active}
                         onClick={()=>setActive("Overview" + cycle.code)}
                />
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/details"}
                         component={Link}
                         key={"Details"}
                         label={"Details"}
                         leftSection={<IconCalendar/>}
                         active={"Details" + cycle.code === active}
                         onClick={()=>setActive("Details" + cycle.code)}
                />}
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/tac"}
                         component={Link}
                         key={"TAC"}
                         label={"TAC"}
                         leftSection={<IconUsersGroup/>}
                         active={"TAC" + cycle.code === active}
                         onClick={()=>setActive("TAC" + cycle.code)}
                />}
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/createReviewers"}
                         component={Link}
                         key={"CreateReviewers"}
                         label={"Create Reviewers"}
                         leftSection={<IconClipboardPlus/>}
                         active={"CreateReviewers" + cycle.code === active}
                         onClick={()=>setActive("CreateReviewers" + cycle.code)}
                />
                }
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/assignReviewers"}
                         component={Link}
                         key={"AssignReviewers"}
                         label={"Assign Reviewers"}
                         leftSection={<IconUserPin/>}
                         active={"AssignReviewers" + cycle.code === active}
                         onClick={()=>setActive("AssignReviewers" + cycle.code)}
                />}
                {HaveRole(["reviewer"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/reviews"}
                         component={Link}
                         key={"Reviews"}
                         label={"Reviews"}
                         leftSection={<IconEdit/>}
                         active={"Reviews" + cycle.code === active}
                         onClick={()=>setActive("Reviews" + cycle.code)}
                />
                }
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/acceptProposals"}
                         component={Link}
                         key={"AcceptProposals"}
                         label={"Accept Proposals"}
                         leftSection={<IconThumbUp/>}
                         active={"AcceptProposals" + cycle.code === active}
                         onClick={()=>setActive("AcceptProposals" + cycle.code)}
                />}
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/allocations"}
                         component={Link}
                         key={"Allocations"}
                         label={"Allocations"}
                         leftSection={<IconSquareChevronsRight/>}
                         active={"Allocations" + cycle.code === active}
                         onClick={()=>setActive("Allocations" + cycle.code)}
                />}
            </Accordion.Panel>
        </Accordion.Item>
    )
}