import React, { useRef, useState } from "react";
import "../Style/Sujal.css"; // Optional: keep your existing CSS
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate()
    const [selectedModal, setSelectedModal] = useState('Login')
  const inputRefs = useRef([]);
  const handleChange = (index, e) => {
    const { value } = e.target;

    if (/^\d?$/.test(value)) {
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
};

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace"  && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
};
    return (
        <div className="flex h-[100vh] bg-[#876B56] sp_login">
            <div className="left">
                {selectedModal === 'Login' &&
                    <div className="login-section">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Welcome</h2>
                            <h4 className=" animation a2">
                                Please login to your account
                            </h4>
                        </header>

                        <form>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input-field animation a3"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="input-field animation a4"
                            />
                            <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                <a href="#" onClick={() => setSelectedModal('Forgot')}>Forgot password?</a>
                            </p>
                            <button type="button" onClick={()=>{navigate('/dashboard')}}  className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Sign in
                            </button>
                        </form>
                    </div>}
                {selectedModal === 'Forgot' &&
                    <div className="login-section">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Forgot password</h2>
                            <h4 className=" animation a2">
                                Please enter email to procced
                            </h4>
                        </header>

                        <form>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input-field animation a3"
                            />
                            <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                <a href="#" onClick={() => setSelectedModal('Login')}>Back to login</a>
                            </p>
                            <button type="submit" onClick={() => setSelectedModal('OTP')} className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Send Otp
                            </button>
                        </form>
                    </div>}
                {selectedModal === 'OTP' &&
                    <div className="login-section">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Varify Otp</h2>
                            <h4 className=" animation a2">
                                Check your mail box
                            </h4>
                        </header>
                        <form>
                            <div className="flex gap-3 w-full py-3">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        name={`otp${i}`}
                                        id={`otp-${i}`}
                                        className="aspect-square w-[40px] flex-1 text-center otpBox animation a3"
                                        maxLength="1"
                                        onChange={(e) => handleChange(i, e)}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                    />
                                ))}
                            </div>
                            <p className="animation a5 text-right text-white text-sm my-4 hover:text-black">
                                <a href="#" onClick={() => setSelectedModal('Login')}>Back to login</a>
                            </p>
                            <button type="submit" onClick={() => setSelectedModal('Reset')} className="animation a6 hover:bg-transparent hover:border-[#B79982] hover:shadow-xl hover:scale-105">
                                Varify Otp
                            </button>
                        </form>
                    </div>}
                {selectedModal === 'Reset' &&
                    <div className="login-section">
                        <header>
                            <h2 className="text-3xl text-white animation a1 mb-4 font-semibold">Reset OTP</h2>
                            <h4 className=" animation a2">
                                Reset Your Password
                            </h4>
                        </header>
                        <form>
                            <input
                                type="Password"
                                placeholder="Password"
                                className="input-field animation a3"
                            />
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
