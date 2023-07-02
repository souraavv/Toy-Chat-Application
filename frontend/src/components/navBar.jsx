import React from "react";
import { Link, NavLink, withRouter } from "react-router-dom";

const NavBar = ({ user }) => {
    let nameOfApp = " Toy Chat";
    let name;
    if (user)
      name = user.fname + ' ' + user.lname;
    // console.log(user);
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary">
      <Link className="navbar-brand" to="/chat">
       <h5 style={{color: "white"}}>{nameOfApp}</h5>
      </Link>
     
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ml-auto">
          {!user && (
            <React.Fragment>
              <li className="nav-item" >
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/register">
                  Register
                </NavLink>
              </li>
            </React.Fragment>
          )}
          {user && (
            <React.Fragment>
              <li className="nav-item">
                <NavLink className="nav-link" to="/createRoom">
                  Join New Room
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/createChat">
                  Join New Chat
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/profile">
                  {name}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/logout">
                  Logout
                </NavLink>
              </li>
            </React.Fragment>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
