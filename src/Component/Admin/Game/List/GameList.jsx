import axios from 'axios';
import styles from './GameList.module.css';
import ReactDOM from 'react-dom/client';
import '../../../General/css/scroll.css';
import { BsSearch } from 'react-icons/bs';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { domain } from '../../../General/tools/domain';
import { isRefValid, isRefNotValid } from '../../../General/tools/refChecker';
import { CiDiscount1 } from 'react-icons/ci';
import { AiFillStar } from 'react-icons/ai';

const Game = (props) => {
    const [solds, setSolds] = useState('N/A');
    const [category, setCategory] = useState('N/A');

    useEffect(() => {
        const saleFormData = new FormData();
        saleFormData.append('id', props.id);
        axios
            .post(`http://${domain}/admin/game/getSales`, saleFormData)
            .then((res) => {
                if (res.data.solds !== 0) setSolds(res.data.solds);
            })
            .catch((error) => console.log(error));

        const categoryFormData = new FormData();
        categoryFormData.append('id', props.id);
        axios
            .post(`http://${domain}/admin/game/gameCategory`, categoryFormData)
            .then((res) => {
                if (res.data.length !== 0) {
                    let temp = res.data[0].category_type;
                    for (let i = 1; i < res.data.length; i++) temp += ', ' + res.data[i].category_type;
                    setCategory(temp);
                }
            })
            .catch((error) => console.log(error));
    }, [props.id]);

    return (
        <tr
            className={`${styles.detail}`}
            onClick={() => {
                if (
                    isRefValid(props.refCheckboxes, props.i) &&
                    props.refCheckboxes.current[props.i].style.display !== 'block'
                )
                    props.Navigate(`./${props.id}`);
            }}
        >
            <td className="col-1 text-center">
                <div className={`w-100 h-100 d-flex align-items-center justify-content-center`}>
                    <strong ref={(el) => (props.refNumbers.current[props.i] = el)}>{props.i + 1}</strong>
                    <input
                        ref={(el) => (props.refCheckboxes.current[props.i] = el)}
                        type="checkbox"
                        className={`${styles.checkbox}`}
                        value={props.id}
                    ></input>
                </div>
            </td>
            <td className="col-2 text-center">{props.name}</td>
            <td className="col-2 text-center">
                <div className="w-100 d-flex align-items-center justify-content-center">
                    <p style={{ marginBottom: '0' }}>
                        {props.price === null && 'N/A'}
                        {props.price !== null && '$'}
                        {props.discount === '0' && props.price}
                        {props.discount !== null &&
                            props.discount !== '0' &&
                            (((parseFloat(props.price) + 0.01) * (100 - parseFloat(props.discount))) / 100).toFixed(2) -
                                0.01}
                    </p>
                    {props.discount !== null && props.discount !== '0' && (
                        <div className="d-flex align-items-center ms-2">
                            <p style={{ marginBottom: '4px' }}>
                                <CiDiscount1 style={{ fontSize: '1.2rem', color: 'red' }} />
                            </p>
                            <p style={{ marginBottom: '0', color: 'red' }}>{props.discount}%</p>
                        </div>
                    )}
                </div>
            </td>
            <td className="col-2 text-center">{category}</td>
            <td className="col-2 text-center">
                <div className="w-100 d-flex align-items-center justify-content-center">
                    <AiFillStar style={{ fontSize: '1rem', color: 'yellow' }} />
                    {props.ratings}
                </div>
            </td>
            <td className="col-1 text-center">{solds}</td>
            <td className="col-2 text-center" style={{ color: props.status === '1' ? '#128400' : 'red' }}>
                {props.status === '1' ? 'Active' : 'Disabled'}
            </td>
        </tr>
    );
};

