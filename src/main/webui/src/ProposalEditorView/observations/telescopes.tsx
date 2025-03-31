import { ReactElement, useState } from 'react';
import { ComboboxItem, Select, Textarea } from '@mantine/core';
import {
    fetchOpticalTelescopeResourceGetNames,
    fetchOpticalTelescopeResourceGetTelescopeData,
    Field, Type, fetchOpticalTelescopeResourceLoadTelescopeData,
    Telescope, Instrument
} from '../../util/telescopeComms';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group';
import {useParams} from "react-router-dom";
import { DEFAULT_STRING, MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from '../../constants';
import { notifyError } from '../../commonPanel/notifications';

/**
 * generates the observation panel.
 * @param {UseFormReturnType<ObservationFormValues>} form the
 * form containing all the data to display.
 * @return {ReactElement} the react html for the observation panel.
 * @constructor
 */
export function Telescopes({form}: {form: UseFormReturnType<ObservationFormValues>}):
        ReactElement {
    const { selectedProposalCode} = useParams();

    // state holder to force re renders;
    const [selectedTelescope, setSelectedTelescope] = useState<string>(DEFAULT_STRING);
    const [selectedInstrument, setSelectedInstrument] = useState<string>(DEFAULT_STRING);
    const [getNames, setNames] = useState([DEFAULT_STRING]);
    const [getTelescopeData, setTelescopeData] =
        useState<Map<string, Telescope> | null>(null);

    // data holder for the user choices from the back end.
    let userData: Map<string, Map<string, Map<string, string>>> =
        new Map<string, Map<string, Map<string, string>>>();

    /**
     * extract data from back end on the telescope names.
     * only do this once. rest of renders shouldn't call this.
     */
    if (getNames.length == 1) {
        fetchOpticalTelescopeResourceGetNames().then((serverTelescopeNames: string[]) => {
            // populate telescope names for html display.
            setNames(getNames.concat(serverTelescopeNames));
        });
    }

    /**
     * extract data from the back end on the telescope options.
     * only do this once. rest of renders shouldn't call this.
     */
    if (getTelescopeData == null) {
        fetchOpticalTelescopeResourceGetTelescopeData().then(
            (backendTelescopeData: Map<string, Map<string, Map<string, string>>>) => {
                setTelescopeData(new Map(Object.entries(backendTelescopeData)));

                // if no observation id, no loaded data.
                const observationId = form.getValues().observationId;
                if (observationId === undefined) {
                    processUserData(
                        new Map<string, Map<string, Map<string, string>>>(),
                        new Map(Object.entries(backendTelescopeData)))
                } else {
                    // ensure the telescope data is extracted before asking for the user data.
                    fetchOpticalTelescopeResourceLoadTelescopeData(
                        {
                            observationID: observationId.toString(),
                            proposalID: selectedProposalCode!
                        })
                        .then(
                            (userDataRaw: Map<string, Map<string, Map<string, string>>>) => {
                                processUserData(userDataRaw, new Map(Object.entries(backendTelescopeData)));
                            }
                        );
                }
            }
        );
    }

    /**
     * processes user stored data into the form.
     * @param {Map<string, Map<string, Map<string, string>>>} userDataRaw: the loaded data.
     * @param storedTelescopeData: the stored telescope states.
     */
    function processUserData(
            userDataRaw: Map<string, Map<string, Map<string, string>>> | undefined,
            storedTelescopeData: Map<string, Telescope> | undefined): void {

        if (userDataRaw == undefined) {
            return
        }

        userData = new Map(Object.entries(userDataRaw));

        // fill out forms
        if(form.getInputProps("telescopeName").value == DEFAULT_STRING && userData.size != 0) {
            // it cant be none, there has to be at least one entry.
            const telescopeName: string = userData.keys().next().value || 'None';

            // it cant be none, there must be at least one instrument. else the xml is messed.
            const instrumentMap: Map<string, Map<string, string>> = userData.get(telescopeName) || new Map();
            const instrumentValue: string = (new Map(Object.entries(instrumentMap))).keys().next().value || 'None';

            form.setValues({
                "telescopeName": telescopeName,
                "instrument": instrumentValue,
            });
        }

        let telescopeState = DEFAULT_STRING;
        let instrumentState = DEFAULT_STRING;

        // state holder to force re renders
        if (selectedTelescope == DEFAULT_STRING) {
            if (userData.size !== 0 && !form.isDirty("elements")) {
                telescopeState = userData.keys().next().value || 'None';
                const instrumentMap: Map<string, Map<string, string>> = userData.get(telescopeState) || new Map();
                instrumentState = new Map(Object.entries(instrumentMap)).keys().next().value || 'None';

                if (telescopeState == form.getInputProps("telescopeName").value &&
                    instrumentState == form.getInputProps("instrument").value &&
                    storedTelescopeData !== undefined) {

                    const elementsMap: Map<string, string> =
                        new Map(Object.entries(instrumentMap)).get(instrumentState) || new Map();
                    const elements: Map<string, string> = new Map(Object.entries(elementsMap));

                    // extract the data types for these elements. as booleans need conversions.
                    const telescopeInstrument: Telescope | undefined = storedTelescopeData.get(telescopeState);
                    if (telescopeInstrument !== undefined) {
                        const instrumentDataMap: Map<string, Instrument> =
                            new Map(Object.entries(telescopeInstrument.instruments)) || new Map();
                        const instrument: Instrument | undefined = instrumentDataMap.get(instrumentState);
                        if (instrument !== undefined) {
                            const elementDataTypes: Map<string, Field> =
                                new Map<string, Field>(Object.entries(instrument.elements)) || new Map();

                            // set the form based off the data type.
                            for (const elementName of elements.keys()) {
                                const field: Field | undefined = elementDataTypes.get(elementName);
                                if (field !== undefined) {
                                    switch (field.type) {
                                        case Type.TEXT:
                                        case Type.LIST:
                                            form.getInputProps("elements").value.set(
                                                elementName, elements.get(elementName));
                                            break;
                                        case Type.BOOLEAN:
                                            form.getInputProps("elements").value.set(
                                                elementName, elements.get(elementName) == "true");
                                            break;
                                        default:
                                            notifyError("none recognised type", "");
                                            break;
                                    }
                                } else {
                                    notifyError("field is undefined", "how did we get here!");
                                }
                            }
                        } else {
                            notifyError("instrument is undefined", "how did we get here!");
                        }
                    } else {
                        notifyError("telescopeInstrument is undefined", "how did we get here!");
                    }
                } else {
                    userData = new Map<string, Map<string, Map<string, string>>>();
                }
            } else {
                userData = new Map<string, Map<string, Map<string, string>>>();
            }
            setSelectedTelescope(telescopeState);
            setSelectedInstrument(instrumentState);
        }

        // update elements form, but only if a telescope and instrument has been populated.
        setupElementsInForm(telescopeState, instrumentState);
    }

    /**
     * extracts the telescope data for a given instrument.
     * @param {string} telescopeName: the telescope name.
     * @param {string} instrumentName: the instrument name.
     * @return {Map<string, Map<string, string>> | undefined} data.
     */
    function returnElementsFromStore(telescopeName: string, instrumentName: string):
            Map<string, Field> {
        if (telescopeName == null || instrumentName == null ||
                getTelescopeData == null || telescopeName == DEFAULT_STRING) {
            return new Map<string, Field>();
        }

        const telescopeData: Telescope | undefined =
            getTelescopeData.get(telescopeName);

        if(telescopeData !== undefined) {
            // got data.
            const telescopeDataMap: Map<string, Instrument> =
                new Map(Object.entries(telescopeData.instruments));
            const instrumentData: Instrument | undefined =
                telescopeDataMap.get(instrumentName);

            // check for undefined
            if (instrumentData == undefined) {
                return new Map<string, Field>();
            }

            // return elements as map.
            return new Map<string, Field>(Object.entries(instrumentData.elements));
        } else {
            return new Map<string, Field>();
        }
    }

    /**
     * populates the form with elements.
     * @param telescopeName: the name of the telescope.
     * @param instrumentName: the name of the instrument.
     */
    function setupElementsInForm(
            telescopeName: string, instrumentName: string): void {
        //populate the form with new states.
        const elementNames: Map<string, Field> =
            returnElementsFromStore(telescopeName, instrumentName);
        if (elementNames.size == 0) {
            return;
        }

        // extract the saved state for this telescope if it exists.
        let userStoresObservationElements = undefined;
        if (userData.size !== 0) {
            userStoresObservationElements = userData.get(telescopeName);
            if (userStoresObservationElements !== undefined) {
                // convert to proper map.
                userStoresObservationElements =
                    new Map(Object.entries(userStoresObservationElements));
                userStoresObservationElements =
                    userStoresObservationElements.get(instrumentName);
                if (userStoresObservationElements !== undefined) {
                    userStoresObservationElements =
                        new Map(Object.entries(userStoresObservationElements));
                }
            } else {
                userStoresObservationElements = undefined;
            }
        }

        // cycle and add new elements.
        for (const elementName of elementNames.keys()) {
            let storedValue = DEFAULT_STRING;

            // no saved data.
            const field: Field | undefined = elementNames.get(elementName);
            if (field == undefined) {
                notifyError("element selection fail", "element failure");
                return;
            }

            //sensible state
            if (userStoresObservationElements == undefined) {
                switch(field.type) {
                    case Type.LIST:
                        // set to the first value
                        form.getInputProps("elements").value.set(elementName, field.values[0]);
                        break;
                    case Type.TEXT:
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, "");
                        }
                        break;
                    case Type.BOOLEAN:
                        form.getInputProps("elements").value.set(elementName, false);
                        break;
                    default:
                        notifyError("none recognised type", "");
                        break;
                }
            // got saved data.
            } else {
                storedValue = userStoresObservationElements.get(elementName);
                switch(field.type) {
                    case Type.LIST:
                    case Type.TEXT:
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, storedValue);
                        }
                        break
                    case Type.BOOLEAN:
                        if (form.getInputProps("elements").value.get(elementName) == undefined) {
                            form.getInputProps("elements").value.set(elementName, storedValue == "true");
                        }
                        break;
                    default:
                        notifyError("none recognised type", "");
                        break;
                }
            }
        }
    }

    /**
     * function to update the UI based off the instrument selection.
     * @param {string | null} value: the instrument change.
     * @param {ComboboxItem} _option: the selected combobox item.
     */
    function useTelescopeInstrumentChange(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            value: string | null, _option: ComboboxItem): void {
        // Handle the case where the selection is cleared
        if (value === null) {
            form.setFieldValue('instrument', DEFAULT_STRING);
            form.getInputProps('elements').value.clear();
            setSelectedInstrument(DEFAULT_STRING);
            form.setDirty({ 'elements': true });
        } else {
            // Handle the case where a valid instrument is selected
            form.setFieldValue('instrument', value);
            form.getInputProps('elements').value.clear();

            // reset elements in form.
            setupElementsInForm(selectedTelescope, value);

            // sets the state variables to force a re-render.
            setSelectedInstrument(value);
            form.setDirty({ 'elements': true });
        }
    }

    /**
     *  function to update the UI based off the telescope name selection.
     * @param {string} value: the new value of the telescope.
     * @param {ComboboxItem} _option: the selected combobox item.
     */
    function useTelescopeNameChange(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            value: string | null, _option: ComboboxItem): void {
        // Handle the case where the selection is cleared
        if (value === null) {
            value = DEFAULT_STRING;
        }

        form.getInputProps('elements').value.clear();
        form.setDirty({elements: true});

        // needs the action due to TS2345
        form.setFieldValue('telescopeName', value);
        form.setFieldValue('instrument', DEFAULT_STRING);

        // set the states to force re-renders
        setSelectedInstrument(DEFAULT_STRING)
        setSelectedTelescope(value);
    }

    /**
     * saves a text area change into the form.
     *
     * @param key: element key
     * @param value: element value.
     */
    function handleTextAreaChange(key: string, value: string): void {
        form.getInputProps('elements').value.set(key, value);
        form.setDirty({'elements': true});
    }

    /**
     * saves a boolean change into the form.
     *
     * @param key: element key
     * @param value: element value.
     */
    function handleBooleanChange(key: string, value: boolean): void {
        form.getInputProps('elements').value.set(key, value);
        form.setDirty({'elements': true});
    }

    /**
     * saves the state change from the select in the list.
     *
     * @param {string} key: the element name.
     * @param {string | null} value: the new value.
     */
    function handleSelectChange(key: string, value: string| null): void {
        // Handle the case where the selection is cleared
        if (value === null) {
            form.getInputProps('elements').value.set(key, DEFAULT_STRING);
        } else {
            // Handle the case where a valid string value is selected
            form.getInputProps('elements').value.set(key, value);
        }
        form.setDirty({ 'elements': true });
    }

    /**
     * Builds the section for the telescope bespoke fields.
     *
     * @return {React.ReactElement} the html for the bespoke section.
     */
    function telescopeFields(): ReactElement {
        if (getTelescopeData == null || selectedTelescope == DEFAULT_STRING) {
            return <></>
        }
        else {
            const telescopeData: Telescope | undefined = getTelescopeData.get(selectedTelescope);

            // if the data is undefined, something truly gone wrong.
            if (telescopeData == undefined) {
                notifyError("telescope request incorrect", "hw did we get here?")
                return <></>
            }

            // sensible telescope.
            const telescopeDataMap = new Map(Object.entries(telescopeData.instruments));

            // build names of instruments with a none to resolve issue with selecting new telescopes.
            let names = [DEFAULT_STRING];
            names = names.concat(Array.from(telescopeDataMap.keys()))
            return <Select
                label={"Telescope Instrument:"}
                placeholder={"Select the telescope instrument"}
                data = {names}
                {...form.getInputProps('instrument')}
                onChange = {useTelescopeInstrumentChange}
            />
        }
    }

    /**
     * Builds the section for the telescope instrument bespoke fields.
     *
     * @return {React.ReactElement} the html for the bespoke section.
     */
    function instrumentFields(): ReactElement {
        // get the elements and their options.
        const elementNamesMap: Map<string, Field> =
            returnElementsFromStore(selectedTelescope, selectedInstrument);
        if (elementNamesMap.size == 0) {
            return <></>
        }

        // generate the html.
        return <>
            {  Array.from(elementNamesMap.keys()).map((key) => {
                const element: Field = elementNamesMap.get(key) as Field;
                switch (element.type) {
                    case Type.LIST:
                        return <Select
                            label={key}
                            key={selectedTelescope + selectedInstrument + key}
                            readOnly={element.values.length == 1}
                            disabled={element.values.length == 1}
                            data = {Array.from(element.values)}
                            defaultValue={form.getInputProps("elements").value.get(key)}
                            onChange={(e) => {
                                handleSelectChange(key, e);
                            }}
                        />
                    case Type.TEXT:
                        return <Textarea label={key}
                                         rows={TEXTAREA_MAX_ROWS}
                                         maxLength={MAX_CHARS_FOR_INPUTS}
                                         key={selectedTelescope + selectedInstrument + key}
                                         defaultValue={form.getInputProps("elements").value.get(key)}
                                         onChange={(e) => {
                                             handleTextAreaChange(key, e.target.value);
                                         }}
                        />
                    case Type.BOOLEAN:
                        return <label key={"label for" + key}>
                                <input checked={form.getInputProps("elements").value.get(key)}
                                       type="checkbox"
                                       key={selectedTelescope + selectedInstrument + key}
                                       defaultValue={form.getInputProps("elements").value.get(key)}
                                       onChange={(e) => {
                                           handleBooleanChange(key, e.target.checked);
                                       }}
                                />
                                {key}
                            </label>
                    default:
                        notifyError("none recognised type %s", element.type);
                        return <></>
                }
            })}
            </>
    }

    // return the generated HTML.
    return (
        <>
            <Select
                label={"Telescope Name: "}
                placeholder={"Select the optical telescope"}
                data = {getNames}
                {...form.getInputProps('telescopeName')}
                onChange = {useTelescopeNameChange}
            />
            {telescopeFields()}
            {instrumentFields()}
        </>
    );
}