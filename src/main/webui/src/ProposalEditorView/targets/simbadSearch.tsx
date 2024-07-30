import {ReactElement, SetStateAction, useState} from "react";
import {useDebounceCallback, useDisclosure} from "@mantine/hooks";
import AddButton from "../../commonButtons/add.tsx";
import {Combobox, Container, Group, InputBase, Modal, Radio, Stack, useCombobox} from "@mantine/core";
import simbadErrorMessage from "../../errorHandling/simbadErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

function SimbadSearch() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [value, setValue] = useState<string | null>(null);
    const [search, setSearch] = useState('');


    const getSimbadIdentsDebounce = useDebounceCallback(() => {
        getSimbadIdents(search, 10);
    }, 1000);

    const [queryChoice, setQueryChoice] = useState('nameQuery');

    type SimbadData = {
        id: string,
        oidref: number
    }

    const [simbadResult, setSimbadResult] =
        useState<SimbadData[]>([]);

    function getSimbadIdents(targetName: string, limit: number) {

        const baseUrl = "https://simbad.cds.unistra.fr/simbad/";
        const queryType = "sim-tap/sync?request=doQuery&lang=adql&format=json&query=";

        const simbadAltName = (ident: string) : string => {
            //Prefix string with 'NAME ' and capitalise first character of input
            return 'NAME ' + ident.charAt(0).toUpperCase() + ident.slice(1);
        }

        let simbadName = queryChoice == 'nameQuery' ? simbadAltName(targetName) : targetName;

        const adqlQuery =
            encodeURIComponent(
                queryChoice == 'nameQuery' ?
                    `select top ${limit} min(id),oidref from ident where id like '${simbadName}%' group by oidref` :
                    `select top ${limit} distinct id,oidref from ident where id = '${simbadName}'`
            )

        const theUrl = baseUrl + queryType + adqlQuery;

        fetch(theUrl)
            .then(res => {
                //Simbad returns errors as VOTable xml IN THE RESPONSE
                res.text()
                    .then(
                        result => {
                            //we're expecting JSON so XML starting character indicates an error
                            if (result.charAt(0) == '<')
                                throw new Error(simbadErrorMessage(result))

                            const jsonResult = JSON.parse(result)

                            if (jsonResult.data.length > 0) {
                                setSimbadResult(jsonResult.data.map((arr: any) =>
                                    ({id: arr[0], oidref: arr[1] })));
                            } else {
                                notifyError("Target not found",
                                    "target name did not match any records");
                            }
                        }
                    )
            })
            .catch(err => notifyError("Failed to execute SIMBAD query",
                getErrorMessage(err)));
    }


    const options = simbadResult.map((item) => (
        <Combobox.Option value={String(item.oidref)} key={item.id}>
            {item.id}
        </Combobox.Option>
    ));

    return (
        <Stack>
            <Radio.Group
                value={queryChoice}
                onChange={setQueryChoice}
                name={"queryChoice"}
                label={'Choose the query type'}
            >
                <Group p={"sm"}>
                    <Radio value={'nameQuery'} label={'Alternate Name'} />
                    <Radio value={'catQuery'} label={'Catalogue Ref.'} />
                </Group>
            </Radio.Group>
            <Combobox
                store={combobox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                    setValue(val);
                    setSearch(
                         simbadResult.find(({oidref}) => String(oidref) === val)!.id
                    );
                    combobox.closeDropdown();
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={<Combobox.Chevron/>}
                        value={search}
                        onChange={(event: { currentTarget: { value: SetStateAction<string>; }; }) => {
                            combobox.openDropdown();
                            combobox.updateSelectedOptionIndex();
                            setSearch(event.currentTarget.value);
                            getSimbadIdentsDebounce();
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown();
                            setSearch(
                                simbadResult.find(({oidref}) => String(oidref) === value)!.id
                                || '');
                        }}
                        placeholder="Search value"
                        rightSectionPointerEvents="none"
                    />
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {
                            options.length > 0 ? options :
                            <Combobox.Empty>Nothing found</Combobox.Empty>
                        }
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Stack>
    );
}

/**
 * Entry function for the simbad search modal (temporary)
 */
export default function SimbadSearchModal() : ReactElement {
    const [opened, {close, open}] = useDisclosure();

    return(
        <>
            <AddButton
                label={"SIMBAD search"}
                onClick={open}
                toolTipLabel={"Search the SIMBAD database"}
            />
            <Modal
                title={"SIMBAD Search"}
                opened={opened}
                onClose={() => close()}
                size={"50%"}
            >
                <Container mb={300}>
                    <SimbadSearch/>
                </Container>
            </Modal>
        </>
    )
}