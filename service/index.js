


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

import { Navigate, Route, BrowserRouter as Router, Routes, } from "react-router-dom";

const AppRoutes = () => {
  const token = sessionStorage.getItem('token'); 
  const isLoggedIn = sessionStorage.getItem("isAuth") == "true";

  if (!isLoggedIn && !token) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <NotificationProvider>
      <SidebarHeader />
      <Routes>
        <Route path="/*" element={<ErrorPage />} />
        <Route path="/not-access" element={<NotAcess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ---------------------------PROFILE ROUTES --------------------------------------------*/}
        <Route path="/profile" element={<Profile />} />
        {/* -------------------------NOTIFICATION ROUTES -----------------------------------------*/}
        <Route path="/notification" element={<Notification />} />
        {/* ---------------USER LIST ROUTES ----------------------------------------------------- */}
        <Route path="/user-list" element={RoleBaseHoc(UserList ,['super admin','vertical admin'])} />
        <Route path="/add-user" element={RoleBaseHoc(AddUser  ,['super admin','vertical admin'])} />
        <Route path="/view-user" element={RoleBaseHoc(ViewUser  ,['super admin','vertical admin'])} />
        <Route path="/edit-user" element={RoleBaseHoc(EditUser  ,['super admin'])} />
        {/* ---------------USER LIST ROUTES ----------------------------------------------------- */}
        <Route path="/user-list-vertical-admin" element={RoleBaseHoc(UserListForVerticalAdmin ,['vertical admin'])} />
        <Route path="/view-user-vertical-admin" element={RoleBaseHoc(ViewVerticalAdminUser  ,['vertical admin'])} />
        <Route path="/edit-user-vertical-admin" element={RoleBaseHoc(EditVerticalAdminUser  ,['vertical admin'])} />
        {/* ------------------STATE LIST ROUTES------------------------------------------------- */}
        <Route path="/vertical-admin-list" element={RoleBaseHoc(VerticalAdminList  ,['super admin'])} />
        {/* <Route path="/add-state-list" element={RoleBaseHoc(AddVerticalAdminList  ,['super admin'])} /> */}
        <Route path="/view-state-list" element={RoleBaseHoc(ViewVerticalAdminList  ,['super admin'])} />
        <Route path="/edit-state-list" element={RoleBaseHoc(EditVerticalAdminList  ,['super admin'])} />
        {/* ------------------------MASTER ROUTES ---------------------------------------------- */}
        <Route path="/master" element={RoleBaseHoc(Master ,['super admin'])} />
        <Route path="/vertical-admin-master" element={RoleBaseHoc(VerticalAdmin ,['super admin'])} />
        {/* ---------------------------MECHINE ROUTES -------------------------------------------*/}
        <Route path="/machine" element={RoleBaseHoc(Machine ,['super admin'])} />
        <Route path="/add-new-machine" element={RoleBaseHoc(AddNewMachine ,['super admin'])} />
        <Route path="/view-machine" element={RoleBaseHoc(ViewMachine ,['super admin'])} />
        <Route path="/edit-machine" element={RoleBaseHoc(EditMachine ,['super admin'])} />
        {/* ---------------------------SPARE ROUTES ---------------------------------------------*/}
        <Route path="/spare-part" element={RoleBaseHoc(SparePart ,['super admin'])} />
        <Route path="/add-new-spare" element={RoleBaseHoc(AddSparePart ,['super admin'])} />
        <Route path="/view-spare" element={RoleBaseHoc(ViewSparePart ,['super admin'])} />
        <Route path="/edit-spare" element={RoleBaseHoc(EditSparePart ,['super admin'])} />

        {/* ---------------------------------COMPLAIN CATEGORY ROUTES----------------------------*/}
        <Route path="/complain-category" element={RoleBaseHoc(ComplainCategory  ,['super admin'])} />
        <Route path="/add-complain-category" element={RoleBaseHoc(AddComplianCategory  ,['super admin'])} />
        <Route path="/edit-complain-category"element={RoleBaseHoc(EditComplianCategory ,['super admin'])} />
        {/* -------------------------COMPLAIN Type ROUTES----------------------------------------*/}
        <Route path="/complain-type" element={RoleBaseHoc(ComplainType  ,['super admin'])} />
        <Route path="/add-complain-type" element={RoleBaseHoc(AddCompliantType  ,['super admin'])} />
        <Route path="/edit-complain-type" element={RoleBaseHoc(EditCompliantType  ,['super admin'])} />
        {/* -------------------------PRODUCT ROUTES----------------------------------------------*/}
        <Route path="/products" element={RoleBaseHoc(Product  ,['super admin'])} />
        <Route path="/add-products" element={RoleBaseHoc(AddProduct  ,['super admin'])} />
        <Route path="/edit-products" element={RoleBaseHoc(EditProduct  ,['super admin'])} />
       {/* ---------------------------Complaints ROUTES ----------------------------------------*/}
        <Route path="/all-complaints" element={RoleBaseHoc(Complaints ,['super admin','vertical admin','dealer',"employee"])} />
        <Route path="/view-complaints" element={RoleBaseHoc(ViewComplaints ,['super admin','vertical admin','dealer',"employee"])} />
        <Route path="/edit-complaints" element={RoleBaseHoc(EditComplaints ,['super admin','dealer'])} />
       {/* ---------------------------Dealers ROUTES ----------------------------------------*/}
        <Route path="/dealer-list" element={RoleBaseHoc(Dealers ,['vertical admin'])} />
        <Route path="/add-dealer" element={RoleBaseHoc(AddDealer ,['vertical admin'])} />
        <Route path="/view-dealer" element={RoleBaseHoc(ViewDealer ,['vertical admin'])} />
        <Route path="/edit-dealer" element={RoleBaseHoc(EditDealer ,['vertical admin'])} />
       {/* ------------------Technicians LIST ROUTES------------------------------------------------- */}
        <Route path="/technicians-list" element={RoleBaseHoc(TechniciansList  ,['dealer'])} />
        <Route path="/add-technician" element={RoleBaseHoc(AddTechniciansList  ,['dealer'])} />
        <Route path="/view-technician" element={RoleBaseHoc(ViewTechniciansList  ,['dealer'])} />
        <Route path="/edit-technician" element={RoleBaseHoc(EditTechniciansList  ,['dealer'])} />
         {/* ------------------Enquiry LIST ROUTES------------------------------------------------- */}
       <Route path="/enquiries" element={RoleBaseHoc(AllEnquiries  ,['dealer'])} />
       <Route path="/machine-enquiries" element={RoleBaseHoc(MachinePart  ,['dealer'])} />
       <Route path="/view-machine-enquiries" element={RoleBaseHoc(ViewMachineEnquiry  ,['dealer'])} />
       <Route path="/edit-machine-enquiries" element={RoleBaseHoc(EditMachineEnquiry  ,['dealer'])} />
       <Route path="/spare-parts-enquiries" element={RoleBaseHoc(SparePartEnquiry  ,['dealer'])} />
       <Route path="/view-spare-enquiries" element={RoleBaseHoc(ViewSpareEnquiries  ,['dealer'])} />
       <Route path="/edit-spare-enquiries" element={RoleBaseHoc(EditSpareEnquiries  ,['dealer'])} />
       {/* ------------------Technicians LIST ROUTES------------------------------------------------- */}
       <Route path="/revisit-request" element={RoleBaseHoc(RevisitRequest  ,['dealer'])} />
       <Route path="/view-revisit-request" element={RoleBaseHoc(ViewRevistRequest  ,['dealer'])} />
       <Route path="/edit-revisit-request" element={RoleBaseHoc(EditRevisitRequest  ,['dealer'])} />
       {/* ------------------CUSTOMER LIST ROUTES------------------------------------------------- */}
       <Route path="/all-customer" element={RoleBaseHoc(CustomerList  ,['dealer'])} />
       <Route path="/view-customer" element={RoleBaseHoc(ViewCustomerList  ,['dealer'])} />
      </Routes>
      </NotificationProvider>
    </Router>
  );
};

