// data store. first string = proposal id+observation id.
//             second key = telescope name
//             third key = element name and value = choice.
import { LoadTelescopeState, SaveTelescopeState, Type } from './telescopeComms';

// data store for the mock
const dataStore: Map<string, Map<string, Map<string, Map<string, string>>>> =
    new Map<string, Map<string, Map<string, Map<string, string>>>>();

/**
 * bring about a call to get telescope names.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useOpticalTelescopeResourceGetNames = (signal?: AbortSignal) => {
    return ["TCS", "LT", "TNG", "SALT", "CFHT", "NOT", "CAHA35", "AAT",
            "LCO", "REM", "CAHA22", "OHP193", "Aristarchos", "TBL"];
}

/**
 * bring about a call to get telescope data.
 *
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useOpticalTelescopeResourceGetTelescopeData = (signal?: AbortSignal) => {
    return {
        "TCS": {
            "FastCam: optical Lucky Imager": {
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [
                        "http://www.iac.es/OOCC/iac-managed-telescopes/telescopio-carlos-sanchez/fastcam/"
                    ],
                },
                "instrumentCustomFilter": {
                    type: Type.TEXT, values: []
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST, values: [ 'I', 'R', 'V' ]
                }
            },
            "MuSCAT2: simultaneous griz photometry": {
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [
                        "http://www.iac.es/OOCC/iac-managed-telescopes/telescopio-carlos-sanchez/fastcam/"
                    ],
                },
                "instrumentCustomFilter": {
                    type: Type.TEXT, values: []
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST, values: [ 'g', 'r', 'i', "z" ]
                }
            }
        },
        "LT": {
            "IOI": {
                "telescopeScheduling": {
                    type: Type.LIST,
                    values: [ 'Monitor', 'Time Critical', 'Override' ]
                },
                "instrumentCustomFilter": {
                    type: Type.TEXT, values: []
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "telescopeHours": {
                    type: Type.BOOLEAN, values: []
                },
                "telescopeMoon": {
                    type: Type.LIST, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST, values: [ "H" ]
                }
            },
            "MOPTOP": {
                "telescopeScheduling": {
                    type: Type.LIST,
                    values: [ "Monitor", "Time Critical", "Override" ]
                },
                "telescopeHours": {
                    type: Type.BOOLEAN, values: []
                },
                "telescopeMoon": {
                    type: Type.LIST, values: []
                },
                "telescopeMode": {
                    type: Type.LIST, values: []
                },
            },
            "FRODOSpec": {
                "telescopeScheduling": {
                    type: Type.LIST,
                    values: [ "Monitor", "Time Critical", "Override" ]
                },
                "instrumentMode": {
                    type: Type.LIST,
                    values: [ "low res", "hi res" ]
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "telescopeHours": {
                    type: Type.BOOLEAN, values: []
                },
                "telescopeMoon": {
                    type: Type.LIST, values: []
                },
                "telescopeMode": {
                    type: Type.LIST, values: []
                }
            },
            "IOO": {
                "telescopeScheduling": {
                    type: Type.LIST,
                    values: [ "Monitor", "Time Critical", "Override" ]
                },
                "instrumentCustomFilter": {
                    type: Type.TEXT, values: []
                },
                "instrumentComments": {
                    type: Type.TEXT,
                    values: []
                },
                "telescopeHours": {
                    type: Type.BOOLEAN,
                    values: []
                },
                "telescopeMoon": {
                    type: Type.LIST, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST,
                    values: [ "V", "B", "i", "Halpha",
                        "u", "g", "r", "z" ]
                },
                "telescopeMode": {
                    type: Type.LIST,
                    values: []
                },
            },
            "RISE": {
                "telescopeScheduling": {
                    type: Type.LIST,
                    values: [ "Monitor", "Time Critical", "Override" ]
                },
                "telescopeHours": {
                    type: Type.BOOLEAN, values: []
                },
                "telescopeMoon": {
                    type: Type.LIST, values: []
                },
                "telescopeMode": {
                    type: Type.LIST, values: []
                }
            },
            "SPRAT": {
                "telescopeScheduling": {
                    type: Type.LIST,
                    values: [ "Monitor", "Time Critical", "Override" ]
                },
                "telescopeHours": {
                    type: Type.BOOLEAN, values: []
                },
                "telescopeMoon": {
                    type: Type.LIST, values: []
                },
                "telescopeMode": {
                    type: Type.LIST, values: []
                }
            }
        },
        "TNG": {
            'GIANO-B': {
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http://www.tng.iac.es/instruments/giano-b/" ]
                },
                "instrumentComments": {
                    type: Type.TEXT, values: [],
                }
            },
            'DOLORES': {
                "instrumentGrismw": {
                    type: Type.LIST,
                    values: [ "LR-B", "LR-R", "V390", "V486", "V510",
                        "V589", "V656", "V860", "VHRV", "VHRR",
                        "VHRI", "GRIS-U" ]
                },
                "instrumentSlitw": {
                    type: Type.LIST,
                    values: [ "0.7 arcsec", "1.0 arcsec",
                        "1.5 arcsec", "2.0 arcsec", "10.0 arcsec",
                        "1.1 MOS slitlets", "1.6 MOS slitlets" ]
                },
                "instrumentMode": {
                    type: Type.LIST,
                    values: [ "Imaging", "Spectroscopy",
                        "Imaging + Spectroscopy",
                        "Multi-Object Spectroscopy",
                        "Spectroscopy + Multi-Object Spectroscopy" ]
                },
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http://www.tng.iac.es/instruments/lrs/" ]
                },
                "instrumentCustomFilter": {
                    type: Type.TEXT, values: []
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "false": {
                    type: Type.TEXT, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST,
                    values: [ "U", "B", "V", "R", "I", "u' SDSS",
                        "g' SDSS", "r' SDSS", "i' SDSS",
                        "z' SDSS" ]
                }
            }
        },
        "SALT": {
            'Salticam': {
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http//pysalt.salt.ac.za/proposal_calls/current/ProposalCall.html" ]
                },
                "instrumentFilter": {
                    type: Type.LIST,
                    values: [ "Fused Silica Clear", "Johnson U",
                        "Johnson B", "Johnson V", "Cousins R",
                        "Cousins I", "380 nm 40 nm FWHM",
                        "SDSS u'", "SDSS g'", "SDSS r'",
                        "SDSS i'", "SDSS z'", "H alpha",
                        "H beta narrow", "H beta wide",
                        "Stroemgren u", "Stroemgren g",
                        "Stroemgren r", "Stroemgren z",
                        "Stroemgren y", "SRE 1", "SRE 2",
                        "SRE 3", "SRE4" ]
                }
            },
            'RSS': {
                "instrumentGrating": {
                    type: Type.LIST,
                    values: [ "pg0300", "pg0900", "pg1300",
                        "pg1800", "pg2300", "pg3000", "None" ]
                },
                "instrumentMode": {
                    type: Type.LIST,
                    values: [ "Spectroscopy", "Spectropolarimetry",
                        "Multi-Object Spectroscopy",
                        "Imaging", "Imaging Polarimetry" ]
                },
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http://pysalt.salt.ac.za/proposal_calls/current/ProposalCall.html" ]
                }
            },
            'HRS': {
                "instrumentMode": {
                    type: Type.LIST,
                    values: [ "Low Resolution",
                        "Medium Resolution",
                        "High Resolution", "High Stability" ]
                },
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http://pysalt.salt.ac.za/proposal_calls/current/ProposalCall.html" ]
                }
            }
        },
        "CFHT": {},
        "NOT": {},
        "CAHA35": {},
        "AAT": {},
        "LCO": {},
        "REM": {},
        "CAHA22": {},
        "OHP193": {},
        "Aristarchos": {
            'RISE2': {
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http://helmos.astro.noa.gr/rise2.html" ]
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST,
                    values: [ "Broad-band VR" ]
                }
            },
            'LN CCD': {
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "http://helmos.astro.noa.gr/lnccd.html" ]
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                },
                "instrumentFilter": {
                    type: Type.LIST,
                    values: [ "Johnson-Cousins B",
                        "Johnson-Cousins V", "Johnson-Cousins R",
                        "Johnson-Cousins I", "Stromgren u",
                        "Stromgren b", "Stromgren v",
                        "Stromgren y", "Stromgren z",
                        "[O II] 3726+ [OII] 3729",
                        "He II 4686", "Hbeta 4861",
                        "[O III] 5011", "[O III] 5035",
                        "[O III] 5100", "[O III] 5200",
                        "[O I] 6300", "Halpha 6563",
                        "Halpha 6563+[NII] 6583",
                        "[N II] 6583", "[S II] 6717+6731",
                        "Continum Blue", "Continum Red" ]
                }
            }
        },
        "TBL": {
            "Neo-Narval": {
                "instrumentMode": {
                    type: Type.LIST,
                    values: [ "POL3 (polarimetry R:65000)" ]
                },
                "instrumentUrl": {
                    type: Type.LIST,
                    values: [ "https://tbl.omp.eu/observing-with-the-telescope-bernard-lyot-tbl/" ]
                },
                "instrumentComments": {
                    type: Type.TEXT, values: []
                }
            }
        }
    }
}

/**
 * bring about a call to save observation telescope data.
 *
 * @param {SaveTelescopeState} data: the data to save.
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<ReceivedTelescopeNames>}: the resulting data when received.
 */
export const opticalTelescopeResourceSaveTelescopeData = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: SaveTelescopeState, signal?: AbortSignal) => {
    const key = `${data.proposalID}.${data.observationID}`;
    dataStore.set(key, new Map<string, Map<string, Map<string, string>>>());
    dataStore.get(key).set(data.telescopeName, new Map<string, Map<string, string>>);
    dataStore.get(key).get(data.telescopeName)?.set(data.instrumentName, data.choices);
}

/**
 * bring about a call to get observation telescope data.
 *
 * @param {LoadTelescopeState} data: the data to load telescope data from.
 * @param {AbortSignal} signal: the signal for failure.
 * @return {Promise<Map<string, Map<string, Map<string, string>>> | undefined>}: the resulting data when received.
 */
export const useOpticalTelescopeResourceLoadTelescopeData = (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: LoadTelescopeState, signal?: AbortSignal) => {
    const key = `${data.proposalID}.${data.observationID}`
    return dataStore.get(key);
}

