import styles from './Login.module.css';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { checkCookie } from '../../../General/tools/cookie';
import { domain } from '../../../General/tools/domain';

const CustomerLogin = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const formChange = useCallback((event) => {
        const { name, value } = event.target;
        setInputs((values) => ({ ...values, [name]: value }));
    }, []);

    const formSubmit = useCallback(
        (event) => {
            event.preventDefault();
            const { username, password } = inputs;
            if (!username || !password) {
                setError('missing');
                return;
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            axios
                .post(`http://${domain}/login`, formData, { withCredentials: true })
                .then((res) => {
                    if (res.data) {
                        navigate('./home');
                    } else {
                        setError('wrong');
                    }
                })
                .catch(console.log);
        },
        [inputs, navigate],
    );

    useEffect(() => {
        if (checkCookie('PHPSESSID')) navigate('./home');
        document.title = 'Login';
    }, [navigate]);

    const showError = error && (
        <div className="d-flex align-items-center mb-4">
            <AiOutlineCloseCircle style={{ marginRight: '5px', marginBottom: '16px' }} className={styles.p} />
            <p className={styles.p}>
                {error === 'missing' ? 'Username or password is missing!' : 'Username or password is not correct!'}
            </p>
        </div>
    );

    return (
        <>
            <div className={`${styles.background}`}></div>
            <div className="container-fluid d-flex h-100">
                <form
                    onSubmit={formSubmit}
                    className={`${styles.form} bg-light d-flex flex-column align-items-center justify-content-around fs-5 my-auto mx-auto`}
                >
                    <div className="border-bottom border-dark w-100 d-flex flex-column align-items-center mb-5">
                        <h1 className={`my-3 mx-5 ${styles.title}`}>Welcome!</h1>
                    </div>
                    <div className="mb-4 form-outline">
                        <label htmlFor="form_username" className={`${styles.font}`}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="form_username"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="username"
                            value={inputs.username}
                        />
                    </div>
                    <div className="form-outline mb-2">
                        <label htmlFor="form_password" className={`${styles.font}`}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="form_password"
                            className={`form-control ${styles.font}`}
                            onChange={formChange}
                            name="password"
                            value={inputs.password}
                        />
                    </div>
                    {showError}
                    <input type="submit" className={`btn btn-primary btn-block mb-4 ${styles.font}`} value="Sign in" />
                    <div className="row mb-4">
                        <div className="col">
                            <a
                                href="./recovery"
                                className={`text-decoration-none text-center ${styles.font} d-block mb-3`}
                            >
                                Forgot password?
                            </a>
                            <span className={`${styles.font}`}>
                                Are you new?{' '}
                                <a href="./signUp" className={`text-decoration-none text-center`}>
                                    Sign up
                                </a>
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CustomerLogin;
