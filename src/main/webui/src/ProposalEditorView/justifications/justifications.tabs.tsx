import {ReactElement} from "react";
import {Grid, Space, Stack, Tabs} from "@mantine/core";
import JustificationsHelp from "./justifications.help.tsx";
import JustificationsResourceFiles from "./justifcations.resourceFiles.tsx";
import {Justification} from "../../generated/proposalToolSchemas.ts";
import JustificationsLatexCompile from "./justifications.latexCompile.tsx";
import {useViewportSize} from "@mantine/hooks";
import JustificationsText from "./justifications.text.tsx";
import JustificationsPDFDownload from "./justifications.pdfDownload.tsx";

/*
Dev Note: The code for scientific and technical justifications is very similar (by which we mean the
same except for a name change), which breaks the guidelines for DRY. However, it is more convenient
for the API implementation to keep them separate, hence the separation here. It is unlikely that there
will be more than two justification "types", so this is not a problem.
 */

export default
function JustificationsTabs(
    {scientific, technical} : {scientific: Justification, technical: Justification})
    : ReactElement {

    const {height} = useViewportSize();

    return (
        <Grid columns={12}>
            <Grid.Col span={{base: 12, xl: 8}}>
                <Tabs defaultValue={'scientific'} variant={"outline"}>
                    <Tabs.List>
                        <Tabs.Tab value={'scientific'}>
                            Scientific Justification
                        </Tabs.Tab>

                        <Tabs.Tab value={'technical'}>
                            Technical Justification
                        </Tabs.Tab>

                        <Tabs.Tab value={'userHelp'} ml={"auto"}>
                            Help
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value={'scientific'} mt={"sm"}>
                        <JustificationsText
                            justification={scientific}
                            which={"scientific"}
                            vpHeight={height}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value={'technical'} mt={"sm"}>
                        <JustificationsText
                            justification={technical}
                            which={"technical"}
                            vpHeight={height}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value={'userHelp'} mt={"sm"}>
                        <JustificationsHelp vpHeight={height}/>
                    </Tabs.Panel>
                </Tabs>
            </Grid.Col>
            <Grid.Col span={{base: 12, xl: 4}}>
                <Space h={"lg"}/>
                <Stack>
                    <JustificationsResourceFiles vpHeight={height}/>
                    <JustificationsLatexCompile/>
                    <JustificationsPDFDownload />
                </Stack>
            </Grid.Col>
        </Grid>
    )
}