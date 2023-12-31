import styles from './Home.module.css';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import '../../General/css/scroll.css';

import { useEffect, useRef, useState } from 'react';
import { domain } from '../../General/tools/domain';
import { isRefValid, isRefNotValid } from '../../General/tools/refChecker';
import { CiDiscount1 } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';

const Game = (props) => {
    const [status, setStatus] = useState('N/A');
    const [lastest, setLastest] = useState('N/A');

    useEffect(() => {
        const formData = new FormData();
        formData.append('id', props.id);
        axios
            .post(`http://${domain}/admin/game/status`, formData)
            .then((res) => {
                if (res.data) setStatus('Available');
                else setStatus('Out of stock');
            })
            .catch((err) => console.log(err));

        axios
            .post(`http://${domain}/admin/latestTransaction`, formData)
            .then((res) => {
                setLastest(res.data.date);
            })
            .catch((err) => console.log(err));
    }, [props.id]);

    return (
        <tr className={`${styles.rows}`} onClick={() => props.Navigate(`/admin/game-list/${props.id}`)}>
            <td className="text-center">{props.i}</td>
            <td>{props.name}</td>
            <td className="d-flex align-items-center justify-content-center">
                {!props.price && 'N/A'}
                {props.price && '$'}
                {props.discount === '0' && props.price}
                {props.discount !== '0' &&
                    props.discount !== null &&
                    (((parseFloat(props.price) + 0.01) * (100 - parseFloat(props.discount))) / 100).toFixed(2) - 0.01}
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
                    <p style={{ color: 'red', marginBottom: '0' }}>{props.discount}%</p>
                )}
            </td>
            <td className="text-center">{props.solds} units</td>
            <td className="text-center" style={{ color: status === 'Available' ? 'green' : 'red' }}>
                {status}
            </td>
            <td className="text-center">{lastest}</td>
        </tr>
    );
};

