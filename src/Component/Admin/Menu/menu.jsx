import styles from './menu.module.css';
import { VscAccount } from 'react-icons/vsc';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { domain } from '../../General/tools/domain';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faHouse,
    faUser,
    faGamepad,
    faCalculator,
    faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { checkCookie, deleteAdminCookie } from '../../General/tools/cookie';
import { Outlet, useNavigate } from 'react-router-dom';
import { isRefValid } from '../../General/tools/refChecker';
import '../../General/css/scroll.css';

function AdminMenu() {
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
            .get(`http://${domain}/admin/logout`, { withCredentials: true })
            .then(() => {
                deleteAdminCookie();
                navigate('/admin');
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
                tabs.current.style.opacity = '0';
                setShowSidebar(false);
            }
        },
        [showSidebar],
    );

    useEffect(() => {
        if (!checkCookie('PHPADMINSESSID')) navigate('/admin');

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
            <div className={`h-100 d-flex flex-column border border-2 border-right  ${styles.navbar}`} ref={navbar}>
                <div className={styles.dummy}></div>
                <div
                    className={`flex-grow-1 d-flex flex-column overflow-auto mt-md-3 hideBrowserScrollbar ${styles.tabs}`}
                    ref={tabs}
                >
                    {/* Profile */}
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
                    {/* Home */}
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => navigate('./home')}
                    >
                        <span
                            className="d-flex align-items-center p-0 ms-2"
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faHouse} className="me-1" />
                            Home
                        </span>
                    </div>
                    {/* Customer List */}
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => navigate('./customer-list')}
                    >
                        <span
                            className="d-flex align-items-center p-0 ms-2"
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faUser} className="me-1" />
                            Customers
                        </span>
                    </div>
                    {/* Game List */}
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => navigate('./game-list')}
                    >
                        <span
                            className="d-flex align-items-center p-0 ms-2"
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faGamepad} className="me-1" />
                            Games
                        </span>
                    </div>
                    {/* Statistics */}
                    <div
                        className={`d-flex align-items-center mb-3 ${styles.hover}`}
                        onClick={() => navigate('./statistic')}
                    >
                        <span
                            className="d-flex align-items-center p-0 ms-2"
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: '#1c60c7' }}
                        >
                            <FontAwesomeIcon icon={faCalculator} className="me-1" />
                            Statistics
                        </span>
                    </div>
                    {/* Logout */}
                    <div className={`d-flex align-items-center mt-auto ${styles.hover}`} onClick={logOut}>
                        <span
                            className="d-flex align-items-center p-0 ms-2"
                            style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', color: 'red' }}
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="me-1" />
                            Log out
                        </span>
                    </div>
                </div>
            </div>

            <div className={`d-flex align-items-center justify-content-center ${styles.page}`}>
                <div style={{ height: '98%', width: '98%' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminMenu;
