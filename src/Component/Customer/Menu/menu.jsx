import styles from './menu.module.css';
import axios from 'axios';
import '../../General/css/scroll.css';
import { VscAccount } from 'react-icons/vsc';
import { useEffect, useRef, useState, useCallback } from 'react';
import { domain } from '../../General/tools/domain';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faHouse,
    faGamepad,
    faRightFromBracket,
    faHeart,
    faCartShopping,
} from '@fortawesome/free-solid-svg-icons';
import { checkCookie } from '../../General/tools/cookie';
import { Outlet, useNavigate } from 'react-router-dom';
import { isRefValid } from '../../General/tools/refChecker';
import { deleteCustomerCookie } from '../../General/tools/cookie';

const CustomerMenu = () => {
    const navigate = useNavigate();
    const navbar = useRef(null);
    const tabs = useRef(null);
    const navToggler = useRef(null);
    const [showSidebar, setShowSidebar] = useState(true);

    const handleToggleSidebar = useCallback(() => {
        const navbarStyle = isRefValid(navbar) ? navbar.current.style : null;
        const tabsStyle = isRefValid(tabs) ? tabs.current.style : null;

        if (showSidebar) {
            navbarStyle.width = '0';
            tabsStyle.opacity = '0';
        } else {
            navbarStyle.width = '160px';
            tabsStyle.opacity = '1';
        }
        setShowSidebar(!showSidebar);
    }, [showSidebar]);

    const logOut = useCallback(() => {
        axios
            .get(`http://${domain}/logout`, { withCredentials: true })
            .then((res) => {
                deleteCustomerCookie();
                navigate('/');
            })
            .catch(console.error);
    }, [navigate]);

    const handleClickOutside = useCallback(
        (event) => {
            if (
                showSidebar &&
                window.innerWidth < 768 &&
                isRefValid(navbar) &&
                !navbar.current.contains(event.target) &&
                isRefValid(navToggler) &&
                !navToggler.current.contains(event.target)
            ) {
                navbar.current.style.width = '0';
                tabs.current.style.opacity = '1';
                setShowSidebar(false);
            }
        },
        [showSidebar],
    );

    useEffect(() => {
        if (!checkCookie('PHPSESSID')) navigate('/');

        const trackWidth = () => {
            if (window.innerWidth >= 768) {
                if (isRefValid(navbar)) navbar.current.style.width = '160px';
                if (isRefValid(tabs)) tabs.current.style.opacity = '1';
                setShowSidebar(true);
            }
        };

        trackWidth();
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', trackWidth);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', trackWidth);
        };
    }, [navigate, handleClickOutside]);

    return (
        <div className="w-100 h-100" style={{ backgroundColor: '#f8f8f8' }}>
            <button className={styles.navToggler} onClick={handleToggleSidebar} ref={navToggler}>
                <FontAwesomeIcon icon={faBars} style={{ color: '#000000', fontSize: '1.5rem' }} />
            </button>
            <div className={`h-100 d-flex flex-column border border-2 border-right ${styles.navbar}`} ref={navbar}>
                <div className={styles.dummy}></div>
                <div
                    className={`flex-grow-1 d-flex flex-column overflow-auto mt-md-3 hideBrowserScrollbar ${styles.tabs}`}
                    ref={tabs}
                >
                    <div
                        className={`d-flex align-items-center justify-content-center mb-3 ${styles.hover}`}
                        onClick={() => navigate('./profile')}
                    >
                        <span
                            className="d-flex align-items-center justify-content-center p-0"
                            style={{ fontSize: '3.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <VscAccount />
                        </span>
                    </div>
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => {
                            navigate('./home');
                        }}
                    >
                        <span
                            className={`d-flex align-items-center p-0 ms-2`}
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faHouse} className={`me-1`} />
                            Home
                        </span>
                    </div>
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => {
                            navigate('./games');
                        }}
                    >
                        <span
                            className={`d-flex align-items-center p-0 ms-2`}
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faGamepad} className={`me-1`} />
                            Games
                        </span>
                    </div>
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => {
                            navigate('./wish-list');
                        }}
                    >
                        <span
                            className={`d-flex align-items-center p-0 ms-2`}
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faHeart} className={`me-1`} />
                            Wishlist
                        </span>
                    </div>
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => {
                            navigate('./cart');
                        }}
                    >
                        <span
                            className={`d-flex align-items-center p-0 ms-2`}
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faCartShopping} className={`me-1`} />
                            Cart
                        </span>
                    </div>
                    <div
                        className={`d-flex align-items-center mt-auto ${styles.hover}`}
                        onClick={() => {
                            logOut();
                        }}
                    >
                        <span
                            className={`d-flex align-items-center p-0 ms-2`}
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: 'red' }}
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className={`me-1`} />
                            Log out
                        </span>
                    </div>
                </div>
            </div>

            <div className={`d-flex align-items-center justify-content-center ${styles.page}`}>
                <div className={styles.pageContent}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default CustomerMenu;
