import styles from './SignUp.module.css';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { checkCookie } from '../../../General/tools/cookie';
import { domain } from '../../../General/tools/domain';

function CustomerSignUp() {
    const navigate = useNavigate();

    const [inputs, setInputs] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    const formChange = useCallback((event) => {
        const { name, value } = event.target;
        setInputs((values) => ({ ...values, [name]: value }));
    }, []);

    const formSubmit = useCallback(
        (event) => {
            event.preventDefault();
            if (inputs.password !== inputs.repassword) {
                setErrorMessage('Your passwords are not matched!');
                return;
            }

            const formData = new FormData();
            Object.entries(inputs).forEach(([key, value]) => {
                formData.append(key, value || null);
            });

            axios
                .post(`http://${domain}/signUp`, formData)
                .then((res) => {
                    if (res.data.email || res.data.username) {
                        setErrorMessage(`This ${res.data.email ? 'email' : 'account'} has already been taken!`);
                    } else {
                        navigate('/');
                    }
                })
                .catch((error) => console.log(error));
        },
        [inputs, navigate],
    );

    useEffect(() => {
        if (checkCookie('PHPSESSID')) navigate('./home');
        document.title = 'Sign up';
    }, [navigate]);

    return (
        <>
            <div className={styles.background}></div>
            <div className="container-fluid d-flex h-100">
                <form
                    onSubmit={formSubmit}
                    className={`${styles.form} bg-light d-flex flex-column align-items-center justify-content-around fs-5 my-auto mx-auto`}
                >
                    <div className="border-bottom border-dark w-100 d-flex flex-column align-items-center mb-2">
                        <h1 className={`my-3 mx-5 ${styles.title}`}>Sign up</h1>
                    </div>
                    {/* Name Field */}
                    <div className="mb-1 form-outline" style={{ width: '220px' }}>
                        <label htmlFor="form_name" className={`${styles.font}`}>
                            Name
                        </label>
                        <input
                            type="text"
                            id="form_name"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="name"
                            required
                        />
                    </div>

                    {/* Email Field */}
                    <div className="mb-1 form-outline" style={{ width: '220px' }}>
                        <label htmlFor="form_email" className={`${styles.font}`}>
                            Email address
                        </label>
                        <input
                            type="email"
                            id="form_email"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="email"
                            required
                        />
                    </div>

                    {/* Phone Field */}
                    <div className="mb-1 form-outline" style={{ width: '220px' }}>
                        <label htmlFor="form_phone" className={`${styles.font}`}>
                            Phone number
                        </label>
                        <input
                            title="Your phone number should not contain alphabetical character(s)"
                            pattern="[0-9]{10}"
                            type="text"
                            maxLength={10}
                            id="form_phone"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="phone"
                        />
                    </div>

                    {/* Date of Birth Field */}
                    <div className="mb-1 form-outline" style={{ width: '220px' }}>
                        <label htmlFor="form_dob" className={`${styles.font}`}>
                            Date of birth
                        </label>
                        <input
                            type="date"
                            id="form_dob"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="dob"
                        />
                    </div>

                    {/* Username Field */}
                    <div className="mb-1 form-outline" style={{ width: '220px' }}>
                        <label htmlFor="form_username" className={`${styles.font}`}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="form_username"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="username"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-outline mb-1" style={{ width: '220px' }}>
                        <label htmlFor="form_password" className={`${styles.font}`}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="form_password"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="password"
                            required
                        />
                    </div>

                    {/* Re-enter Password Field */}
                    <div className="mb-2 form-outline" style={{ width: '220px' }}>
                        <label htmlFor="form_repassword" className={`${styles.font}`}>
                            Re-enter your password
                        </label>
                        <input
                            type="password"
                            id="form_repassword"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="repassword"
                            required
                        />
                    </div>

                    {/* Error Message Display */}
                    <div className="d-flex align-items-center">
                        {errorMessage && (
                            <>
                                <AiOutlineCloseCircle className={`${styles.icon}`} />
                                <p className={styles.errorMessage}>{errorMessage}</p>
                            </>
                        )}
                    </div>

                    {/* Submit Button */}
                    <input
                        type="submit"
                        className={`btn btn-primary btn-block mb-4 ${styles.font}`}
                        value="Create account"
                    />

                    {/* Navigation Link */}
                    <div className="row mb-2">
                        <div className="col">
                            <a href="/" className={`text-decoration-none text-center ${styles.font}`}>
                                Go back to login
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default CustomerSignUp;
