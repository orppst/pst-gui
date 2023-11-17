import { ReactElement, MouseEvent, useRef } from 'react';

export default function PointingCanvas(): ReactElement {
    // tracker for the last mouse event.
    let oldMouseEvent: MouseEvent;

    // tracker for the canvas
    const canvasRef = useRef(null);

    /**
     * handles the different mouse event types.
     * @param {React.MouseEvent<HTMLInputElement>} event the event that occurred.
     */
    const handleEvent = (event: MouseEvent<HTMLInputElement>) => {
        switch(event.type) {
            case "mousedown":
                oldMouseEvent = event;
                break;
            case "mouseup":
                oldMouseEvent = event;
                break;
            case "mousemove":
                if (MouseHasMoved(event)) {
                    oldMouseEvent = event;
                }
                break;
            case "click":
                // do nothing, unless we're planning to add pointings /
                // rectangles.
                break;
            default:
                console.log(`not caught type ${event.type}`);
                break;
        }
    }

    /**
     * checks if the mouse has moved.
     *
     * @param {MouseEvent} newEvent the current event.
     * @return {boolean} true if the mouse has moved, false otherwise.
     * @constructor
     */
    function MouseHasMoved(newEvent: MouseEvent): boolean {
        if (oldMouseEvent) {
            return oldMouseEvent.movementX !== newEvent.movementX ||
                oldMouseEvent.movementY !== newEvent.movementY;
        }
        return false;
    }

    // return main html.
    return (
        <div onClick={handleEvent}
             onMouseDown={handleEvent}
             onMouseUp={handleEvent}
             onMouseMove={handleEvent}
             ref={canvasRef}/>
    )
}