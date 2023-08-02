import { useContext } from "react";
import {ProposalContext} from '../App2'
import {
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";
import {
    CelestialTarget, CoordSys,
    Epoch,
    EquatorialPoint,
    SpaceFrame,
} from "../generated/proposalToolSchemas.ts";

function TargetPanel() {
    const { selectedProposalCode} = useContext(ProposalContext);
    const {  data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
            <div>
                <h3>Add and edit targets</h3>
                <div>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                                return (<RenderTarget prop={selectedProposalCode} row={item} key={item.dbid}/>)
                            } )
                    }
                </div>
            </div>
        );
    }

    function RenderTarget(proposal :any) {
        type PropsEquatorialPoint = {point: EquatorialPoint}
        type PropsCelestialTarget = {obj: CelestialTarget}
        type PropsSpaceSys = {coords: CoordSys}
        type PropsSpaceFrame = {frame: SpaceFrame}

        const {data, error, isLoading} = useProposalResourceGetTarget(
            {pathParams:
                    {
                        proposalCode: proposal.prop,
                        targetId: proposal.row.dbid,
                    },
            });

        if(error) {
            return <div>Error loading target</div>
        }

        function EquatorialPoint(props: PropsEquatorialPoint) {
            const Point: EquatorialPoint = props.point;

            //console.log(JSON.stringify(Point, null, 2));

            return (
                <table className={"table"}>
                    <tbody>
                        <tr><th colSpan={2}>Coordinates</th></tr>
                            {
                            Point.coordSys?.["@type"] === "coords:SpaceSys"? <SpaceSys coords={Point?.coordSys}/> : (<tr><td>`Unknown...`</td></tr>)
                            }
                            {
                            Point?.coordSys?.frame?.["@type"] === "coords:SpaceFrame"?<SpaceFrame frame={Point?.coordSys?.frame}/>: (<tr><td>Unknown frame</td></tr>)
                            }
                        <tr>
                            <td>Latitude</td>
                            <td>{Point.lat?.value} {Point.lat?.unit?.value}</td>
                        </tr>
                        <tr>
                            <td>Longitude</td>
                            <td>{Point.lon?.value} {Point.lon?.unit?.value}</td>
                        </tr>
                    </tbody>
                </table>
            )
        }

        function SpaceSys(props: PropsSpaceSys) {
            const Coords = props.coords;
            //console.log(JSON.stringify(Coords));
            return (<tr><td>Space System</td>
                <td>
                {Coords?.coordSpace?.["@type"] === "coords:CartesianCoordSpace"?<CartesianCoordSpace/>: (`Unknown coord space`)}
                </td>
            </tr>);
        }

        function CartesianCoordSpace() {
            return (<>Cartesian Coords Space</>);
        }

        function SpaceFrame(props: PropsSpaceFrame) {
            const frame = props.frame;
            return (<tr><td>Space Frame Ref</td><td>{frame?.spaceRefFrame}</td></tr>);

        }

        function Epoch(props: any) {
            const PositionEpoch: Epoch = props.epoch;

            return (
                <table className={"table"}>
                    <tbody>
                    <tr><th>Epoch</th></tr>
                    <tr><td>{PositionEpoch.value}</td></tr>
                    </tbody>
                </table>);
        }
        function CelestialTarget(props: PropsCelestialTarget) {
            const target = props.obj;
            //console.log(JSON.stringify(target, null, 2));

            return (
                <table className={"table"}>
                    <tbody>
                    <tr><th>Celestial Target</th></tr>
                    <tr><td>{target.sourceName}</td></tr>
                    </tbody>
                </table>
            )
        }

        return (
            <div>
                {isLoading?
                    (`Loading...`)
                    : (
                        <table className={"table well"}>
                            <tbody>
                            <tr>
                                <td>
                                    {data?.["@type"] === "proposal:CelestialTarget" ?
                                        (<CelestialTarget obj={data}></CelestialTarget>)
                                    : (JSON.stringify(data, null, 2))
                                }
                                </td>
                                <td>
                                    {
                                    /*
                                        VOSDL abstract base class "Target" does not have EquatorialPoint's properties
                                     */
                                    // @ts-ignore
                                    data?.["sourceCoordinates"]?.["@type"] === "coords:EquatorialPoint" ?
                                        // @ts-ignore
                                        (<EquatorialPoint point={data?.["sourceCoordinates"]} ></EquatorialPoint>)
                                        // @ts-ignore
                                        : (JSON.stringify(data?.["sourceCoordinates"], null, 2))
                                    }
                                </td>
                                <td>

                                    <Epoch epoch={// @ts-ignore
                                        data?.positionEpoch}/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    )
                }
            </div>);

}

export default TargetPanel