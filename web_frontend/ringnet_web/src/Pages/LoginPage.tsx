import Navbar from "../Components/Navbar/Navbar";
import { useState, useEffect } from "react";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUserId } from "../State/authSlice";
import axios from "axios";
import styles from "./pages.module.css";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";



// Validation Schemas
const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

// Initial Values


const initialFormValues = {
  name: "",
  email: "",
  password: "",
};


interface FormValues {
  name: string;
  email: string;
  password: string;
}
function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false); // State to toggle between login and register

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isMediumScreen = useMediaQuery("(min-width:960px)");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");

    if (errorParam === "UnauthorizedDomain") {
      toast.error("Only Gosaas accounts are allowed to log in.");
      urlParams.delete("error");
      navigate({ search: urlParams.toString() }, { replace: true });
    }
  }, []);
  const enableRegister = () => {
    setShowRegister(true)
  }


  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };



  const changeShowRegister = (resetForm: () => void) => {
    setShowRegister(!showRegister)
    resetForm(); // Reset form values when toggling
    setError(null);
  }

  // URL parameter check for error (optional)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");

    if (errorParam === "UnauthorizedDomain") {
      toast.error("Only Gosaas accounts are allowed to log in.");
      urlParams.delete("error");
      navigate({ search: urlParams.toString() }, { replace: true });
    }
  }, []);

  // Login function
  const login = async (values: FormValues, onSubmitProps: FormikHelpers<FormValues>) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, values);
      console.log("here", values)
      const { token, userId } = response.data;
      dispatch(setToken(token));
      dispatch(setUserId(userId));
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      navigate("/");
    } catch (error) {
      setError("Login failed");
    }
  };

  // Register function
  const register = async (values: FormValues, onSubmitProps: FormikHelpers<FormValues>) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, values);
      console.log(response)
      const { token, userId } = response.data;
      dispatch(setToken(token));
      dispatch(setUserId(userId));
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      navigate("/");
    } catch (error) {
      setError("Registration failed");
    }
  };

  // Handle form submission
  const handleFormSubmit = async (values: FormValues, onSubmitProps: FormikHelpers<any>) => {
    if (showRegister) {
      await register(values as FormValues, onSubmitProps);
    } else {
      await login(values as FormValues, onSubmitProps);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.parentContainer}>
        <Box
          display="flex"
          sx={{
            marginTop: 8,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            width: isNonMobile ? "40%" : "90%",
            margin: "auto",
            borderRadius: "1rem",
            boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
            borderBottom: "0.25rem solid #8B0000",
            borderColor: "#8B0000",
          }}
        >
          <img
            className="logo"
            src="logo.png"
            alt="logo"
            style={{
              width: isMediumScreen ? "20%" : "30%",
              height: "auto",
              marginTop: "3rem",
            }}
          />
          {/* <Button
            fullWidth
            type="button"
            onClick={handleGoogleLogin}
            sx={{
              m: "1rem 0",
              mt: "3rem",
              p: "1rem",
              maxWidth: "80%",
              backgroundColor: "#BD383B",
              color: "#FFFFFF",
              borderRadius: "0.5rem",
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "#C70039",
              },
            }}
          >
            Sign in with Google
          </Button> */}

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialFormValues}
            validationSchema={showRegister ? registerSchema : loginSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              resetForm
            }) => (
              <form className="authForm" onSubmit={handleSubmit}>
                <Box
                  component="div"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    overflow: "hidden",
                    transition: "all 0.5s ease-in-out",
                    marginTop: "1em",
                  }}
                >
                  <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                    sx={{
                      "& > div": {
                        gridColumn: isNonMobile ? undefined : "span 4",
                      },
                    }}
                    style={{ marginTop: "2%" }}
                  >
                    {showRegister && (
                      <TextField
                        label="Name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.name}
                        name="name"
                        error={Boolean(touched.name) && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        fullWidth
                        sx={{
                          gridColumn: "span 4",
                          width: "100%",
                          pt: "0.5rem",
                          maxWidth: "80%",
                        }}
                        style={{
                          marginLeft: "10%",
                          width: "600px",
                        }}
                      />
                    )}

                    <TextField
                      label="Email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      name="email"
                      error={Boolean(touched.email) && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      fullWidth
                      sx={{
                        gridColumn: "span 4",
                        width: "100%",
                        pt: "0.5rem",
                        maxWidth: "80%",
                      }}
                      style={{
                        marginLeft: "10%",
                        width: "600px",
                      }}
                    />

                    <TextField
                      label="Password"
                      type="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.password}
                      name="password"
                      error={Boolean(touched.password) && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      fullWidth
                      sx={{
                        gridColumn: "span 4",
                        width: "100%",
                        pt: "0.5rem",
                        maxWidth: "80%",
                      }}
                      style={{
                        marginLeft: "10%",
                        width: "600px",
                      }}
                    />
                  </Box>

                  {error && (
                    <Box mt="0.5rem">
                      <Typography variant="body2" color="error">
                        {error}
                      </Typography>
                    </Box>
                  )}

                  <Box mt="1.5rem">
                    <Button
                      fullWidth
                      type="submit"
                      sx={{
                        m: "1rem ",
                        mb: "5rem",
                        p: "1rem",
                        maxWidth: "80%",
                        backgroundColor: "#8B0000",
                        color: "#FFFFFF",
                        borderRadius: "0.5rem",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          backgroundColor: "#C70039",
                        },
                      }}
                    >
                      {showRegister ? "REGISTER" : "LOGIN"}
                    </Button>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ cursor: "pointer" }} onClick={() => changeShowRegister(resetForm)}>
                  {showRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                </Typography>
              </form>

            )}

          </Formik>


        </Box>
      </div>
    </>
  );
}

export default LoginPage;