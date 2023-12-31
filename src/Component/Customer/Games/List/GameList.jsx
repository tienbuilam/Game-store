import styles from './GameList.module.css';
import { domain } from '../../../General/tools/domain';
import { useEffect, useRef, useState } from 'react';
import { isRefNotValid, isRefValid } from '../../../General/tools/refChecker';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineHeart } from 'react-icons/ai';
import { BsCart } from 'react-icons/bs';
import { CiDiscount1 } from 'react-icons/ci';
import { FaGamepad } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import '../../../General/css/modal.css';

const Game = (props) => {
    const [isInWish, setIsInWish] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [render, setRender] = useState(false);
    const [isOut, setIsOut] = useState(false);

    useEffect(() => {
        const formData = new FormData();
        formData.append('id', props.id);
        axios
            .post(`http://${domain}/isAddedToWishlist`, formData, { withCredentials: true })
            .then((res) => {
                setIsInWish(res.data);
            })
            .catch((err) => console.log(err));

        axios
            .post(`http://${domain}/game/status`, formData)
            .then((res) => {
                if (res.data) {
                    axios
                        .post(`http://${domain}/isAddedToCart`, formData, { withCredentials: true })
                        .then((res) => {
                            setIsInCart(res.data);
                        })
                        .catch((err) => console.log(err));
                } else setIsOut(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [render, props.id]);

    const toggleWishlist = () => {
        const formData = new FormData();
        formData.append('id', props.id);
        if (isInWish) {
            axios
                .post(`http://${domain}/removeFromWishlist`, formData, { withCredentials: true })
                .then((res) => {
                    setRender(!render);
                })
                .catch((err) => console.log(err));
        } else {
            axios
                .post(`http://${domain}/addToWishlist`, formData, { withCredentials: true })
                .then((res) => {
                    if (res.data.OutDeleted === '1') props.setshowpopup3(true);
                    else {
                        if (res.data.OutStatus === '1') setRender(!render);
                        else props.setshowpopup1(true);
                    }
                })
                .catch((err) => console.log(err));
        }
    };

    const toggleCart = () => {
        if (isOut) return;
        const formData = new FormData();
        formData.append('id', props.id);
        if (isInCart) {
            axios
                .post(`http://${domain}/removeFromCart`, formData, { withCredentials: true })
                .then((res) => {
                    setRender(!render);
                })
                .catch((err) => console.log(err));
        } else {
            axios
                .post(`http://${domain}/addToCart`, formData, { withCredentials: true })
                .then((res) => {
                    if (res.data.OutDeleted === '1') props.setshowpopup3(true);
                    else {
                        if (res.data.OutStatus === '0') props.setshowpopup1(true);
                        else {
                            if (res.data.OutRemain === '0') props.setshowpopup2(true);
                            setRender(!render);
                        }
                    }
                })
                .catch((err) => console.log(err));
        }
    };

    return (
        <div className={`col-${12 / props.numOfElem} h-100`}>
            <div className="card border border-dark mx-auto h-100" style={{ width: '90%', maxWidth: '300px' }}>
                <img
                    className="card-img-top"
                    style={{ height: '60%' }}
                    alt=""
                    src={
                        props.img === null
                            ? 'https://upload.wikimedia.org/wikipedia/commons/7/71/Nothing_whitespace_blank.png'
                            : `http://${domain}/model/data/games/${props.img}`
                    }
                ></img>
                <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-center">
                        <a href={`./games/${props.id}`} className="btn btn-primary btn-lg">
                            {!props.price && 'N/A'}
                            {props.price && '$'}
                            {props.discount === '0' && props.price}
                            {props.discount !== '0' &&
                                props.discount !== null &&
                                (((parseFloat(props.price) + 0.01) * (100 - parseFloat(props.discount))) / 100).toFixed(
                                    2,
                                ) - 0.01}
                        </a>
                        {props.discount !== null && parseFloat(props.discount) !== 0 && (
                            <CiDiscount1
                                style={{
                                    fontSize: '1.5rem',
                                    color: 'red',
                                    marginLeft: '10px',
                                }}
                            />
                        )}
                        {props.discount !== null && parseFloat(props.discount) !== 0 && (
                            <h4
                                style={{
                                    color: 'red',
                                    marginBottom: '0',
                                }}
                            >
                                {props.discount}%
                            </h4>
                        )}
                    </div>
                    <div className="d-flex mt-3 mx-auto align-items-center">
                        <AiOutlineHeart
                            className={`me-2 ${styles.icons} ${isInWish === false ? styles.unwish : styles.wish}`}
                            style={{ fontSize: '2.5rem' }}
                            onClick={toggleWishlist}
                        />
                        <BsCart
                            className={`ms-2 ${styles.icons} ${
                                isOut ? styles.cartOut : isInCart === false ? styles.uncart : styles.cart
                            }`}
                            style={{ fontSize: '2.5rem' }}
                            onClick={toggleCart}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Group = (props) => {
    const target = useRef(null);
    const div = useRef(null);

    useEffect(() => {
        if (isRefNotValid(target) && isRefValid(div)) target.current = ReactDOM.createRoot(div.current);
        const temp = [];
        for (let i = 0; i < props.data.length; i++) {
            if (props.data[i] !== undefined)
                temp.push(
                    <Game
                        showpopup3={props.showpopup3}
                        setshowpopup3={props.setshowpopup3}
                        showpopup2={props.showpopup2}
                        setshowpopup2={props.setshowpopup2}
                        showpopup1={props.showpopup1}
                        setshowpopup1={props.setshowpopup1}
                        numOfElem={props.numOfElem}
                        key={props.i + i}
                        id={props.data[i].id}
                        name={props.data[i].name}
                        img={props.data[i].picture_1}
                        discount={props.data[i].discount}
                        price={props.data[i].price}
                    />,
                );
        }
        if (isRefValid(target)) target.current.render(<>{temp}</>);
    });

    return <div className={`mb-5 row h-50`} ref={div} style={{ minHeight: '320px', maxHeight: '400px' }}></div>;
};

const CustomerGameList = () => {
    document.title = 'Games';

    const div = useRef(null);
    const target = useRef(null);
    const searchValue = useRef(null);
    const lastBreakpoint = useRef(0);

    const popUpContainer = useRef(null);

    const [render, setRender] = useState(false);
    const [showpopup1, setshowpopup1] = useState(false);
    const [showpopup2, setshowpopup2] = useState(false);
    const [showpopup3, setshowpopup3] = useState(false);

    let timer;
    const searchGame = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            setRender(!render);
        }, 1000);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 576 && lastBreakpoint.current !== 1) {
                lastBreakpoint.current = 1;
                setRender(!render);
            } else if (window.innerWidth < 992 && window.innerWidth >= 576 && lastBreakpoint.current !== 2) {
                lastBreakpoint.current = 2;
                setRender(!render);
            } else if (window.innerWidth < 1920 && window.innerWidth >= 992 && lastBreakpoint.current !== 3) {
                lastBreakpoint.current = 3;
                setRender(!render);
            } else if (window.innerWidth >= 1920 && lastBreakpoint.current !== 4) {
                lastBreakpoint.current = 4;
                setRender(!render);
            }
        };

        window.addEventListener('resize', handleResize);

        if (isRefNotValid(target) && isRefValid(div)) target.current = ReactDOM.createRoot(div.current);

        const formData = new FormData();
        if (isRefValid(searchValue))
            formData.append('name', searchValue.current.value === '' ? null : searchValue.current.value);
        axios
            .post(`http://${domain}/getGames`, formData)
            .then((res) => {
                let numOfElem;
                if (window.innerWidth < 576) numOfElem = 1;
                else if (window.innerWidth < 992) numOfElem = 2;
                else if (window.innerWidth < 1920) numOfElem = 3;
                else numOfElem = 4;
                const temp = [];
                for (let i = 0; i < res.data.length / numOfElem; i++) {
                    if (numOfElem === 1)
                        temp.push(
                            <Group
                                showpopup3={showpopup3}
                                setshowpopup3={setshowpopup3}
                                showpopup2={showpopup2}
                                setshowpopup2={setshowpopup2}
                                showpopup1={showpopup1}
                                setshowpopup1={setshowpopup1}
                                numOfElem={numOfElem}
                                i={i * numOfElem}
                                key={i}
                                data={[res.data[i * numOfElem]]}
                            />,
                        );
                    else if (numOfElem === 2)
                        temp.push(
                            <Group
                                showpopup3={showpopup3}
                                setshowpopup3={setshowpopup3}
                                showpopup2={showpopup2}
                                setshowpopup2={setshowpopup2}
                                showpopup1={showpopup1}
                                setshowpopup1={setshowpopup1}
                                numOfElem={numOfElem}
                                i={i * numOfElem}
                                key={i}
                                data={[res.data[i * numOfElem], res.data[i * numOfElem + 1]]}
                            />,
                        );
                    else if (numOfElem === 3)
                        temp.push(
                            <Group
                                showpopup3={showpopup3}
                                setshowpopup3={setshowpopup3}
                                showpopup2={showpopup2}
                                setshowpopup2={setshowpopup2}
                                showpopup1={showpopup1}
                                setshowpopup1={setshowpopup1}
                                numOfElem={numOfElem}
                                i={i * numOfElem}
                                key={i}
                                data={[
                                    res.data[i * numOfElem],
                                    res.data[i * numOfElem + 1],
                                    res.data[i * numOfElem + 2],
                                ]}
                            />,
                        );
                    else
                        temp.push(
                            <Group
                                showpopup3={showpopup3}
                                setshowpopup3={setshowpopup3}
                                showpopup2={showpopup2}
                                setshowpopup2={setshowpopup2}
                                showpopup1={showpopup1}
                                setshowpopup1={setshowpopup1}
                                numOfElem={numOfElem}
                                i={i * numOfElem}
                                key={i}
                                data={[
                                    res.data[i * numOfElem],
                                    res.data[i * numOfElem + 1],
                                    res.data[i * numOfElem + 2],
                                    res.data[i * numOfElem + 3],
                                ]}
                            />,
                        );
                }
                if (isRefValid(target)) target.current.render(<>{temp}</>);
            })
            .catch((err) => console.log(err));

        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [render]);

    return (
        <div className="w-100 h-100 d-flex flex-column align-items-center" ref={popUpContainer}>
            <div className={`d-flex flex-column align-items-center justify-content-center w-100 mb-2`}>
                <div className={`d-flex align-items-center justify-content-center ${styles.title}`}>
                    <div style={{ color: '#1c60c7', fontSize: '2rem' }} className="d-flex align-items-center">
                        <FaGamepad className="mb-0" style={{ color: '#1c60c7' }} />
                        &nbsp;
                        <h2 className="mb-0">Games</h2>
                    </div>
                </div>
                <div className="d-flex mx-auto mt-3">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className={`position-absolute ${styles.search}`} />
                    <input
                        placeholder="Find game"
                        className={`ps-4 ${styles.searchInput}`}
                        onChange={searchGame}
                        ref={searchValue}
                    ></input>
                </div>
            </div>
            <div className="flex-grow-1 overflow-auto container-fluid mt-4 mb-4" ref={div}></div>
            <Modal show={showpopup1} className={`reAdjustModel`} container={popUpContainer.current}>
                <Modal.Header className="border border-0"></Modal.Header>
                <Modal.Body className="border border-0 d-flex justify-content-center">
                    <h4 className="text-center">This game has been suspended!</h4>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border border-0">
                    <button
                        className="btn btn-primary ms-2 ms-md-4"
                        onClick={() => {
                            setshowpopup1(false);
                            setRender(!render);
                        }}
                    >
                        Okay
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={showpopup2} className={`reAdjustModel`} container={popUpContainer.current}>
                <Modal.Header className="border border-0"></Modal.Header>
                <Modal.Body className="border border-0 d-flex justify-content-center">
                    <h4 className="text-center">This game has been sold out!</h4>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border border-0">
                    <button
                        className="btn btn-primary ms-2 ms-md-4"
                        onClick={() => {
                            setshowpopup2(false);
                        }}
                    >
                        Okay
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={showpopup3} className={`reAdjustModel`} container={popUpContainer.current}>
                <Modal.Header className="border border-0"></Modal.Header>
                <Modal.Body className="border border-0 d-flex justify-content-center">
                    <h4 className="text-center">This game has been deleted!</h4>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border border-0">
                    <button
                        className="btn btn-primary ms-2 ms-md-4"
                        onClick={() => {
                            setshowpopup3(false);
                            setRender(!render);
                        }}
                    >
                        Okay
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CustomerGameList;