function GameList() {
    const [renderTrigger, setRenderTrigger] = useState(true);
    const [mode, setMode] = useState(null);

    const cancel = useRef(null);
    const deleteButton = useRef(null);
    const addButton = useRef(null);
    const confirm = useRef(null);
    const search = useRef(null);
    const activateButton = useRef(null);
    const deactivateButton = useRef(null);

    const tableBody = useRef(null);
    const target = useRef(null);
    const numberTag = useRef(null);
    const selectAll = useRef(null);
    const checkboxes = useRef([]);
    const numbers = useRef([]);

    const noGameSelected = useRef(null);
    const delete_confirmation = useRef(null);
    const deactivate_confirmation = useRef(null);
    const activate_confirmation = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Game list';

        if (isRefNotValid(target) && isRefValid(tableBody)) target.current = ReactDOM.createRoot(tableBody.current);

        axios
            .get(`http://${domain}/admin/game/getList`)
            .then((res) => {
                checkboxes.current = [];
                numbers.current = [];

                const temp = [];
                for (let i = 0; i < res.data.length; i++)
                    temp.push(
                        <Game
                            status={res.data[i].status}
                            Navigate={navigate}
                            refCheckboxes={checkboxes}
                            refNumbers={numbers}
                            key={i}
                            i={i}
                            name={res.data[i].name}
                            price={res.data[i].price === null ? null : res.data[i].price}
                            ratings={res.data[i].ratings}
                            discount={res.data[i].discount}
                            id={res.data[i].id}
                        />,
                    );
                if (isRefValid(target)) target.current.render(<>{temp}</>);
            })
            .catch((error) => console.log(error));
    }, [renderTrigger, navigate]);

    let timerId;
    const searchGame = () => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            const formData = new FormData();
            formData.append('name', isRefValid(search) ? search.current.value : '');
            axios
                .post(`http://${domain}/admin/game/find`, formData)
                .then((res) => {
                    checkboxes.current = [];
                    numbers.current = [];

                    const temp = [];
                    for (let i = 0; i < res.data.length; i++)
                        temp.push(
                            <Game
                                Navigate={navigate}
                                refCheckboxes={checkboxes}
                                refNumbers={numbers}
                                key={i}
                                i={i}
                                name={res.data[i].name}
                                price={res.data[i].price}
                                ratings={res.data[i].ratings}
                                discount={res.data[i].discount}
                                id={res.data[i].id}
                            />,
                        );
                    if (isRefValid(target)) target.current.render(<>{temp}</>);
                })
                .catch((error) => console.log(error));
        }, 500);
    };

    const toggleCheckboxes = (localMode) => {
        if (isRefValid(selectAll)) selectAll.current.checked = false;
        if (isRefValid(cancel)) {
            if (cancel.current.style.display === '' || cancel.current.style.display === 'none') {
                cancel.current.style.setProperty('display', 'block', 'important');
                if (localMode === 0) {
                    cancel.current.classList.remove(`btn-primary`);
                    cancel.current.classList.add(`btn-danger`);
                }
                if (isRefValid(confirm)) {
                    confirm.current.style.setProperty('display', 'block', 'important');
                    if (localMode === 0) {
                        confirm.current.classList.remove(`btn-danger`);
                        confirm.current.classList.add(`btn-primary`);
                    }
                }
                if (isRefValid(deleteButton)) deleteButton.current.style.display = 'none';
                if (isRefValid(activateButton)) activateButton.current.style.display = 'none';
                if (isRefValid(deactivateButton)) deactivateButton.current.style.display = 'none';
                if (isRefValid(addButton)) addButton.current.style.display = 'none';
                if (isRefValid(selectAll)) selectAll.current.style.display = 'block';
                if (isRefValid(numberTag)) numberTag.current.style.display = 'none';
                for (let i = 0; i < checkboxes.current.length; i++) {
                    if (isRefValid(checkboxes, i)) checkboxes.current[i].style.display = 'block';
                    if (isRefValid(numbers, i)) numbers.current[i].style.display = 'none';
                }
            } else {
                cancel.current.style.setProperty('display', 'none', 'important');
                if (cancel.current.classList.contains(`btn-danger`)) {
                    cancel.current.classList.remove(`btn-danger`);
                    cancel.current.classList.add(`btn-primary`);
                }
                if (isRefValid(confirm)) {
                    confirm.current.style.setProperty('display', 'none', 'important');
                    if (confirm.current.classList.contains(`btn-primary`)) {
                        confirm.current.classList.remove(`btn-primary`);
                        confirm.current.classList.add(`btn-danger`);
                    }
                }
                if (isRefValid(deleteButton)) deleteButton.current.style.display = 'block';
                if (isRefValid(activateButton)) activateButton.current.style.display = 'block';
                if (isRefValid(deactivateButton)) deactivateButton.current.style.display = 'block';
                if (isRefValid(addButton)) addButton.current.style.display = 'block';
                if (isRefValid(selectAll)) selectAll.current.style.display = 'none';
                if (isRefValid(numberTag)) numberTag.current.style.display = 'block';
                for (let i = 0; i < checkboxes.current.length; i++) {
                    if (isRefValid(checkboxes, i)) {
                        checkboxes.current[i].style.display = 'none';
                        checkboxes.current[i].checked = false;
                    }
                    if (isRefValid(numbers, i)) numbers.current[i].style.display = 'block';
                }
            }
        }
    };

    const preProcess = () => {
        let isEmpty = true;
        for (let i = 0; i < checkboxes.current.length; i++) {
            if (isRefValid(checkboxes, i) && checkboxes.current[i].checked === true) {
                isEmpty = false;
                break;
            }
        }

        if (isEmpty) {
            if (isRefValid(noGameSelected)) noGameSelected.current.style.display = 'flex';
        } else {
            if (isRefValid(delete_confirmation) && mode === 2) delete_confirmation.current.style.display = 'flex';
            else if (isRefValid(deactivate_confirmation) && mode === 1)
                deactivate_confirmation.current.style.display = 'flex';
            else if (isRefValid(activate_confirmation) && mode === 0)
                activate_confirmation.current.style.display = 'flex';
        }
    };

    const deleteGame = () => {
        const temp = [];
        for (let i = 0; i < checkboxes.current.length; i++)
            if (isRefValid(checkboxes, i) && checkboxes.current[i].checked === true)
                temp.push(checkboxes.current[i].value);

        const formData = new FormData();
        formData.append('IDs', temp);
        axios
            .post(`http://${domain}/admin/game/delete`, formData)
            .then((res) => {
                toggleCheckboxes();
                setRenderTrigger(!renderTrigger);
            })
            .catch((error) => console.log(error));
    };

    const activateGame = () => {
        const temp = [];
        for (let i = 0; i < checkboxes.current.length; i++)
            if (isRefValid(checkboxes, i) && checkboxes.current[i].checked === true)
                temp.push(checkboxes.current[i].value);

        const formData = new FormData();
        formData.append('IDs', temp);
        axios
            .post(`http://${domain}/admin/game/activate`, formData)
            .then((res) => {
                toggleCheckboxes();
                setRenderTrigger(!renderTrigger);
            })
            .catch((error) => console.log(error));
    };

    const deactivateGame = () => {
        const temp = [];
        for (let i = 0; i < checkboxes.current.length; i++)
            if (isRefValid(checkboxes, i) && checkboxes.current[i].checked === true)
                temp.push(checkboxes.current[i].value);

        const formData = new FormData();
        formData.append('IDs', temp);
        axios
            .post(`http://${domain}/admin/game/deactivate`, formData)
            .then((res) => {
                toggleCheckboxes();
                setRenderTrigger(!renderTrigger);
            })
            .catch((error) => console.log(error));
    };

    const selectAllCheckboxes = () => {
        for (let i = 0; i < checkboxes.current.length; i++)
            if (isRefValid(checkboxes, i)) checkboxes.current[i].checked = selectAll.current.checked;
    };

    return (
        <div className="w-100 h-100 d-flex flex-column align-items-center">
            <div
                className={`${styles.pop_up} flex-column align-items-center justify-content-around`}
                ref={noGameSelected}
            >
                <h2 className={`${styles.pop_up_message}`}>No game selected!</h2>
                <button
                    className={`btn btn-primary`}
                    onClick={() => {
                        if (isRefValid(noGameSelected)) noGameSelected.current.style.display = 'none';
                    }}
                >
                    BACK
                </button>
            </div>
            <div
                className={`${styles.pop_up} flex-column align-items-center justify-content-around`}
                ref={delete_confirmation}
            >
                <h2 className={`${styles.pop_up_message}`}>Do you want to delete the selected game(s)?</h2>
                <div className="d-flex align-items-center">
                    <button
                        className={`btn btn-primary me-4`}
                        onClick={() => {
                            if (isRefValid(delete_confirmation)) delete_confirmation.current.style.display = 'none';
                        }}
                    >
                        NO
                    </button>
                    <button
                        className={`btn btn-danger ms-4`}
                        onClick={() => {
                            deleteGame();
                            if (isRefValid(delete_confirmation)) delete_confirmation.current.style.display = 'none';
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>
            <div
                className={`${styles.pop_up} flex-column align-items-center justify-content-around`}
                ref={deactivate_confirmation}
            >
                <h2 className={`${styles.pop_up_message}`}>Do you want to deactivate the selected game(s)?</h2>
                <div className="d-flex align-items-center">
                    <button
                        className={`btn btn-primary me-4`}
                        onClick={() => {
                            if (isRefValid(deactivate_confirmation))
                                deactivate_confirmation.current.style.display = 'none';
                        }}
                    >
                        NO
                    </button>
                    <button
                        className={`btn btn-danger ms-4`}
                        onClick={() => {
                            deactivateGame();
                            if (isRefValid(deactivate_confirmation))
                                deactivate_confirmation.current.style.display = 'none';
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>
            <div
                className={`${styles.pop_up} flex-column align-items-center justify-content-around`}
                ref={activate_confirmation}
            >
                <h2 className={`${styles.pop_up_message}`}>Do you want to activate the selected game(s)?</h2>
                <div className="d-flex align-items-center">
                    <button
                        className={`btn btn-danger me-4`}
                        onClick={() => {
                            if (isRefValid(activate_confirmation)) activate_confirmation.current.style.display = 'none';
                        }}
                    >
                        NO
                    </button>
                    <button
                        className={`btn btn-primary ms-4`}
                        onClick={() => {
                            activateGame();
                            if (isRefValid(activate_confirmation)) activate_confirmation.current.style.display = 'none';
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>
            <div className={`d-flex flex-column align-items-center justify-content-center w-100`}>
                <div className={`d-flex align-items-center justify-content-center ${styles.title}`}>
                    <h2 className="d-flex align-items-center" style={{ color: '#1c60c7' }}>
                        Games
                    </h2>
                </div>
                <div className={`h-100 mt-2 d-flex align-items-center me-md-4 ${styles.searchEngine}`}>
                    <input
                        ref={search}
                        type="text"
                        className={`${styles.search}`}
                        placeholder="Find"
                        onChange={searchGame}
                    ></input>
                    <BsSearch id="scope" className={`${styles.search_icon}`} />
                </div>
            </div>
            <div className={`flex-grow-1 w-100 overflow-auto mt-3 px-md-2 hideBrowserScrollbar`}>
                <table className="table table-hover" style={{ borderCollapse: 'separate' }}>
                    <thead style={{ position: 'sticky', top: '0', backgroundColor: '#BFBFBF' }}>
                        <tr>
                            <th scope="col" className="col-1 text-center">
                                <div className={`w-100 h-100 d-flex align-items-center justify-content-center`}>
                                    <strong ref={numberTag}>#</strong>
                                    <input
                                        ref={selectAll}
                                        type="checkbox"
                                        className={`${styles.checkbox}`}
                                        onChange={selectAllCheckboxes}
                                    ></input>
                                </div>
                            </th>
                            <th scope="col" className="col-2 text-center">
                                Name
                            </th>
                            <th scope="col" className="col-2 text-center">
                                Price
                            </th>
                            <th scope="col" className="col-2 text-center">
                                Category
                            </th>
                            <th scope="col" className="col-2 text-center">
                                Ratings
                            </th>
                            <th scope="col" className="col-1 text-center">
                                Solds
                            </th>
                            <th scope="col" className="col-2 text-center">
                                Selling status
                            </th>
                        </tr>
                    </thead>
                    <tbody ref={tableBody}></tbody>
                </table>
            </div>
            <div className="w-100 d-flex flex-column flex-md-row justify-content-center align-items-center mt-3 mb-3">
                <div className="d-flex align-items-center mb-md-0 mb-2">
                    <button
                        className={`btn btn-success mx-md-3 mx-1`}
                        onClick={() => {
                            setMode(0);
                            toggleCheckboxes(0);
                        }}
                        ref={activateButton}
                    >
                        Activate game
                    </button>
                    <button
                        className={`btn btn-secondary mx-md-3 mx-1`}
                        onClick={() => {
                            setMode(1);
                            toggleCheckboxes(1);
                        }}
                        ref={deactivateButton}
                    >
                        Deactivate game
                    </button>
                </div>
                <div className="d-flex align-items-center">
                    <button
                        className={`btn btn-danger mx-md-3 mx-1`}
                        onClick={() => {
                            setMode(2);
                            toggleCheckboxes(2);
                        }}
                        ref={deleteButton}
                    >
                        Delete game
                    </button>
                    <button
                        className={`btn btn-primary mx-md-3 mx-1`}
                        onClick={() => {
                            navigate('./add');
                        }}
                        ref={addButton}
                    >
                        Add game
                    </button>
                </div>
                <div className="d-flex align-items-center">
                    <button
                        className={`btn btn-primary mx-3 ${styles.confirmation}`}
                        onClick={() => {
                            setMode(null);
                            toggleCheckboxes(null);
                        }}
                        ref={cancel}
                    >
                        Cancel
                    </button>
                    <button className={`btn btn-danger mx-3 ${styles.confirmation}`} onClick={preProcess} ref={confirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameList;
