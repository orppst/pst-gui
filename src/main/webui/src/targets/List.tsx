import { useState} from "react";
import {
    fetchProposalResourceRemoveTarget,
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";
import {
    CelestialTarget, CoordSys,
    Epoch,
    EquatorialPoint, ObjectIdentifier,
    SpaceFrame,
} from "../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";
import AddTargetPanel from "./New";
import {useParams} from "react-router-dom";

function TargetPanel() {
    const { selectedProposalCode} = useParams();

    const {  data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});

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
                    <AddTargetPanel/>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                                return (<RenderTarget proposalCode={Number(selectedProposalCode)} row={item} key={item.dbid}/>)
                            } )
                    }
                </div>
            </div>
        );
    }

    type TargetProps = { proposalCode: number, row: ObjectIdentifier };

    function RenderTarget(props: TargetProps) {
        type PropsEquatorialPoint = {point: EquatorialPoint}
        type PropsCelestialTarget = {obj: CelestialTarget}
        type PropsSpaceSys = {coords: CoordSys}
        type PropsSpaceFrame = {frame: SpaceFrame}
        const queryClient = useQueryClient();
        const [submitting, setSubmitting] = useState(false);
        const {data, error, isLoading} = useProposalResourceGetTarget(
            {pathParams:
                    {
                        proposalCode: props.proposalCode,
                        targetId: props.row.dbid!,
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
                        <tr className={"row"}><th colSpan={2}>Coordinates</th></tr>
                            {Point.coordSys?.["@type"] === "coords:SpaceSys"? <SpaceSys coords={Point?.coordSys}/> : (<tr><td>`Unknown...`</td></tr>)}
                            {Point?.coordSys?.frame?.["@type"] === "coords:SpaceFrame"?<SpaceFrame frame={Point?.coordSys?.frame}/>: (<tr><td>Unknown frame</td></tr>)}
                        <tr className={"row"}>
                            <td>Latitude</td>
                            <td>{Point.lat?.value} {Point.lat?.unit?.value}</td>
                        </tr>
                        <tr className={"row"}>
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
            return (<tr className={"row"}><td>Space System</td>
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
            return (<tr className={"row"}><td>Space Frame Ref</td><td>{frame?.spaceRefFrame}</td></tr>);

        }

        function Epoch(props: any) {
            const PositionEpoch: Epoch = props.epoch;

            return (
                <table className={"table"}>
                    <tbody>
                    <tr className={"row"}><th>Epoch</th></tr>
                    <tr className={"row"}><td>{PositionEpoch.value}</td></tr>
                    </tbody>
                </table>);
        }
        function CelestialTarget(props: PropsCelestialTarget) {
            const target = props.obj;
            //console.log(JSON.stringify(target, null, 2));

            return (
                <table className={"table"}>
                    <tbody>
                    <tr className={"row"}><th>Celestial Target</th></tr>
                    <tr className={"row"}><td>{target.sourceName}</td></tr>
                    </tbody>
                </table>
            )
        }

        function handleRemove() {
            const choice = window.confirm(
                "Are you sure you want to remove the target " + data?.sourceName + "?"
            )
            if(choice) {
                setSubmitting(true);
                fetchProposalResourceRemoveTarget({pathParams:
                        {
                            proposalCode: props.proposalCode,
                            targetId: props.row.dbid!
                        }})
                    .then(()=>setSubmitting(false))
                    .then(()=>queryClient.invalidateQueries())
                    .catch(console.log);
            }
        }

        return (
            <div>
                {isLoading?(`Loading...`):
                    submitting?(`Removing...`):
                    (
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
                                        // @ts-ignore
                                        data?.sourceCoordinates?.["@type"] === "coords:EquatorialPoint" ?
                                        // @ts-ignore
                                        (<EquatorialPoint point={data?.["sourceCoordinates"]} ></EquatorialPoint>)
                                        // @ts-ignore
                                        : (JSON.stringify(data?.sourceCoordinates, null, 2))
                                    }
                                </td>
                                <td>

                                    <Epoch epoch={// @ts-ignore
                                        data?.positionEpoch}/>
                                </td>
                            </tr>
                            <tr className={"row"}><td colSpan={3}><button className={"btn btn-danger pull-right"} onClick={handleRemove}>Remove</button></td></tr>
                            </tbody>
                        </table>
                    )
                }
            </div>);

}

export default TargetPanel