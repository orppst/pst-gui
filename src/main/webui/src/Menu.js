import React from "react";
import { useHistory } from "react-router-dom";


class Menu extends React.Component {
    constructor(props) {
        super(props);
        if(this.props.loggedOn == false) {
            console.log("Menu thinks not logged in, redirect to login");


        } else {
            console.log("Menu thinks we're logged in!");
        }
    }
    render() {
        return (
        <div>Main Menu</div>
        );
    };
}

export default Menu;