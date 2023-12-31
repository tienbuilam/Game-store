import { BsSearch } from 'react-icons/bs';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styles from './CustomerList.module.css';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { domain } from '../../../General/tools/domain';
import { isRefValid, isRefNotValid } from '../../../General/tools/refChecker';
import '../../../General/css/scroll.css';

const Customer = (props) => {
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
            <td className="col-3 text-center">{props.name}</td>
            <td className="col-3 text-center">{props.email}</td>
            <td className="col-3 text-center">{props.phone}</td>
            <td className="col-2 text-center">${props.spending}</td>
        </tr>
    );
};

function CustomerList() {
    const [renderTrigger, setRenderTrigger] = useState(true);

    const cancel = useRef(null);
    const deleteButton = useRef(null);
    const confirm = useRef(null);
    const search = useRef(null);

    const tableBody = useRef(null);
    const target = useRef(null);
    const numberTag = useRef(null);
    const selectAll = useRef(null);
    const checkboxes = useRef([]);
    const numbers = useRef([]);

    const noCustomerSelected = useRef(null);
    const confirmation = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Customer list';

        if (isRefNotValid(target) && isRefValid(tableBody)) target.current = ReactDOM.createRoot(tableBody.current);

        axios
            .get(`http://${domain}/admin/customer/getList`)
            .then((res) => {
                checkboxes.current = [];
                numbers.current = [];

                const temp = [];
                for (let i = 0; i < res.data.length; i++)
                    temp.push(
                        <Customer
                            Navigate={navigate}
                            refCheckboxes={checkboxes}
                            refNumbers={numbers}
                            key={i}
                            i={i}
                            name={res.data[i].name}
                            email={res.data[i].email}
                            phone={res.data[i].phone}
                            spending={res.data[i].total_spending}
                            id={res.data[i].id}
                        />,
                    );
                if (isRefValid(target)) target.current.render(<>{temp}</>);
            })
            .catch((error) => console.log(error));
    }, [renderTrigger, navigate]);

    let timerId;
    const searchCustomer = () => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            const formData = new FormData();
            formData.append('data', isRefValid(search) ? search.current.value : '');
            axios
                .post(`http://${domain}/admin/customer/find`, formData)
                .then((res) => {
                    checkboxes.current = [];
                    numbers.current = [];

                    const temp = [];
                    for (let i = 0; i < res.data.length; i++)
                        temp.push(
                            <Customer
                                Navigate={navigate}
                                key={i}
                                i={i}
                                refNumbers={numbers}
                                refCheckboxes={checkboxes}
                                name={res.data[i].name}
                                email={res.data[i].email}
                                phone={res.data[i].phone}
                                spending={res.data[i].total_spending}
                                id={res.data[i].id}
                            />,
                        );
                    if (isRefValid(target)) target.current.render(<>{temp}</>);
                })
                .catch((error) => console.log(error));
        }, 500);
    };

    const toggleDelete = () => {
        if (isRefValid(cancel)) {
            if (cancel.current.style.display === '' || cancel.current.style.display === 'none') {
                cancel.current.style.setProperty('display', 'block', 'important');
                if (isRefValid(confirm)) confirm.current.style.setProperty('display', 'block', 'important');
                if (isRefValid(deleteButton)) deleteButton.current.style.display = 'none';
                if (isRefValid(selectAll)) selectAll.current.style.display = 'block';
                if (isRefValid(numberTag)) numberTag.current.style.display = 'none';
                for (let i = 0; i < checkboxes.current.length; i++) {
                    if (isRefValid(checkboxes, i)) checkboxes.current[i].style.display = 'block';
                    if (isRefValid(numbers, i)) numbers.current[i].style.display = 'none';
                }
            } else {
                cancel.current.style.setProperty('display', 'none');
                if (isRefValid(confirm)) confirm.current.style.setProperty('display', 'none');
                if (isRefValid(deleteButton)) deleteButton.current.style.display = 'block';
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
            if (isRefValid(noCustomerSelected)) noCustomerSelected.current.style.display = 'flex';
        } else {
            if (isRefValid(confirmation)) confirmation.current.style.display = 'flex';
        }
    };

    const deleteCustomer = () => {
        const temp = [];
        for (let i = 0; i < checkboxes.current.length; i++)
            if (isRefValid(checkboxes, i) && checkboxes.current[i].checked === true)
                temp.push(checkboxes.current[i].value);

        const formData = new FormData();
        formData.append('IDs', temp);
        axios
            .post(`http://${domain}/admin/customer/delete`, formData)
            .then((res) => {
                toggleDelete();
                setRenderTrigger(!renderTrigger);
            })
            .catch((error) => console.log(error));
    };

    const selectAllCheckboxes = () => {
        for (let i = 0; i < checkboxes.current.length; i++)
            if (isRefValid(checkboxes, i)) checkboxes.current[i].checked = selectAll.current.checked;
    };

    return (
        <div className="w-100 h-100 d-flex flex-column">
            <div
                className={`${styles.pop_up} flex-column align-items-center justify-content-around`}
                ref={noCustomerSelected}
            >
                <h2 className={`${styles.pop_up_message}`}>No customer selected!</h2>
                <button
                    className={`btn btn-primary`}
                    onClick={() => {
                        if (isRefValid(noCustomerSelected)) noCustomerSelected.current.style.display = 'none';
                    }}
                >
                    BACK
                </button>
            </div>
            <div
                className={`${styles.pop_up} flex-column align-items-center justify-content-around`}
                ref={confirmation}
            >
                <h2 className={`${styles.pop_up_message}`}>Do you want to delete the selected customer(s)?</h2>
                <div className="d-flex align-items-center">
                    <button
                        className={`btn btn-primary me-4`}
                        onClick={() => {
                            if (isRefValid(confirmation)) confirmation.current.style.display = 'none';
                        }}
                    >
                        NO
                    </button>
                    <button
                        className={`btn btn-danger ms-4`}
                        onClick={() => {
                            deleteCustomer();
                            if (isRefValid(confirmation)) confirmation.current.style.display = 'none';
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>
            <div className={`d-flex flex-column align-items-center justify-content-center w-100`}>
                <div className={`d-flex justify-content-center ${styles.title}`}>
                    <h2 style={{ color: '#1c60c7' }}>Customers</h2>
                </div>
                <div className={`mt-2 d-flex align-items-center me-md-4 ${styles.searchEngine}`}>
                    <input
                        ref={search}
                        type="text"
                        className={`${styles.search}`}
                        placeholder="Find"
                        onChange={searchCustomer}
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
                            <th scope="col" className="col-3 text-center">
                                Customer
                            </th>
                            <th scope="col" className="col-3 text-center">
                                Email
                            </th>
                            <th scope="col" className="col-3 text-center">
                                Phone number
                            </th>
                            <th scope="col" className="col-2 text-center">
                                Total spending
                            </th>
                        </tr>
                    </thead>
                    <tbody ref={tableBody}></tbody>
                </table>
            </div>
            <div className="w-100 d-flex justify-content-center align-items-center mb-3 mt-3">
                <button className={`${styles.delete} btn btn-danger mx-3`} onClick={toggleDelete} ref={deleteButton}>
                    Delete customer
                </button>
                <button className={`${styles.cancel} btn btn-primary mx-3`} onClick={toggleDelete} ref={cancel}>
                    Cancel
                </button>
                <button
                    className={`${styles.delete} btn btn-danger mx-3`}
                    value="Confirm"
                    onClick={preProcess}
                    ref={confirm}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}

export default CustomerList;
