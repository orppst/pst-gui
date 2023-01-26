import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useMatch, useParams, useNavigate } from "react-router-dom";
import { Redirect } from 'react-router-dom';
import AddProposal from "./proposal/Add"

export default function App() {
  return (
    <Router>
      <div>
        <h2>Main menu</h2>
        <ul>
          <li>
            <Link to="/">Login</Link>
          </li>
          <li>
            <Link to="/proposal/add">New proposal</Link>
          </li>
          <li>
            <Link to="/help">Help</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/proposal/add">
            <Add />
          </Route>
          <Route path="/help">
            <Help />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Logout() {
  window.loggedIn = false;
  const navigate = useNavigate();
  useEffect(() => {
  navigate('/');
  }, []);
}

function Login() {
  return <h2><Auth /></h2>;
}

function Add() {
  return <h2><AddProposal /></h2>;
}

function Welcome() {
    return <h3>Welcome! To add a new proposal, please select from the menu above</h3>;
}

function Auth() {
    const [username, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = event => {
        event.preventDefault();
        console.log("Login user: " + username + " password " + password);
        window.loggedIn = true;
        navigate('/welcome');
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
      <h3>Help</h3>
        This is where the help will reside
    </div>
  );
}

function Topic() {
  let { topicId } = useParams();
  return <h3>Requested topic ID: {topicId}</h3>;
}
