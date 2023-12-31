import styles from './GameDetail.module.css';
import axios from 'axios';
import '../../../General/css/carousel.css';
import '../../../General/css/scroll.css';
import { useState, useEffect, useRef, React } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiTrash } from 'react-icons/bi';
import FormattedText from '../../../General/tools/formatText';
import { Carousel } from 'react-bootstrap';
import { CiDiscount1 } from 'react-icons/ci';
import { domain } from '../../../General/tools/domain';
import { isRefValid } from '../../../General/tools/refChecker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

function AdminGameDetail() {
    const id = useParams().id;
    const [game, SetGame] = useState({
        name: 'N/A',
        description: 'N/A',
        discount: 'N/A',
        price: 'N/A',
        rating: 'N/A',
        spec_min: 'N/A',
        spec_max: 'N/A',
        image1url: 'N/A',
        image2url: 'N/A',
        image3url: 'N/A',
        image4url: 'N/A',
    });
    const [solds, setSolds] = useState('N/A');
    const [status, setStatus] = useState({ str: 'N/A', color: 'N/A' });
    const [sellStatus, setSellStatus] = useState({ str: 'N/A', color: 'N/A' });
    const [category, setCategory] = useState('N/A');
    const [render, setRender] = useState(false);

    const navigate = useNavigate();

    const delete_pop_up = useRef(null);
    const deactivate_pop_up = useRef(null);
    const activate_pop_up = useRef(null);

    useEffect(() => {
        const formData = new FormData();
        formData.append('id', id);
        axios
            .post(`http://${domain}/admin/game/detail`, formData)
            .then((res) => {
                document.title = res.data.name;
                SetGame({
                    name: res.data.name,
                    description: res.data.description,
                    discount: res.data.discount,
                    price: res.data.price,
                    rating: res.data.ratings,
                    spec_min: res.data.spec_minimum,
                    spec_max: res.data.spec_recommended,
                    image1url:
                        res.data.picture_1 === null ? null : `http://${domain}/model/data/games/${res.data.picture_1}`,
                    image2url:
                        res.data.picture_2 === null ? null : `http://${domain}/model/data/games/${res.data.picture_2}`,
                    image3url:
                        res.data.picture_3 === null ? null : `http://${domain}/model/data/games/${res.data.picture_3}`,
                    image4url:
                        res.data.picture_4 === null ? null : `http://${domain}/model/data/games/${res.data.picture_4}`,
                });
                if (res.data.status === '1') setSellStatus({ str: 'Active', color: '#128400' });
                else setSellStatus({ str: 'Disabled', color: 'red' });
            })
            .catch((error) => {
                console.log(error);
            });
        axios
            .post(`http://${domain}/admin/game/getSales`, formData)
            .then((res) => {
                setSolds(res.data.solds === '0' ? 'N/A' : res.data.solds);
            })
            .catch((error) => {
                console.log(error);
            });
        axios
            .post(`http://${domain}/admin/game/gameCategory`, formData)
            .then((res) => {
                if (res.data.length) {
                    let temp = res.data[0].category_type;
                    for (let i = 1; i < res.data.length - 1; i++) temp += ', ' + res.data[i].category_type;
                    setCategory(temp);
                }
            })
            .catch((error) => {
                console.log(error);
            });
        axios
            .post(`http://${domain}/admin/game/status`, formData)
            .then((res) => {
                if (res.data) setStatus({ str: 'Available', color: '#128400' });
                else setStatus({ str: 'Out of stock', color: 'red' });
            })
            .catch((error) => {
                console.log(error);
            });
    }, [render, id]);

    const deleteGame = () => {
        const formData = new FormData();
        formData.append('IDs', id);
        axios
            .post(`http://${domain}/admin/game/delete`, formData)
            .then((res) => {
                navigate(-1);
            })
            .catch((error) => console.log(error));
    };

    const handleActivation = () => {
        if (sellStatus.str === 'Active') {
            if (isRefValid(deactivate_pop_up)) deactivate_pop_up.current.style.display = 'flex';
        } else {
            if (isRefValid(activate_pop_up)) activate_pop_up.current.style.display = 'flex';
        }
    };

    const activateGame = () => {
        const formData = new FormData();
        formData.append('IDs', id);
        axios
            .post(`http://${domain}/admin/game/activate`, formData)
            .then((res) => {
                setRender(!render);
            })
            .catch((error) => console.log(error));
    };

    const deactivateGame = () => {
        const formData = new FormData();
        formData.append('IDs', id);
        axios
            .post(`http://${domain}/admin/game/deactivate`, formData)
            .then((res) => {
                setRender(!render);
            })
            .catch((error) => console.log(error));
    };

    return (
        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <div className="d-flex align-items-center w-100" style={{ minHeight: '50px' }}>
                <div className="ms-auto ms-lg-3 me-lg-0 me-3 d-flex align-items-center">
                    <BiTrash
                        className={`${styles.trash}`}
                        onClick={() => {
                            if (isRefValid(delete_pop_up)) delete_pop_up.current.style.display = 'flex';
                        }}
                    />
                    <FontAwesomeIcon
                        icon={faPowerOff}
                        className={`ms-3 ${styles.trash} ${
                            sellStatus.str === 'Active' ? styles.red_power : styles.green_power
                        }`}
                        onClick={handleActivation}
                    />
                </div>
                <div className="ms-lg-auto me-lg-3 me-auto ms-">
                    <button
                        className={`me-2 btn btn-sm btn-primary`}
                        onClick={() => {
                            navigate('./edit');
                        }}
                    >
                        Edit
                    </button>
                    <button
                        className={`ms-2 btn btn-sm btn-secondary`}
                        onClick={() => {
                            navigate(-1);
                        }}
                    >
                        Back
                    </button>
                </div>
            </div>
            <div className={`w-100 overflow-auto hideBrowserScrollbar d-flex flex-column flex-grow-1 mb-3`}>
                <div className={`d-lg-flex w-100`}>
                    <div className={`d-flex flex-column ${styles.sections} align-self-center`}>
                        <h1 className="text-center">{game.name}</h1>
                        <Carousel className={`flex-grow-1 align-self-center`} style={{ width: '90%' }}>
                            <Carousel.Item>
                                <img className={`d-block w-100 ${styles.img}`} src={game.image1url} alt="First" />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img className={`d-block w-100 ${styles.img}`} src={game.image2url} alt="Second" />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img className={`d-block w-100 ${styles.img}`} src={game.image3url} alt="Third" />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img className={`d-block w-100 ${styles.img}`} src={game.image4url} alt="Fourth" />
                            </Carousel.Item>
                        </Carousel>
                    </div>
                    <div
                        className={`${styles.sections} ms-lg-5 mt-2 mt-lg-0 d-flex flex-column align-items-center align-items-lg-start align-self-center`}
                    >
                        <div className={`d-flex align-items-center my-lg-3`}>
                            <h4>Selling status:&nbsp;&nbsp;</h4>
                            <h4
                                style={{
                                    color: sellStatus.color,
                                }}
                            >
                                {sellStatus.str}
                            </h4>
                        </div>
                        <div className={`d-flex align-items-center my-lg-3`}>
                            <h4>Status:&nbsp;&nbsp;</h4>
                            <h4
                                style={{
                                    color: status.color,
                                }}
                            >
                                {status.str}
                            </h4>
                        </div>
                        <div
                            className={`d-flex align-items-center ${styles.tags} my-lg-3 w-100 justify-content-center justify-content-lg-start`}
                        >
                            <h4>Category:&nbsp;&nbsp;</h4>
                            <div className="overflow-auto">
                                <h4
                                    style={{
                                        whiteSpace: 'nowrap',
                                        height: '26px',
                                    }}
                                >
                                    {category}
                                </h4>
                            </div>
                        </div>
                        <div className="d-flex align-items-center my-lg-3">
                            <h4>
                                Price:&nbsp;&nbsp;{!game.price && 'N/A'}
                                {game.price && '$'}
                                {game.discount === '0' && game.price}
                                {game.discount !== '0' &&
                                    game.discount !== null &&
                                    (
                                        ((parseFloat(game.price) + 0.01) * (100 - parseFloat(game.discount))) /
                                        100
                                    ).toFixed(2) - 0.01}
                                &nbsp;&nbsp;&nbsp;
                            </h4>
                            {game.discount !== null && parseFloat(game.discount) !== 0 && (
                                <CiDiscount1
                                    style={{
                                        fontSize: '1.5rem',
                                        color: 'red',
                                        marginBottom: '12px',
                                    }}
                                />
                            )}
                            {game.discount !== null && parseFloat(game.discount) !== 0 && (
                                <h4 style={{ color: 'red' }}>{game.discount}%</h4>
                            )}
                        </div>
                        <h4 className="my-lg-3">Sold:&nbsp;&nbsp;{solds}</h4>
                    </div>
                </div>
                <div className={`mt-3 container-fluid flex-grow-1`}>
                    <div className="row justify-content-center align-items-center g-2">
                        <h5 className={`${styles.text_align}`} style={{ fontWeight: 'bold' }}>
                            Description
                        </h5>
                        <p style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                            {(game.description === null || game.description === '') && 'N/A'}
                            {game.description !== null && game.description !== '' && game.description}
                        </p>
                        <h3 className="text-center" style={{ fontWeight: 'bold' }}>
                            System requirements
                        </h3>
                        <div className="d-flex flex-column flex-lg-row justify-content-lg-around">
                            <div>
                                <h5 className={`${styles.text_align}`} style={{ fontWeight: 'bold' }}>
                                    Miniumum
                                </h5>
                                <FormattedText text={game.spec_min} />
                            </div>
                            <div>
                                <h5 className={`${styles.text_align}`} style={{ fontWeight: 'bold' }}>
                                    Recommended
                                </h5>
                                <FormattedText text={game.spec_max} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`position-absolute flex-column align-items-center justify-content-around ${styles.pop_up}`}
                ref={delete_pop_up}
            >
                <h3 className="mx-2">Do you really want to delete this game?</h3>
                <div className="d-flex flex-row align-items-center justify-content-center">
                    <button
                        className={`btn btn-primary mx-3`}
                        onClick={() => {
                            if (isRefValid(delete_pop_up)) delete_pop_up.current.style.display = 'none';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className={`btn btn-danger mx-3`}
                        onClick={() => {
                            if (isRefValid(delete_pop_up)) delete_pop_up.current.style.display = 'none';
                            deleteGame();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
            <div
                className={`position-absolute flex-column align-items-center justify-content-around ${styles.pop_up}`}
                ref={deactivate_pop_up}
            >
                <h3 className="mx-2">Do you really want to deactivate this game?</h3>
                <div className="d-flex flex-row align-items-center justify-content-center">
                    <button
                        className={`btn btn-primary mx-3`}
                        onClick={() => {
                            if (isRefValid(deactivate_pop_up)) deactivate_pop_up.current.style.display = 'none';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className={`btn btn-danger mx-3`}
                        onClick={() => {
                            if (isRefValid(deactivate_pop_up)) deactivate_pop_up.current.style.display = 'none';
                            deactivateGame();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
            <div
                className={`position-absolute flex-column align-items-center justify-content-around ${styles.pop_up}`}
                ref={activate_pop_up}
            >
                <h3 className="mx-2">Do you really want to activate this game?</h3>
                <div className="d-flex flex-row align-items-center justify-content-center">
                    <button
                        className={`btn btn-danger mx-3`}
                        onClick={() => {
                            if (isRefValid(activate_pop_up)) activate_pop_up.current.style.display = 'none';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className={`btn btn-primary mx-3`}
                        onClick={() => {
                            if (isRefValid(activate_pop_up)) activate_pop_up.current.style.display = 'none';
                            activateGame();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminGameDetail;
