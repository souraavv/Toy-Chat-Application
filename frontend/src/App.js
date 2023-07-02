import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import NavBar from "./components/navBar";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import Logout from "./components/logout";
import RoomForm from "./components/roomForm";
import ChatForm from "./components/chatForm";
import { ToastContainer } from "react-toastify";

import auth from "./services/authService";
import Chat from "./components/chat";
import ProtectedRoute from "./components/common/protectedRoute";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

class App extends Component {
  state = {};

  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    return (
      <React.Fragment> 
        <ToastContainer> </ToastContainer>
        <NavBar user={user}></NavBar>
        <main className="container">
          <Switch>
            <Route path="/register" component={RegisterForm}></Route>
            <Route path="/login" component={LoginForm}></Route>
            <Route path="/logout" component={Logout}></Route>
            <ProtectedRoute path = "/createRoom" component = {RoomForm}> </ProtectedRoute>
            <ProtectedRoute path = "/createChat" component = {ChatForm}> </ProtectedRoute>
            <ProtectedRoute path = "/" component = {Chat}></ProtectedRoute>
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