function AdminHome() {
    document.title = 'Home';

    const day = useRef(null);
    const week = useRef(null);
    const month = useRef(null);
    const year = useRef(null);

    const targetDay = useRef(null);
    const targetWeek = useRef(null);
    const targetMonth = useRef(null);
    const targetYear = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (isRefNotValid(targetDay) && isRefValid(day)) targetDay.current = ReactDOM.createRoot(day.current);
        if (isRefNotValid(targetMonth) && isRefValid(month)) targetMonth.current = ReactDOM.createRoot(month.current);
        if (isRefNotValid(targetWeek) && isRefValid(week)) targetWeek.current = ReactDOM.createRoot(week.current);
        if (isRefNotValid(targetYear) && isRefValid(year)) targetYear.current = ReactDOM.createRoot(year.current);

        axios
            .get(`http://${domain}/admin/getDailySolds`)
            .then((res) => {
                const temp = [];
                for (let i = 0; i < res.data.length; i++)
                    temp.push(
                        <Game
                            Navigate={navigate}
                            i={i + 1}
                            id={res.data[i].id}
                            solds={res.data[i].solds}
                            name={res.data[i].name}
                            price={res.data[i].price}
                            discount={res.data[i].discount}
                            key={i}
                        />,
                    );
                if (isRefValid(targetDay)) targetDay.current.render(<>{temp}</>);
            })
            .catch((err) => console.log(err));

        axios
            .get(`http://${domain}/admin/getWeeklySolds`)
            .then((res) => {
                const temp = [];
                for (let i = 0; i < res.data.length; i++)
                    temp.push(
                        <Game
                            Navigate={navigate}
                            i={i + 1}
                            id={res.data[i].id}
                            solds={res.data[i].solds}
                            name={res.data[i].name}
                            price={res.data[i].price}
                            discount={res.data[i].discount}
                            key={i}
                        />,
                    );
                if (isRefValid(targetWeek)) targetWeek.current.render(<>{temp}</>);
            })
            .catch((err) => console.log(err));

        axios
            .get(`http://${domain}/admin/getMonthlySolds`)
            .then((res) => {
                const temp = [];
                for (let i = 0; i < res.data.length; i++)
                    temp.push(
                        <Game
                            Navigate={navigate}
                            i={i + 1}
                            id={res.data[i].id}
                            solds={res.data[i].solds}
                            name={res.data[i].name}
                            price={res.data[i].price}
                            discount={res.data[i].discount}
                            key={i}
                        />,
                    );
                if (isRefValid(targetMonth)) targetMonth.current.render(<>{temp}</>);
            })
            .catch((err) => console.log(err));

        axios
            .get(`http://${domain}/admin/getAnnuallySolds`)
            .then((res) => {
                const temp = [];
                for (let i = 0; i < res.data.length; i++)
                    temp.push(
                        <Game
                            Navigate={navigate}
                            i={i + 1}
                            id={res.data[i].id}
                            solds={res.data[i].solds}
                            name={res.data[i].name}
                            price={res.data[i].price}
                            discount={res.data[i].discount}
                            key={i}
                        />,
                    );
                if (isRefValid(targetYear)) targetYear.current.render(<>{temp}</>);
            })
            .catch((err) => console.log(err));
    }, [navigate]);

    return (
        <div className="w-100 h-100 d-flex flex-column">
            <div className="w-100 d-flex align-items-center justify-content-center">
                <div className={`d-flex align-items-center justify-content-center ${styles.title}`}>
                    <h2 className="d-flex align-items-center" style={{ color: '#1c60c7' }}>
                        Home
                    </h2>
                </div>
            </div>
            <div className={`flex-grow-1 w-100 mt-3 overflow-auto container-fluid`}>
                <h4 className="ms-4">Solds of day</h4>
                <div className="overflow-auto hideBrowserScrollbar" style={{ minHeight: '180px' }}>
                    <table className="table table-hover" style={{ borderCollapse: 'separate' }}>
                        <thead style={{ position: 'sticky', top: '0', backgroundColor: '#BFBFBF' }}>
                            <tr>
                                <th scope="col" className="col-1 text-center">
                                    #
                                </th>
                                <th scope="col" className="col-3 text-center">
                                    Game
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Price
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Total solds
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Sell status
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Latest transaction
                                </th>
                            </tr>
                        </thead>
                        <tbody ref={day}></tbody>
                    </table>
                </div>
                <h4 className="ms-4 mt-3">Solds of week</h4>
                <div className="overflow-auto hideBrowserScrollbar" style={{ minHeight: '180px' }}>
                    <table className="table table-hover" style={{ borderCollapse: 'separate' }}>
                        <thead style={{ position: 'sticky', top: '0', backgroundColor: '#BFBFBF' }}>
                            <tr>
                                <th scope="col" className="col-1 text-center">
                                    #
                                </th>
                                <th scope="col" className="col-3 text-center">
                                    Game
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Price
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Total solds
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Sell status
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Latest transaction
                                </th>
                            </tr>
                        </thead>
                        <tbody ref={week}></tbody>
                    </table>
                </div>
                <h4 className="ms-4 mt-3">Solds of month</h4>
                <div className="overflow-auto hideBrowserScrollbar" style={{ minHeight: '180px' }}>
                    <table className="table table-hover" style={{ borderCollapse: 'separate' }}>
                        <thead style={{ position: 'sticky', top: '0', backgroundColor: '#BFBFBF' }}>
                            <tr>
                                <th scope="col" className="col-1 text-center">
                                    #
                                </th>
                                <th scope="col" className="col-3 text-center">
                                    Game
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Price
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Total solds
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Sell status
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Latest transaction
                                </th>
                            </tr>
                        </thead>
                        <tbody ref={month}></tbody>
                    </table>
                </div>
                <h4 className="ms-4 mt-3">Solds of year</h4>
                <div className="overflow-auto hideBrowserScrollbar" style={{ minHeight: '180px' }}>
                    <table className="table table-hover" style={{ borderCollapse: 'separate' }}>
                        <thead style={{ position: 'sticky', top: '0', backgroundColor: '#BFBFBF' }}>
                            <tr>
                                <th scope="col" className="col-1 text-center">
                                    #
                                </th>
                                <th scope="col" className="col-3 text-center">
                                    Game
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Price
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Total solds
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Sell status
                                </th>
                                <th scope="col" className="col-2 text-center">
                                    Latest transaction
                                </th>
                            </tr>
                        </thead>
                        <tbody ref={year}></tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminHome;
