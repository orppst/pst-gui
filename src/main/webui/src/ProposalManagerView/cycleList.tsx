import {ReactElement} from "react";
import {Accordion, Group} from "@mantine/core";
import {IconBike} from "@tabler/icons-react";

export default function CycleList() : ReactElement {
    return (
        <Accordion>
            <Accordion.Item value={"cycle1"} key={"cycle1"}>
                <Accordion.Control>
                    <Group>
                        <IconBike />
                        Cycle 1
                    </Group>
                </Accordion.Control>
                <Accordion.Panel>
                    Nav links to the bits of Cycle 1
                </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value={"cycle2"} key={"cycle2"}>
                <Accordion.Control>
                    <Group>
                        <IconBike />
                        Cycle 2
                    </Group>
                </Accordion.Control>
                <Accordion.Panel>
                    Nav links to the bits of Cycle 2
                </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value={"etc"} key={"etc"}>
                <Accordion.Control>
                    <Group>
                        <IconBike />
                        and so on
                    </Group>
                </Accordion.Control>
                <Accordion.Panel>
                    ...
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}