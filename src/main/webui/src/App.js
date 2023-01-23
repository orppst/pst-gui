import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import React, {useState} from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useRouteMatch, useParams, useNavigate} from "react-router-dom";
import { Redirect } from 'react-router-dom';
//import Auth from "./Auth";
import Menu from "./Menu";
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

function Login() {
  return <h2><Auth /></h2>;
}

function Add() {
  return <h2><AddProposal /></h2>;
}



function Auth() {
    const [username, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async e => {

        e.preventDefault();

        console.log("Login user: " + username + " password " + password);
        loggedIn = true;

        return (<Redirect to="/help" />);

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
  let match = useRouteMatch();

  return (
    <div>
      <h3>Help</h3>

      <ul>
        <li>
          <Link to={`${match.url}/proposals`}>Proposals</Link>
        </li>
        <li>
          <Link to={`${match.url}/authentication`}>
            Authentication
          </Link>
        </li>
      </ul>

      {/* The Topics page has its own <Switch> with more routes
          that build on the /topics URL path. You can think of the
          2nd <Route> here as an "index" page for all topics, or
          the page that is shown when no topic is selected */}
      <Switch>
        <Route path={`${match.path}/:topicId`}>
          <Help />
        </Route>
        <Route path={match.path}>
          <h3>Please select a help topic.</h3>
        </Route>
      </Switch>
    </div>
  );
}

function Topic() {
  let { topicId } = useParams();
  return <h3>Requested topic ID: {topicId}</h3>;
}
