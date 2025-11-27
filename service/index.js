


import axios from "axios";
const adminUrl = import.meta.env.VITE_ADMIN_API_BASE;
const userUrl = import.meta.env.VITE_USER_API_BASE;

class Service {
  constructor(props) {
    this.refreshHeader(() => {});
  }

  refreshHeader(callback) {
    const sessionToken = sessionStorage.getItem("token");
    let srh = {
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionToken,
      },
    };

    let service = axios.create(srh);
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
    return callback();
  }

  handleSuccess(response) {
    return response;
  }

  handleError = (error) => {
    let code = 400;
    let message = "";
    if (typeof error.response != "undefined") {
      if (typeof error.response?.data?.meta?.code != "undefined") {
        code = error.response.data.meta.code;
        message = error.response.data.meta.message;
      }
      if (error.response.statusText === "Unauthorized") {
        code = error.response.status;
        message = error.response.statusText;
      }
    }

    switch (code) {
      case 401:
        sessionStorage.clear();
        window.location.href = `/`;
        break;
      case 404:
        break;
      default:
        if (message !== "") {
        }
        break;
    }
    return Promise.reject(error);
  };

  redirectTo = (document, path) => {
    document.location = path;
  };

  async get(path, callback) {
    let response = await this.service.request(`${adminUrl}/${path}`);
    return callback(response.status, response.data);
  }


  async getPdf(path, callback, config = {}) {
    try {
      let response = await this.service.request({
        url: `${adminUrl}/${path}`,
        method: "GET",
        responseType: config.responseType || "json", 
        ...config,
      });
      return callback(response.status, response);
    } catch (error) {
      throw error;
    }
  }

  async getUser(path, callback) {
    let response = await this.service.request(`${userUrl}/${path}`);
    return callback(response.status, response.data);
  }

  async patch(path, payload, callback) {
    let response = await this.service.request({
      method: "PATCH",
      url: `${adminUrl}/${path}`,
      responseType: "json",
      data: payload,
    });
    return callback(response.status, response.data);
  }

  async post(path, payload, callback) {
    let response = await this.service.request({
      method: "POST",
      url: `${adminUrl}/${path}`,
      responseType: "json",
      data: payload,
    });
    return callback(response);
  }
  async postUser(path, payload, callback) {
    let response = await this.service.request({
      method: "POST",
      url: `${userUrl}/${path}`,
      responseType: "json",
      data: payload,
    });
    return callback(response);
  }

  async postFile(path, payload, callback) {
    let response = await this.service.request({
      method: "POST",
      url: `${userUrl}/${path}`,
      responseType: "json",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: payload,
    });
    return callback(response);
  }

  export const login = async (formData, callback, callbackerror) => {
    await Service.postUser("login", formData, async (response) => {
        return callback(response)
    }).catch((error) => {
        return callbackerror(error);
    })
  }

export const getDashboardData = async( callback , callbackerror) =>{
    await Service.get('dashboard' , async(status,response) =>{
        return callback(status,response)
    }).catch((error) =>{
        return callbackerror(error)
    })
}


    await login(payload,(res) => {
        if (res?.data?.meta?.status === "success") {
          sessionStorage.setItem("isAuth", true);
          sessionStorage.setItem("role", res?.data?.data?.user?.roles?.[0]);
          sessionStorage.setItem("token", res?.data?.data?.token);
          sessionStorage.setItem("user", JSON.stringify(res?.data?.data?.user));
          sessionStorage.setItem("name",  res?.data?.data?.user?.name);
          notify(res?.data?.meta?.message);
          let redirectTo = "";
          redirectTo = "/dashboard";
          window.location.href = redirectTo;
          setIsLoading(false);
        } else {
          notify(res?.data?.meta?.message, "danger");
          setIsLoading(false);
        }
      },
      (error) => {
        notify(error?.response?.data?.meta?.message, "danger");
        setIsLoading(false);
      }
    );

  
  async put(path, payload, callback) {
    let response = await this.service.request({
      method: "PUT",
      url: `${adminUrl}/${path}`,
      responseType: "json",
      data: payload,
    });
    callback(response.status, response.data);
    return response;
  }

  async delete(path, payload, callback) {
    let response = await this.service.request({
      method: "DELETE",
      url: `${adminUrl}/${path}`,
      responseType: "json",
      data: payload,
    });
    return callback(response);
  }
}

export default new Service();

//CALL MAKE A STORE

   export const deleteComplaint  = async (id,formData, callback, callbackerror) =>{
      await Service.delete(`complaints/${id}`, formData, async (response) => {
          return callback(response)
      }).catch((error) => {
          return callbackerror(error);
      })
  }


// Notification Service

import { Store } from "react-notifications-component";

export default function notify( desc = ' ', type = 'success', title = '') {
    switch (type) {
        case 'snack':
            // rootStore.toast.text = title;
            // rootStore.toast.visible = true;
            break;
        case 'remove':
            Store.removeAllNotifications();
            break;
        default:
            Store.removeAllNotifications();
            Store.addNotification({
                title: title,
                message: desc,
                type: type,
                insert: "top",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                    duration: 2000,
                    onScreen: false,
                    showIcon: true
                }
            });
            break;
    }
};

//import in main

import { createRoot } from 'react-dom/client';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

//then under return in root component
    <ErrorBoundary>
    <ReactNotifications />
    </ErrorBoundary>


// ERR OR BOUNDARY COMPONENT


import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to your error reporting service
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={this.handleRetry}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// ROLE BASED HOC
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBaseHoc = (WrappedComponent, allowedRoles) => {
  const role = sessionStorage.getItem('role')?.split(",");
  if (!role || !allowedRoles.some((r) => role.includes(r))) {
    return <Navigate to="/not-access" replace />;
  }
  return <WrappedComponent />;
};

export default RoleBaseHoc;

