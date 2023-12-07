import styles from './Recovery.module.css';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { domain } from '../../../General/tools/domain';
import { isRefValid } from '../../../General/tools/refChecker';

function AdminRecovery() {
    const navigate = useNavigate();

    const checkUsernameRef = useRef(null);
    const changingPasswordRef = useRef(null);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRepassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleUsernameValidation = useCallback(
        (event) => {
            event.preventDefault();
            if (!username) {
                setErrorMessage('Enter your username!');
            } else {
                const formData = new FormData();
                formData.append('username', username);
                axios
                    .post(`http://${domain}/admin/recovery`, formData)
                    .then((res) => {
                        if (res.data) {
                            if (isRefValid(checkUsernameRef)) checkUsernameRef.current.style.display = 'none';
                            if (isRefValid(changingPasswordRef)) changingPasswordRef.current.style.display = 'flex';
                        } else {
                            setErrorMessage('Username not found!');
                        }
                    })
                    .catch((error) => console.log(error));
            }
        },
        [username],
    );

    const handleChangePassword = useCallback(
        (e) => {
            e.preventDefault();
            if (password !== repassword) {
                setErrorMessage('Passwords are not matched!');
            } else {
                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);
                axios
                    .post(`http://${domain}/admin/newPassword`, formData)
                    .then((res) => {
                        console.log(res);
                        navigate('/admin');
                    })
                    .catch((error) => console.log(error));
            }
        },
        [password, repassword, username, navigate],
    );

    useEffect(() => {
        document.title = 'Password Recovery';
        const handleResize = () => {
            if (window.innerHeight > 330) {
                if (isRefValid(checkUsernameRef)) checkUsernameRef.current.classList.add('h-100');
                if (isRefValid(changingPasswordRef)) changingPasswordRef.current.classList.add('h-100');
            } else {
                if (isRefValid(checkUsernameRef)) checkUsernameRef.current.classList.remove('h-100');
                if (isRefValid(changingPasswordRef)) changingPasswordRef.current.classList.remove('h-100');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <div className={styles.background}></div>
            {/* Validate username first */}
            <div
                className={`container align-items-center justify-content-center ${styles.checkUsername}`}
                ref={checkUsernameRef}
            >
                <form
                    onSubmit={handleUsernameValidation}
                    className={`${styles.form} bg-light d-flex flex-column align-items-center justify-content-around fs-5`}
                >
                    <div className="border-bottom border-dark w-100 d-flex flex-column align-items-center mb-5">
                        <h1 className={`my-3 mx-5 ${styles.title}`}>Password Recovery</h1>
                    </div>
                    <div className="mb-2 form-outline">
                        <label htmlFor="form_username" className={`${styles.font}`}>
                            Enter your username
                        </label>
                        <input
                            type="text"
                            id="form_username"
                            className={`form-control ${styles.font}`}
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                            name="username"
                        />
                    </div>
                    {errorMessage && (
                        <div className="d-flex align-items-center mb-4">
                            <AiOutlineCloseCircle
                                style={{ marginRight: '5px', marginBottom: '16px' }}
                                className={styles.p}
                            />
                            <p className={styles.p}>{errorMessage}</p>
                        </div>
                    )}
                    <input type="submit" className={`btn btn-primary btn-block mb-4 ${styles.font}`} value="Continue" />
                    <div className="row mb-4">
                        <div className="col">
                            <a href="/admin" className={`text-decoration-none ${styles.font}`}>
                                Go back to login
                            </a>
                        </div>
                    </div>
                </form>
            </div>
            {/* Changing password */}
            <div
                className={`container align-items-center justify-content-center ${styles.newPassword}`}
                ref={changingPasswordRef}
                style={{ display: 'none' }}
            >
                <form
                    onSubmit={handleChangePassword}
                    className={`${styles.form} bg-light d-flex flex-column align-items-center justify-content-around fs-5`}
                >
                    <div className="border-bottom border-dark w-100 d-flex flex-column align-items-center mb-5">
                        <h1 className={`my-3 mx-5 ${styles.title}`}>Set New Password</h1>
                    </div>
                    <div className="mb-4 form-outline">
                        <label htmlFor="form_password" className={`${styles.font}`}>
                            Enter new password
                        </label>
                        <input
                            type="password"
                            id="form_password"
                            className={`form-control ${styles.font}`}
                            placeholder="New Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-2 form-outline">
                        <label htmlFor="form_repassword" className={`${styles.font}`}>
                            Confirm new password
                        </label>
                        <input
                            type="password"
                            id="form_repassword"
                            className={`form-control ${styles.font}`}
                            placeholder="Confirm Password"
                            onChange={(e) => setRepassword(e.target.value)}
                        />
                    </div>
                    {errorMessage && (
                        <div className="d-flex align-items-center mb-4">
                            <AiOutlineCloseCircle
                                style={{ marginRight: '5px', marginBottom: '16px' }}
                                className={styles.p}
                            />
                            <p className={styles.p}>{errorMessage}</p>
                        </div>
                    )}
                    <input type="submit" className={`btn btn-primary btn-block mb-4 ${styles.font}`} value="Finish" />
                    <div className="row mb-4">
                        <div className="col">
                            <a href="/admin" className={`text-decoration-none ${styles.font}`}>
                                Go back to login
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AdminRecovery;
