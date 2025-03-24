import {ReactElement, SetStateAction, useState} from "react";
import {useDebouncedCallback} from "@mantine/hooks";
import {
    Badge,
    Combobox,
    Group,
    InputBase,
    Loader,
    ScrollArea,
    Stack,
    Text,
    useCombobox
} from "@mantine/core";
import simbadErrorMessage from "../../errorHandling/simbadErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {
    SIMBAD_DEBOUNCE_DELAY,
    SIMBAD_JSON_OUTPUT,
    SIMBAD_TIMEOUT,
    SIMBAD_TOP_LIMIT, SIMBAD_URL_IDENT,
    SIMBAD_URL_TAP_SERVICE
} from "../../constants.tsx";
import {UseFormReturnType} from "@mantine/form";
import {Aladin, NewTargetFormValues} from "./New.tsx";
import {IconSearch} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import { AstroLib } from "@tsastro/astrolib";

/*
Need to obtain the "object type" from SIMBAD when a user selects a target. Some object types,
e.g. Stellar Stream (St*), may not have a coordinate for legitimate reasons. They may however
have children that do have coordinates.
 */


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
function SimbadSearch(props: {form: UseFormReturnType<NewTargetFormValues>}) {
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

    const getSimbadIdentsDebounce = useDebouncedCallback(() => {
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

    const handleGoToSIMBAD = (name: string) => {
        window.open (SIMBAD_URL_IDENT + encodeURIComponent(name), '_blank');
    }

    /**
     *  Function to perform a search of the SIMBAD database with the given oidref returning the
     *  relevant details of the target. Notice that this is an internal function such that the
     *  input will be a valid 'oidref' number in SIMBAD.
     *
     */
    function getTargetDetails(simbadIdent: SimbadIdent) {

        let theUrl = SIMBAD_URL_TAP_SERVICE + SIMBAD_JSON_OUTPUT;

        let adqlQuery = encodeURIComponent(
            `select main_id,ra,dec,radec2sexa(ra, dec, 16),oid,description 
                            from basic join otypedef on basic.otype=otypedef.otype 
                                where oid=${simbadIdent.oidref}`
        )

        //searches are here expected to take fractions of a second but use the simbad timeout anyway
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
                            if (jsonResult.data.length > 0) {
                                jsonResult.data.map((arr: any) => {
                                    // some SIMBAD entries legitimately contain no basic data but their
                                    // children might, we need to feed this back to the user
                                    if (arr[1] === null || arr[2] === null){
                                        modals.openConfirmModal( {
                                            title: displayName(arr[0]) + " is a " + arr[5],
                                            children: (
                                                <Text size={"sm"}>
                                                    You have selected an object with no legitimate or definitive
                                                    coordinates in Space. However, it may have child objects.
                                                    Would you like to see {displayName(arr[0])} in SIMBAD?
                                                    'Go to SIMBAD' opens the relevant page in a new browser tab.
                                                </Text>
                                            ),
                                            labels: {confirm: 'Go to SIMBAD', cancel: 'Cancel'},
                                            confirmProps: {color: 'blue'},
                                            onConfirm: () =>
                                                handleGoToSIMBAD(arr[0] as string)
                                        })
                                    } else {
                                        //set the form fields
                                        props.form.setFieldValue('targetName', displayName(arr[0]))
                                        //DJW: Astrolib DegToHms prepend sign issue
                                        props.form.setFieldValue('ra', AstroLib.DegToHms(arr[1]).slice(1));
                                        props.form.setFieldValue('dec', AstroLib.DegToDms(arr[2]));
                                        props.form.setFieldValue('sexagesimal', arr[3])

                                        //arr[4] is the oid number - not needed by user

                                        props.form.setFieldValue('objectDescription', arr[5]);

                                        //point Aladin viewer to the target ra,dec
                                        Aladin.gotoRaDec(arr[1], arr[2])

                                        Aladin.adjustFovForObject(arr[0])
                                    }
                                });
                            } else {
                                modals.openConfirmModal({
                                    title: "Congratulations! You've found a rare issue",
                                    children: (
                                        <Text size={"sm"} c={"blue"}>
                                            The target, [name: {simbadIdent.id}, oid: {simbadIdent.oidref}]
                                            returned with no entry in the 'basic' data table of SIMBAD. This
                                            may be an error with our interface, please 'Go to SIMBAD'
                                            to see this target on their site.
                                        </Text>
                                    ),
                                    labels: {confirm: 'Go to SIMBAD', cancel: 'Cancel'},
                                    confirmProps: {color: 'blue'},
                                    onConfirm: () =>
                                        handleGoToSIMBAD(simbadIdent.id)
                                })
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
            <Stack>
                <Combobox
                    store={combobox}
                    withinPortal={true}
                    onOptionSubmit={(val) => {
                        let simbadIdent = simbadDisplayResult
                            .results
                            .find(({oidref}) => String(oidref) === val)!
                        setSearch(displayName(simbadIdent.id));
                        getTargetDetails(simbadIdent)
                        combobox.closeDropdown();
                    }}
                >
                    <Combobox.Target>
                        <InputBase
                            rightSection={<IconSearch />}
                            description={ "Search is case sensitive, but we recommend using capitalised strings for proper nouns e.g., 'Crab'" }
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
                <Group>
                    <Text size={"sm"} c={"gray.6"}>
                        Object Description:
                    </Text>
                    {
                        props.form.values.objectDescription &&
                        <Badge radius={"sm"} bg={"blue"}>
                            {props.form.values.objectDescription}
                        </Badge>
                    }
                </Group>
            </Stack>
        </>
    );
}
