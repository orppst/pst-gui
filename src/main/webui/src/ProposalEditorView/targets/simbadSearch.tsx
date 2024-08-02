import {SetStateAction, useState} from "react";
import {useDebounceCallback} from "@mantine/hooks";
import {Combobox, Group, InputBase, Loader, Radio, ScrollArea, Stack, Text, useCombobox} from "@mantine/core";
import simbadErrorMessage from "../../errorHandling/simbadErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SIMBAD_DEBOUNCE_DELAY, SIMBAD_JSON_OUTPUT, SIMBAD_TOP_LIMIT, SIMBAD_URL_TAP_SERVICE} from "../../constants.tsx";
import {UseFormReturnType} from "@mantine/form";
import {Aladin, newTargetData} from "./New.tsx";


/*
 * Notice that I tried to generalise the fetch calls for SIMBAD using templated data but
 * could not get it to work; the return value was always undefined. Something like:
 *
 * function simbadFetch<T>(theUrl: string, timeout: number) : Promise<T> {
 *     return fetch(theUrl, {signal: AbortSignal.timeout(timeout)})
 *         .then(res => {
 *             res.text()
 *                 .then(
 *                     result => {
 *                         //we're expecting JSON so XML starting character indicates an error
 *                         if (result.charAt(0) == '<')
 *                             throw new Error(simbadErrorMessage(result))
 *
 *                         return JSON.parse(result) as Promise<T>
 *                     }
 *                 )
 *         })
 * }
 *
 */


export
function SimbadSearch(props: {form: UseFormReturnType<newTargetData>}) {
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
        setSimbadIdentResult([]); //clear this array to then clear the combobox 'options'
        setLoading(true); //shows the loader while waiting for results
        setNumberFound(0); //avoids transient messages from the previous search
        setInvalidInput(false); // ensure this is false on a new search
        getSimbadIdents(search, SIMBAD_TOP_LIMIT);
    }, SIMBAD_DEBOUNCE_DELAY);

    const [queryChoice, setQueryChoice] = useState('nameQuery');

    type SimbadIdent = {
        id: string,
        oidref: number
    }

    const [simbadIdentResult, setSimbadIdentResult] =
        useState<SimbadIdent[]>([]);

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
            case 'nameQuery': //fall through wanted
            case 'catQuery':
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

                            if (jsonResult.data.length === 0)
                                setLoading(false);
                            else {
                                setSimbadIdentResult(jsonResult.data.map((arr: any) =>
                                    ({id: arr[0], oidref: arr[1] })));
                            }
                            setNumberFound(jsonResult.data.length);
                        }
                    )
            })
            .catch(
                err => {
                    setLoading(false);
                    notifyError("Failed to execute SIMBAD ident query", getErrorMessage(err))
                }
            );
    }

    /**
     *  Function to perform a search of the SIMBAD database with the given oidref returning the
     *  relevant details of the target. Notice that this is an internal function such that the
     *  input will be a valid 'oidref' number in SIMBAD.
     *
     */
    function getTargetDetails(oidref: number) {

        let theUrl = SIMBAD_URL_TAP_SERVICE + SIMBAD_JSON_OUTPUT;

        let adqlQuery = encodeURIComponent(
            `select main_id,ra,dec,radec2sexa(ra, dec, 16) from basic where oid=${oidref}`
        )

        //searches are expected to take order one second so set a timeout with a reasonable margin
        fetch(theUrl + adqlQuery, {signal: AbortSignal.timeout(5000)})
            .then(res => {
                //Simbad returns errors as VOTable xml IN THE RESPONSE
                res.text()
                    .then(
                        result => {
                            //we're expecting JSON so XML starting character indicates an error
                            if (result.charAt(0) == '<')
                                throw new Error(simbadErrorMessage(result))

                            const jsonResult = JSON.parse(result)

                            // this has to be true - oidref input comes from the SIMBAD database -
                            // but leave for semantics
                            if (jsonResult.data.length === 1) {
                                jsonResult.data.map((arr: any) => {
                                    //set the form fields
                                    props.form.setFieldValue('TargetName', arr[0])
                                    props.form.setFieldValue('RA', arr[1]);
                                    props.form.setFieldValue('Dec', arr[2])
                                    props.form.setFieldValue('sexagesimal', arr[3])

                                    //point Aladin viewer to the target
                                    Aladin.gotoRaDec(arr[1], arr[2])
                                });
                            } else {
                                notifyError("Congratulations",
                                    "It seems you managed to trigger an \"impossible\" error")
                            }
                        }
                    )
            })
            .catch(
                err => {
                    notifyError("Failed to execute SIMBAD details query", getErrorMessage(err))
                }
            );
    }


    const options = simbadIdentResult.map((item) => (
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
                         simbadIdentResult.find(({oidref}) => String(oidref) === val)!.id
                    );
                    getTargetDetails(Number(val))
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
                            if(search.length === 0) setSimbadIdentResult([])
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
