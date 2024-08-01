import {SetStateAction, useState} from "react";
import {useDebounceCallback} from "@mantine/hooks";
import {
    Combobox,
    Group,
    InputBase,
    Loader,
    Radio,
    ScrollArea,
    Stack, Text,
    useCombobox
} from "@mantine/core";
import simbadErrorMessage from "../../errorHandling/simbadErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SIMBAD_DEBOUNCE_DELAY, SIMBAD_JSON_OUTPUT, SIMBAD_TOP_LIMIT, SIMBAD_URL_TAP_SERVICE} from "../../constants.tsx";

export
function SimbadSearch() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    //search value is the target name
    const [search, setSearch] = useState('');

    //boolean to determine search status to display a loader when search in progress
    const [loading, setLoading] = useState(false);

    //number of targets found in the search, max is the "top" limit
    const [numberFound, setNumberFound] =
        useState<number>(0);

    const [invalidInput, setInvalidInput] = useState(false);

    const getSimbadIdentsDebounce = useDebounceCallback(() => {
        setSimbadResult([]); //clear this array to then clear the combobox 'options'
        setLoading(true); //shows the loader while waiting for results
        setNumberFound(0); //avoids transient messages from the previous search
        setInvalidInput(false); // ensure this is false on a new search
        getSimbadIdents(search, SIMBAD_TOP_LIMIT);
    }, SIMBAD_DEBOUNCE_DELAY);

    const [queryChoice, setQueryChoice] = useState('nameQuery');

    type SimbadData = {
        id: string,
        oidref: number
    }

    const [simbadResult, setSimbadResult] =
        useState<SimbadData[]>([]);

    /**
     * Internal function that does the actual fetch to the SIMBAD URL
     * @param targetName (string) the search term from the input box
     * @param limit (number) only get the first 'limit' elements of the search
     */
    function getSimbadIdents(targetName: string, limit: number) {

        let charToAvoid = /[`!@#$%^&()_={};':"\\|,.<>\/?~]/

        //don't do a search if the 'targetName' string is empty
        if (targetName.length === 0) return

        //don't do a search if the 'targetName' string contains suspect characters
        if (charToAvoid.test(targetName)) {
            setLoading(false);
            setInvalidInput(true);
            return;
        }

        const simbadAltName = (ident: string) : string => {
            //Prefix string with 'NAME '
            return 'NAME ' + ident;
        }

        let simbadName = queryChoice == 'nameQuery' ? simbadAltName(targetName) : targetName;

        let theUrl = SIMBAD_URL_TAP_SERVICE + SIMBAD_JSON_OUTPUT;

        switch(queryChoice) {
            case 'nameQuery':
                theUrl += encodeURIComponent(
                    `select top ${limit} min(id),oidref from ident where id 
                                              like '${simbadName}%' group by oidref`
                )
                break;
            case 'idQuery':
                theUrl += encodeURIComponent(
                    `select top ${limit} id,oidref from ident where id = '${simbadName}'`
                )
                break;
            case 'catQuery':
                theUrl += encodeURIComponent(
                    `select top ${limit} min(id),oidref from ident where id 
                                              like '${simbadName}%' group by oidref`
                )
                break;
        }

        //searches are expected to take order one second so set a timeout with a reasonable margin
        fetch(theUrl, {signal: AbortSignal.timeout(5000)})
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

                                setNumberFound(jsonResult.data.length);
                            } else {
                                //"nothing found" message displayed in empty combobox under input
                                setLoading(false);
                                setNumberFound(0);
                            }
                        }
                    )
            })
            .catch(
                err => {
                    setLoading(false);
                    notifyError("Failed to execute SIMBAD query", getErrorMessage(err))
                }
            );
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
                    <Radio value={'idQuery'} label={'Identity'} />
                </Group>
            </Radio.Group>
            {
                invalidInput &&
                <Text c={"red"} size={"sm"}>
                    Invalid character entered in search input.
                </Text>
            }
            <Combobox
                store={combobox}
                withinPortal={true}
                onOptionSubmit={(val) => {
                    setSearch(
                         simbadResult.find(({oidref}) => String(oidref) === val)!.id
                    );
                    combobox.closeDropdown();
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={<Combobox.Chevron/>}
                        description={
                            queryChoice === 'nameQuery' ? "Case sensitive e.g., 'Crab' not 'crab'" :
                                queryChoice === 'idQuery' ? "Exact name required e.g., 'm1', 'crab', 'andromeda' - case insensitive" :
                                    "First few characters of the catalogue reference e.g., 'M', 'ACO', 'Gaia' - case sensitive and try multiple spaces"
                        }
                        value={search}
                        onChange={(event: { currentTarget: { value: SetStateAction<string>; }; }) => {
                            combobox.openDropdown();
                            combobox.updateSelectedOptionIndex();
                            setSearch(event.currentTarget.value);
                            setInvalidInput(false);
                            getSimbadIdentsDebounce();
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown();
                            if(search.length === 0) setSimbadResult([])
                        }}
                        placeholder="Search value"
                        rightSectionPointerEvents="none"
                    />
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {
                            search.length > 0 && numberFound > 0 &&
                            <Group justify={"center"}>

                            <Combobox.Header>
                                Found {numberFound}{numberFound === SIMBAD_TOP_LIMIT && '+'} result{numberFound > 1 && 's'}.
                                { numberFound === SIMBAD_TOP_LIMIT &&
                                    " - limit reached, you may want to refine your search."
                                }
                                { numberFound > 6 && " Scroll to view all."}
                            </Combobox.Header>

                            </Group>
                        }

                        <ScrollArea.Autosize mah={200} type={"scroll"}>
                            {
                                options.length > 0 ? options :
                                    search.length === 0 ?
                                        <Combobox.Empty>
                                            Please type at least one character to start a search
                                        </Combobox.Empty> :
                                        loading ?
                                            <Combobox.Empty><Loader size={20}/></Combobox.Empty> :
                                            <Combobox.Empty>Nothing found</Combobox.Empty>

                            }
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Stack>
    );
}
