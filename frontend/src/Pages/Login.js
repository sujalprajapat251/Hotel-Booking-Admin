import React, { useRef, useState } from "react";
import "../Style/Sujal.css"; // Optional: keep your existing CSS
import { useNavigate } from "react-router-dom";
import { ChangePassSchema, LoginSchema, OtpSchema, ResetSchema } from "../Schema/Formik";
import { useFormik } from "formik";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { forgotPassword, login, resendOtp, resetPassword, verifyOtp } from "../Redux/Slice/auth.slice";
import { useDispatch } from "react-redux";
const LoginPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const [selectedModal, setSelectedModal] = useState('Login')
    const inputRefs = useRef([]);
    const handleChange = (index, e) => {
        const { value } = e.target;

        if (/^\d?$/.test(value)) {
            OtpFormik.setFieldValue(`otp${index}`, value);

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !OtpFormik.values[`otp${index}`] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };


    // admin login handling 
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };
    const loginVal = {
        email: "",
        password: ""
    }

    const LoginFormik = useFormik({
        initialValues: loginVal,
        validationSchema: LoginSchema,
        onSubmit: (values, action) => {
            dispatch(login(values))
                .then((response) => {
                    if (response.meta?.requestStatus === "fulfilled") {
                        // Check user role and navigate accordingly
                        const userRole = response.payload?.user?.designation || 'user';
                        console.log('user', userRole)
                        if (userRole === 'admin') {
                            navigate("/dashboard");
                        }
                        else if (userRole === 'Waiter') {
                            navigate("/waiter/dashboard")
                        }
                        else if (userRole === 'Chef') {
                            navigate("/chef/dashboard")
                        }
                        else if (userRole === 'Worker') {
                            navigate("/worker/dashboard")
                        }
                        else if (userRole === 'Head of Department') {
                            navigate("/hod/dashboard")
                        }
                        else if (userRole === 'Accountant') {
                            navigate("/accountant/dashboard")
                        }
                        else {
                            navigate("/booking-dashboard");
                        }
                    }
                })
            action.resetForm()
        }
    })


    // forgot passoword
    const forgetVal = {
        email: ""
    }
    const [emailData, setEmailData] = useState("")
    const ForgetPassFormik = useFormik({
        initialValues: forgetVal,
        validationSchema: ResetSchema,
        onSubmit: (values, action) => {
            setEmailData(values.email)
            dispatch(forgotPassword(values.email))
                .then((response) => {
                    if (response.meta?.requestStatus === "fulfilled") {
                        setSelectedModal('OTP');
                    }
                })
        },
    });

    const resendOtp = () => {
        dispatch(forgotPassword(emailData))
    }


    // otp varify
    const OtpFormik = useFormik({
        initialValues: {
            otp0: "",
            otp1: "",
            otp2: "",
            otp3: "",
        },
        validationSchema: OtpSchema,
        onSubmit: (values, action) => {
            const finalOtp = values.otp0 + values.otp1 + values.otp2 + values.otp3;
            dispatch(verifyOtp({ email: emailData, otp: finalOtp }))
                .then((response) => {
                    if (response.meta?.requestStatus === "fulfilled") {
                        setSelectedModal('Reset')
                    }
                })
        }
    })

    // reset otp 
    const [oldPass, setOldPass] = useState(false)
    const [newPass, setNewPass] = useState(false)
    const changePassVal = {
        newPassword: "",
        conPassword: ""
    }

    const ChangePassFormik = useFormik({
        initialValues: changePassVal,
        validationSchema: ChangePassSchema,
        onSubmit: (values, action) => {
            dispatch(resetPassword({ email: emailData, newPassword: values.newPassword })).then((response) => {
                // setShowCreatePassword(false);
                if (response?.meta?.requestStatus === "fulfilled") {
                    //  setToggle("login")
                    setSelectedModal('Login')
                }
            })
            action.resetForm()
        }
    })
    return (
        <div className="flex h-[100vh] bg-[#876B56] sp_login">
            <div className="left">
                {selectedModal === 'Login' &&
                    <div className="login-section text-center">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Welcome</h2>
                            <h4 className=" animation a2">
                                Please login to your account
                            </h4>
                        </header>

                        <form onSubmit={LoginFormik.handleSubmit}>
                            <input
                                placeholder="Email"
                                className="input-field animation a3"
                                type="email"
                                name="email"
                                value={LoginFormik.values.email}
                                onChange={LoginFormik.handleChange}
                                onBlur={LoginFormik.handleBlur}
                            />
                            {LoginFormik.touched.email && LoginFormik.errors.email && (<p className="text-red-700 text-sm text-start">{LoginFormik.errors.email}</p>)}
                            <div className="input-field bg-white flex items-center  animation a4">
                                <input
                                    placeholder="Password"
                                    className=" bg-transparent focus-visible:outline-none"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={LoginFormik.values.password}
                                    onChange={LoginFormik.handleChange}
                                    onBlur={LoginFormik.handleBlur}
                                />
                                <span className="text-gray-400 ms-auto" onClick={togglePasswordVisibility}>{showPassword ? <IoMdEye /> : <IoMdEyeOff />}</span>
                            </div>
                            {LoginFormik.touched.password && LoginFormik.errors.password && (<p className="text-red-700 text-sm text-start">{LoginFormik.errors.password}</p>)}
                            <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                <a href="#" onClick={() => setSelectedModal('Forgot')}>Forgot password?</a>
                            </p>
                            <button type="submit" className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Sign in
                            </button>
                        </form>
                    </div>}
                {selectedModal === 'Forgot' &&
                    <div className="login-section text-center">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Forgot password</h2>
                            <h4 className=" animation a2">
                                Please enter email to procced
                            </h4>
                        </header>

                        <form onSubmit={ForgetPassFormik.handleSubmit}>
                            <input
                                placeholder="Email"
                                className="input-field animation a3"
                                type="email"
                                name="email"
                                value={ForgetPassFormik.values.email}
                                onChange={ForgetPassFormik.handleChange}
                                onBlur={ForgetPassFormik.handleBlur}
                            />
                            {ForgetPassFormik.touched.email && ForgetPassFormik.errors.email && (<p className="text-red-700 text-sm text-start">{ForgetPassFormik.errors.email}</p>)}
                            <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                <a href="#" onClick={() => setSelectedModal('Login')}>Back to login</a>
                            </p>
                            <button type="submit" className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Send Otp
                            </button>
                        </form>
                    </div>}
                {selectedModal === 'OTP' &&
                    <div className="login-section text-center">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Varify Otp</h2>
                            <h4 className=" animation a2">
                                Check your mail box
                            </h4>
                        </header>
                        <form onSubmit={OtpFormik.handleSubmit}>
                            <div className="flex md:gap-3 gap-1 w-full md:py-3 py-1 justify-center">
                                {[0, 1, 2, 3].map((i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        name={`otp${i}`}
                                        id={`otp-${i}`}
                                        className="aspect-square md:w-[50px] w-[35px]   text-center otpBox animation a3"
                                        maxLength="1"
                                        value={OtpFormik.values[`otp${i}`]}
                                        onChange={(e) => handleChange(i, e)}
                                        onBlur={OtpFormik.handleBlur}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                    />
                                ))}
                            </div>
                            {Object.keys(OtpFormik.errors).length > 0 && OtpFormik.submitCount > 0 && (<p className="text-red-700 text-sm text-center">Please enter a valid 4-digit OTP</p>)}
                            <div className="flex justify-between">

                                <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                    <a href="#" onClick={resendOtp} >resend OTP</a>
                                </p>
                                <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                    <a href="#" onClick={() => setSelectedModal('Login')}>Back to login</a>
                                </p>
                            </div>

                            <button type="submit" className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Varify Otp
                            </button>
                        </form>
                    </div>}
                {selectedModal === 'Reset' &&
                    <div className="login-section text-center">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Reset OTP</h2>
                            <h4 className=" animation a2">
                                Reset Your Password
                            </h4>
                        </header>
                        <form onSubmit={ChangePassFormik.handleSubmit}>
                            <div className="input-field bg-white flex items-center  animation a4">
                                <input
                                    className=" bg-transparent focus-visible:outline-none"
                                    type={oldPass ? "text" : "password"}
                                    name="newPassword"
                                    value={ChangePassFormik?.values?.newPassword}
                                    onChange={ChangePassFormik.handleChange}
                                    onBlur={ChangePassFormik.handleBlur}
                                    placeholder="Enter New password"
                                />
                                <span className="text-gray-400 ms-auto" onClick={() => setOldPass(!oldPass)}>{oldPass ? <IoMdEye /> : <IoMdEyeOff />}</span>
                            </div>
                            {ChangePassFormik.touched.newPassword && ChangePassFormik.errors.newPassword && (<div className="text-red-700 text-sm text-start">{ChangePassFormik.errors.newPassword}</div>)}
                            <div className="input-field bg-white flex items-center  animation a4">
                                <input
                                    className=" bg-transparent focus-visible:outline-none"
                                    type={newPass ? "text" : "password"}
                                    name="conPassword"
                                    value={ChangePassFormik?.values?.conPassword}
                                    onChange={ChangePassFormik.handleChange}
                                    onBlur={ChangePassFormik.handleBlur}
                                    placeholder="Confirm New password"
                                />
                                <span className="text-gray-400 ms-auto" onClick={() => setNewPass(!newPass)}>{newPass ? <IoMdEye /> : <IoMdEyeOff />}</span>
                            </div>
                            {ChangePassFormik.touched.conPassword && ChangePassFormik.errors.conPassword && (<div className="text-red-700 text-sm text-start">{ChangePassFormik.errors.conPassword}</div>)}
                            <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                <a href="#" onClick={() => setSelectedModal('Login')}>Back to login</a>
                            </p>
                            <button type="submit" className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Reset
                            </button>
                        </form>
                    </div>}
            </div>

            <div className="right"></div>
        </div>
    );
};

export default LoginPage;
