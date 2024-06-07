import {ReactElement, useState} from "react";
import {Accordion, Group, NavLink} from "@mantine/core";
import {
    IconBike,
    IconCalendar, IconEgg, IconLetterA,
    IconLetterO, IconLetterR,
    IconLetterT, IconLicense,
    IconTeapot,
    IconUfo,
    IconUsersGroup
} from "@tabler/icons-react";
import {useProposalCyclesResourceGetProposalCycles} from "src/generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "src/generated/proposalToolSchemas.ts";
import {Link} from "react-router-dom";

export default function CycleList() : ReactElement {

    //FIXME: use an actual query

    const cycles = useProposalCyclesResourceGetProposalCycles(
        {queryParams: {includeClosed: true}}
    )

    const [accordionValue, setAccordionValue]
        = useState<string | null>(null);


    const cyclesList = cycles.data?.map((cycle) => {
        return <CycleItem key={cycle.dbid} cycle={cycle} />
    })

    return (
        <Accordion value={accordionValue}
                   onChange={setAccordionValue}
                   variant={"filled"}
        >
            {cyclesList}
        </Accordion>
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
                <NavLink to={"cycle/" + cycle.dbid + "/title"}
                         component={Link}
                         key={"Title"}
                         label={"Title"}
                         leftSection={<IconLetterT/>}
                         active={"Title" + cycle.code === active}
                         onClick={()=>setActive("Title" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/dates"}
                         component={Link}
                         key={"Dates"}
                         label={"Dates"}
                         leftSection={<IconCalendar/>}
                         active={"Dates" + cycle.code === active}
                         onClick={()=>setActive("Dates" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/assignReviewers"}
                         component={Link}
                         key={"AssignReviewers"}
                         label={"Assign Reviewers"}
                         leftSection={<IconLicense/>}
                         active={"AssignReviewers" + cycle.code === active}
                         onClick={()=>setActive("AssignReviewers" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/observatory"}
                         component={Link}
                         key={"Observatory"}
                         label={"Observatory"}
                         leftSection={<IconTeapot/>}
                         active={"Observatory" + cycle.code === active}
                         onClick={()=>setActive("Observatory" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/tac"}
                         component={Link}
                         key={"TAC"}
                         label={"TAC"}
                         leftSection={<IconUsersGroup/>}
                         active={"TAC" + cycle.code === active}
                         onClick={()=>setActive("TAC" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/availableResources"}
                         component={Link}
                         key={"AvailableResources"}
                         label={"Available Resources"}
                         leftSection={<IconEgg/>}
                         active={"AvailableResources" + cycle.code === active}
                         onClick={()=>setActive("AvailableResources" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/observingModes"}
                         component={Link}
                         key={"ObservingModes"}
                         label={"Observing Modes"}
                         leftSection={<IconLetterO/>}
                         active={"ObservingModes" + cycle.code === active}
                         onClick={()=>setActive("ObservingModes" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/reviews"}
                         component={Link}
                         key={"Reviews"}
                         label={"Reviews"}
                         leftSection={<IconLetterR/>}
                         active={"Reviews" + cycle.code === active}
                         onClick={()=>setActive("Reviews" + cycle.code)}
                />
                <NavLink to={"cycle/" + cycle.dbid + "/allocations"}
                         component={Link}
                         key={"Allocations"}
                         label={"Allocations"}
                         leftSection={<IconLetterA/>}
                         active={"Allocations" + cycle.code === active}
                         onClick={()=>setActive("Allocations" + cycle.code)}
                />
            </Accordion.Panel>
        </Accordion.Item>
    )
}