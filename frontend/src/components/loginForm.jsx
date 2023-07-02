import React, { Component } from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { Redirect } from "react-router-dom";

import { toast } from "react-toastify";

class LoginForm extends Form {
  state = {
    data: { email: "", password: "" },
    errors: {}
  };

  schema = {
    email: Joi.string()
      .email()
      .required()
      .label("Email Id"),
    password: Joi.string()
      .required()
      .label("Password")
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      const loginData = await auth.login(this.state.data);
      const { state } = this.props.location;
      if (loginData.status != 200 || loginData.flag === 0 || loginData.flag === 1) {
        // console.log(loginData);
        loginData.message = "Invalid Email or Password"
        toast(loginData.message, {
          className: {
              background: "#00FF00 !important"
          }
        });
        return;
      }
      else {
        window.location = state ? state.from.pathname : "/chat";
      }
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    if (auth.getCurrentUser()) return <Redirect to="/chat" />;
    return (
      <div>
        {/* <div style = {{textAlign: "center", display: "table-cell", verticalAlign: "middle"}}> */}
        <h1>Login</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("email", "Email Id")}
            {this.renderInput("password", "Password", "password")}
            {this.renderButton("Login")}
          </form>
          {/* </div> */}
      </div>
    );
  }
}

export default LoginForm;
