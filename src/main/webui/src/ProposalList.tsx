import {ReactElement, useState} from "react";
import {Accordion, Group, NavLink} from "@mantine/core";
import {
    IconChartLine,
    IconFileCheck, IconFiles, IconGeometry,
    IconLetterS,
    IconLetterT,
    IconLicense, IconSend,
    IconTarget, IconTelescope,
    IconUfo,
    IconUsersGroup
} from "@tabler/icons-react";
import {Link} from "react-router-dom";
import {useProposalResourceGetProposals} from "./generated/proposalToolComponents.ts";
import {ProposalSynopsis} from "./generated/proposalToolSchemas.ts";


export function ProposalList(props:{proposalTitle: string, investigatorName:string}): ReactElement { //IMPL added user as a prop even though not explicitly used to make update happen.

    const [accordionValue, setAccordionValue]
        = useState<string | null>(null);
    const result = useProposalResourceGetProposals(
        { queryParams: {
                title: "%" + props.proposalTitle + "%",
                investigatorName: "%" + props.investigatorName + "%"
            },
        },
        {
            enabled: true,
        });

    const proposalsList = result.data?.map((proposal) => {
        return  <ProposalItem key={proposal.code} proposal={proposal}/>
    })
    return (
        <Accordion
            value={accordionValue}
            onChange={setAccordionValue}
            variant={"filled"}
        >
            {proposalsList}
        </Accordion>
    )
}


    function ProposalItem(props:{proposal:ProposalSynopsis}): ReactElement {
        const proposal = props.proposal
        const [active, setActive] = useState("");

        return (<Accordion.Item value={String(proposal.code)} key={proposal.code}>
            <Accordion.Control>
                <Group>
                    <IconLicense/>
                    {proposal.title}
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <NavLink to={"proposal/" + proposal.code}
                         component={Link}
                         key="Overview"
                         label="Overview"
                         leftSection={<IconUfo/>}
                         active={"Overview" + proposal.code === active}
                         onClick={()=>setActive("Overview" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/title"}
                         component={Link}
                         leftSection={<IconLetterT/>}
                         label="Title"
                         key="Title"
                         active={"Title" + proposal.code === active}
                         onClick={()=>setActive("Title" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/summary"}
                         component={Link}
                         leftSection={<IconLetterS/>}
                         label="Summary"
                         key="Summary"
                         active={"Summary" + proposal.code === active}
                         onClick={()=>setActive("Summary" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/investigators"}
                         component={Link}
                         leftSection={<IconUsersGroup/>}
                         label="Investigators"
                         key="Investigators"
                         active={"Investigators" + proposal.code === active}
                         onClick={()=>setActive("Investigators" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/justifications"}
                         component={Link}
                         leftSection={<IconFileCheck/>}
                         label="Justifications"
                         key="Justifications"
                         active={"Justifications" + proposal.code === active}
                         onClick={()=>setActive("Justifications" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/targets"}
                         component={Link}
                         leftSection={<IconTarget/>}
                         label="Targets"
                         key="Targets"
                         active={"Targets" + proposal.code === active}
                         onClick={()=>setActive("Targets" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/goals"}
                         component={Link}
                         leftSection={<IconChartLine/>}
                         label="Technical Goals"
                         key="Technical Goals"
                         active={"Technical Goals" + proposal.code === active}
                         onClick={()=>setActive("Technical Goals" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/observationFields"}
                         component={Link}
                         leftSection={<IconGeometry/>}
                         label="Observation Fields"
                         key="Observation Fields"
                         active={"Observation Fields" + proposal.code === active}
                         onClick={()=>setActive("Observation Fields" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/observations"}
                         component={Link}
                         leftSection={<IconTelescope/>}
                         label="Observations"
                         key="Observations"
                         active={"Observations" + proposal.code === active}
                         onClick={()=>setActive("Observations" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/documents"}
                         component={Link}
                         leftSection={<IconFiles/>}
                         label="Documents"
                         key="Documents"
                         active={"Documents" + proposal.code === active}
                         onClick={()=>setActive("Documents" + proposal.code)}
                />
                <NavLink to={"proposal/" + proposal.code + "/submit"}
                         component={Link}
                         leftSection={<IconSend/>}
                         label="Submit"
                         key="Submit"
                         active={"Submit" + proposal.code === active}
                         onClick={()=>setActive("Submit" + proposal.code)}
                />
            </Accordion.Panel>
        </Accordion.Item>)
    }
