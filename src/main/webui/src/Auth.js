import React from "react"

export default function (props) {
  return (
    <div className="Auth-form-container">
      <form className="Auth-form">
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control mt-1"
              placeholder="Enter email"
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control mt-1"
              placeholder="Enter password"
            />
          </div>
          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
<<<<<<< HEAD
          <p className="forgot-password text-right mt-2 h4">
=======
          <p className="forgot-password text-right mt-2">
>>>>>>> d256985 (Complete rehash.  Remove class from App.js to enable use of hooks, add some altered examples to show routing and a login form)
            Forgot <a href="#">password?</a>
          </p>
        </div>
      </form>
    </div>
  )
}