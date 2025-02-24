import { ReactElement } from 'react';
import { Box } from '@mantine/core/lib';
import {
    useOpticalTelescopeResourceGetNames, useOpticalTelescopeResourceGetTelescopeData
} from '../../util/telescopeComms';
import { JSON_SPACES } from '../../constants';
import { PanelHeader } from '../../commonPanel/appearance';

/**
 * generates the observation panel.
 * @return {ReactElement} the react html for the observation panel.
 * @constructor
 */
export function Telescopes(): ReactElement {
    // extract data from back end on the telescope names
    const {data: ReceivedTelescopeNames, error: TelescopeNameError,
           isLoading: telescopeNameIsLoading} =
        useOpticalTelescopeResourceGetNames();

    // extract data from the back end on the telescope options.
    const { data: ReceivedTelescopes, error: TelescopeDataError,
            isLoading: telescopeDataIsLoading} =
        useOpticalTelescopeResourceGetTelescopeData();

    // cover any errors.
    if (TelescopeNameError) {
        return (
            <Box>
                <pre>{JSON.stringify(TelescopeNameError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }
    if (TelescopeDataError) {
        return (
            <Box>
                <pre>{JSON.stringify(TelescopeDataError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    // add the telescope names to the list.
    const telescopeNames = ["None"]
    telescopeNames.concat(ReceivedTelescopeNames.names);


    return (
        <>
            <PanelHeader
                itemName={"optical telescopes."}
                panelHeading={"Optical Telescopes"}
                isLoading={telescopeNameIsLoading || telescopeDataIsLoading}
            />


        </>
    );
}