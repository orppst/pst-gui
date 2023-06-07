import { useContext } from "react";
import { UserContext } from '../App2'

function TestPanel() {
    const user = useContext(UserContext);

    return (
        <>
            <div>
            {`You are ${user}`}
            </div>
        </>
    );

}

export default TestPanel