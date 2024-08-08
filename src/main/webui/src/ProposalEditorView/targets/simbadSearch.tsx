import {ReactElement, SetStateAction, useState} from "react";
import {useDebounceCallback} from "@mantine/hooks";
import {Combobox, Group, InputBase, Loader, ScrollArea, Text, useCombobox} from "@mantine/core";
import simbadErrorMessage from "../../errorHandling/simbadErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {
    SIMBAD_DEBOUNCE_DELAY,
    SIMBAD_JSON_OUTPUT,
    SIMBAD_TIMEOUT,
    SIMBAD_TOP_LIMIT,
    SIMBAD_URL_TAP_SERVICE
} from "../../constants.tsx";
import {UseFormReturnType} from "@mantine/form";
import {Aladin, newTargetData} from "./New.tsx";
import {IconSearch} from "@tabler/icons-react";


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
    const [search, setSearch]
        = useState('');

    //boolean to determine search status to display a loader when search in progress
    const [loading, setLoading]
        = useState(false);

    //number of targets found in the search, max is the "top" limit
    const [numberFound, setNumberFound] =
        useState<number>(0);

    // invalid input characters in the search box
    const [invalidInput, setInvalidInput]
        = useState(false);

    const [timedOut, setTimedOut]
        = useState(false)

    const getSimbadIdentsDebounce = useDebounceCallback(() => {
        setSimbadDisplayResult({results: []}); //clear this array to then clear the combobox 'options'
        setLoading(true); //shows the loader while waiting for results
        setNumberFound(0); //avoids transient messages from the previous search
        setInvalidInput(false); //ensure invalidInput is false on a new search
        setTimedOut(false); //ensure timedOut is false on a new search
        getSimbadIdents(search, SIMBAD_TOP_LIMIT);
    }, SIMBAD_DEBOUNCE_DELAY);

    type SimbadIdent = {
        id: string,
        oidref: number
    }

    type SimbadDisplayResults = {
        results: SimbadIdent[]
    }

    const [simbadDisplayResult, setSimbadDisplayResult] =
        useState<SimbadDisplayResults>({results: []})


    const fetchSimbadIdents = (theUrl: string) => {
        fetch(theUrl, {signal: AbortSignal.timeout(SIMBAD_TIMEOUT)})
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
                                const newResults: SimbadIdent[] = jsonResult.data.map((arr: any) =>
                                    ({id: arr[0], oidref: arr[1] }))

                                setSimbadDisplayResult(prevState => ({
                                    results: [...(prevState.results ?? []), ...newResults]
                                }))
                            }
                            setNumberFound(jsonResult.data.length);
                        }
                    )
            })
            .catch( () => {
                setLoading(false);
                setTimedOut(true);
            });
    }


    /**
     * Internal function that does the actual fetch to the SIMBAD URL
     * @param inputName (string) the search term from the input box
     * @param limit (number) only get the first 'limit' elements of the search
     */
    function getSimbadIdents(inputName: string, limit: number) {

        // '-+%_ ' at start of pattern, the rest anywhere within pattern
        let charToAvoid = /^[-+%_ ]|[`!@#$^&()={};':"\\|,.<>\/?~]/
        let wildcards = /[%_]/;

        //only perform a search with input terms at least two characters long
        if (inputName.length < 2) return

        //don't do a search if the 'targetName' string contains suspect characters
        if (charToAvoid.test(inputName)) {
            setLoading(false);
            setInvalidInput(true);
            return;
        }

        const theUrl = SIMBAD_URL_TAP_SERVICE + SIMBAD_JSON_OUTPUT;

        const queryHead = `select top ${limit} id,oidref from ident where `;
        const queryTail = ' order by id';

        //if the user uses wildcards in their search term assume they know what they are doing
        if (wildcards.test(inputName)) {
            let theQuery = queryHead + `id like '${inputName}'`;
            fetchSimbadIdents(theUrl + encodeURIComponent(theQuery));
        } else {
            const queryIdEquals = `id='${inputName}'`;
            const queryLikeName = `id like 'NAME ${inputName}%'`;
            const queryLike = `id like '${inputName}%'`;

            let theQuery = queryHead + queryIdEquals + ' or '
                + queryLikeName + ' or ' + queryLike + queryTail;

            fetchSimbadIdents(theUrl + encodeURIComponent(theQuery));
        }
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
        fetch(theUrl + adqlQuery, {signal: AbortSignal.timeout(SIMBAD_TIMEOUT)})
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
                                    props.form.setFieldValue('TargetName', displayName(arr[0]))
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


    //removes all additional white space in a string, leaving a single whitespace
    // between characters where appropriate
    const removeExtraSpaces = (inputName: string ) : string => {
        let result = '';

        //All names start with at least one character that is not white space
        result += inputName[0];
        result += inputName[1]; //may or may not be white space

        //starting index is 2
        for (let i = 2; i < inputName.length; i++) {
            if (inputName[i - 1] !== ' ' || inputName[i] !== ' ') {
                result += inputName[i]
            }
        }
        return result
    }


    //returns names without the 'NAME ' prefix and a single space between characters where appropriate
    const displayName = (ident: string): string => {
        const prefix = 'NAME ';
        if (ident.indexOf(prefix) === 0) {
            return removeExtraSpaces(ident.substring(prefix.length));
        } else {
            return removeExtraSpaces(ident);
        }
    }

    const searchMessage = () : ReactElement => {
        if (search.length < 2) {
            return (
                <Combobox.Empty>
                    Please type at least two characters to trigger a search
                </Combobox.Empty>
            )
        } else if (loading) {
            return (
                <Combobox.Empty>
                    <Loader size={20}/>
                </Combobox.Empty>
            )
        } else if (timedOut) {
            return (
                <Combobox.Empty>
                    Search timed-out. Please refine your search
                </Combobox.Empty>
            )
        } else {
            return (
                <Combobox.Empty>
                    Nothing found
                </Combobox.Empty>
            )
        }
    }

    const options = simbadDisplayResult.results.map((item) => (
        <Combobox.Option value={String(item.oidref)} key={item.id}>
            {displayName(item.id)}
        </Combobox.Option>
    ));

    return (
        <>
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
                        displayName(simbadDisplayResult.results.find(({oidref}) =>
                            String(oidref) === val)!.id
                        )
                    );
                    getTargetDetails(Number(val))
                    combobox.closeDropdown();
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={<IconSearch />}
                        description={ "Case sensitive (mostly - unless using SIMBAD identities e.g., 'crab', 'andromeda', ...)" }
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
                            if(search.length === 0) setSimbadDisplayResult({results: []})
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
                                options.length > 0 ? options : searchMessage()
                            }
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </>
    );
}
