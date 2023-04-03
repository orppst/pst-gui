import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import React, {useState, useEffect} from 'react';
import AddProposal from "./proposal/Add"
import ListProposals from "./proposal/List"
import UserEdit from "./user/Edit"
import { Dropdown, Menu } from 'semantic-ui-react';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function App() {
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [activeItem, setActiveItem] = React.useState("logout");
    const [username, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleItemClick= (e,  {name} ) => {  e.preventDefault(); setActiveItem(name); }
    const handleAuthSubmit = event => {
            event.preventDefault();
            console.log("Login user: " + username + " password " + password);
            setLoggedIn(true);
            setActiveItem('welcome');
        };

    const logoutConfirm = () => {
        const options = {
            title: 'Logout',
            message: 'Are you sure?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {setLoggedIn(false); setActiveItem('login');}
                },
                {
                    label: 'No'
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            keyCodeForClose: [8, 32],
            willUnmount: () => {},
            afterClose: () => {},
            onClickOutside: () => {},
            onKeypress: () => {},
            onKeypressEscape: () => {},
            overlayClassName: "overlay-custom-class-name"
        };

        confirmAlert(options);
    }

    const auth = () => {
        return (
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={handleAuthSubmit}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">New login</h3>
                        <div className="form-group mt-3">
                            <label>Email address</label>
                            <input
                                type="email"
                                className="form-control mt-1"
                                placeholder="Enter new email"
                                name="username"
                                value={username}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter new password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                            Submit
                            </button>
                        </div>
                        <p className="forgot-password text-right mt-2 h4">
                            Forgot <a href="#">password?</a>
                        </p>
                    </div>
                </form>
            </div>
          );
    }

    return (
        <div>
        <Menu>
                {!loggedIn &&
                <Menu.Item name='login'
                    active={activeItem === 'login'}
                    onClick={handleItemClick}/>
                }
                {!loggedIn &&
                <Menu.Item name='signup'
                    active={activeItem === 'signup'}
                    onClick={handleItemClick}/>
                }

                {loggedIn &&
                <Dropdown item text='User'>
                    <Dropdown.Menu>
                        <Dropdown.Item name='userEdit'  onClick={handleItemClick}>
                        My details
                        </Dropdown.Item>
                        <Dropdown.Item name='logout' onClick={logoutConfirm}>
                        Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                }
                {loggedIn &&
                <Dropdown item text='Proposals'>
                    <Dropdown.Menu>
                        <Dropdown.Header>Manage Proposals</Dropdown.Header>
                        <Dropdown.Item name='add' onClick={handleItemClick}>
                        Add
                        </Dropdown.Item>
                        <Dropdown.Item name='search' onClick={handleItemClick}>
                            Search my proposals
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                }
                <Menu.Item name='help'
                    active={activeItem === 'help'}
                    onClick={handleItemClick}/>
        </Menu>

        {activeItem==='login' && auth()}
        {activeItem==='help' && Help()}
        {activeItem==='add' && Add()}
        {activeItem==='welcome' && Welcome()}
        {activeItem==='search' && Search()}
        {activeItem==='signup' && Signup()}
        {activeItem==='userEdit' && UserEdit()}
        </div>
    );
}

function Add() {
    return (<AddProposal />);
}

function Search() {
    return (<ListProposals />);
}


function Welcome() {
    return (<div><React.Fragment><h3>Welcome!</h3> <h4>To add a new proposal, please select from the menu above</h4></React.Fragment></div>);
}

function Auth() {
    const [username, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = event => {
        event.preventDefault();
        console.log("Login user: " + username + " password " + password);
        window.loggedIn = true;
    };

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSubmit}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Please login</h3>
                    <div className="form-group mt-3">
                        <label>Email address</label>
                        <input
                            type="email"
                            className="form-control mt-1"
                            placeholder="Enter email"
                            name="username"
                            value={username}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control mt-1"
                            placeholder="Enter password"
                            name="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit" className="btn btn-primary">
                        Submit
                        </button>
                    </div>
                    <p className="forgot-password text-right mt-2 h4">
                        Forgot <a href="#">password?</a>
                    </p>
                </div>
            </form>
        </div>
      );
}

function Help() {
    return (
        <div>
            <h4>This is where the help will live</h4>
        </div>
    );
}

function Signup() {
    return(<div><h4>In a future release, you'll be able to signup to this propsal service online</h4></div>);
}
