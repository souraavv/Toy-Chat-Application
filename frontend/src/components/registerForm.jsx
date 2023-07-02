import React, { Component } from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import * as userService from "../services/userService";
import auth from "../services/authService";

import { toast } from "react-toastify";

class RegisterForm extends Form {
  state = {
    data: { fname:"", lname: "", userid: "", email: "", password: "", phone: "" },
    errors: {}
  };
  schema = {
    fname: Joi.string()
      .required()
      .min(5)
      .max(50)
      .label("fname"),
    lname: Joi.string()
    .required()
    .min(5)
    .max(50)
    .label("lname"),

    userid: Joi.string()
      .required()
      .min(5)
      .max(50)
      .label("userid"),
    
    email: Joi.string()
    .required()
    .email()
    .label("email"),

    password: Joi.string()
      .required()
      .min(5)
      .label("password"),

    phone: Joi.string()
    .required()
    .min(10)
    .max(10)
    .label("phone")

  };
 
  doSubmit = async () => {
    try {
      // const {data} = 
      const response = await userService.register(this.state.data);
      const {data} = response;
      if (data.flag === 0) {
        toast(data.message, {
          className: {
              background: "#00FF00 !important"
          }
        });
          return;
      }
      // console.log(data);
      // console.log(response.headers['x-auth-token']);
      // http.post(apiEndPoint, user);
      auth.loginWithJwt(response.headers["x-auth-token"]);
      window.location = "/chat";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div>
        <h1>Register</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("fname", "First Name")}
            {this.renderInput("lname", "Last Name")}
            {this.renderInput("userid", "User Id")}
            {this.renderInput("email", "Email Id")}
            {this.renderInput("password", "Password", "password")}
            {this.renderInput("phone", "Phone")}
            {this.renderButton("Register")}
          </form>
      </div>
    );
  }
}

export default RegisterForm;
