import {ReactElement, useState} from "react";
import {Accordion, Checkbox, Container, Group, NavLink, useMantineColorScheme, useMantineTheme} from "@mantine/core";
import {
    IconBike,
    IconCalendar, IconEdit,
    IconLetterT, IconSquareChevronsRight, IconThumbUp,
    IconUfo, IconUserPin,
    IconUsersGroup
} from "@tabler/icons-react";
import {
    useProposalCyclesResourceGetMyTACMemberProposalCycles,
    useProposalCyclesResourceGetProposalCycles
} from "src/generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "src/generated/proposalToolSchemas.ts";
import {Link} from "react-router-dom";
import {HaveRole} from "../auth/Roles.tsx";

export default function CycleList(props:{observatory: number}) : ReactElement {
    const {colorScheme} = useMantineColorScheme();
    const theme = useMantineTheme();
    const [includeClosed, setIncludeClosed] = useState<boolean>(false);

    if(!HaveRole(["tac_admin", "tac_member", "obs_administration"])) {
        return <>Not authorised</>
    }

    //FIXME: use an actual query

    const cycles = useProposalCyclesResourceGetMyTACMemberProposalCycles(
        {queryParams: {includeClosed: includeClosed}}
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
                label={"Proposal Cycle Status"}
            >
                <Group mt={"md"}>
                    <Checkbox
                        value={"closed"}
                        label={"Include closed"}
                        onChange={(event) => setIncludeClosed(event.currentTarget.checked)}
                    />
                </Group>
            </Checkbox.Group>
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
                <NavLink to={"cycle/" + cycle.dbid + "/title"}
                         component={Link}
                         key={"Title"}
                         label={"Title"}
                         leftSection={<IconLetterT/>}
                         active={"Title" + cycle.code === active}
                         onClick={()=>setActive("Title" + cycle.code)}
                />}
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/dates"}
                         component={Link}
                         key={"Dates"}
                         label={"Dates"}
                         leftSection={<IconCalendar/>}
                         active={"Dates" + cycle.code === active}
                         onClick={()=>setActive("Dates" + cycle.code)}
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
                <NavLink to={"cycle/" + cycle.dbid + "/assignReviewers"}
                         component={Link}
                         key={"AssignReviewers"}
                         label={"Assign Reviewers"}
                         leftSection={<IconUserPin/>}
                         active={"AssignReviewers" + cycle.code === active}
                         onClick={()=>setActive("AssignReviewers" + cycle.code)}
                />}
                <NavLink to={"cycle/" + cycle.dbid + "/reviews"}
                         component={Link}
                         key={"Reviews"}
                         label={"Reviews"}
                         leftSection={<IconEdit/>}
                         active={"Reviews" + cycle.code === active}
                         onClick={()=>setActive("Reviews" + cycle.code)}
                />
                {HaveRole(["tac_admin"]) &&
                <NavLink to={"cycle/" + cycle.dbid + "/passFail"}
                         component={Link}
                         key={"PassFail"}
                         label={"Pass/Fail"}
                         leftSection={<IconThumbUp/>}
                         active={"PassFail" + cycle.code === active}
                         onClick={()=>setActive("PassFail" + cycle.code)}
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