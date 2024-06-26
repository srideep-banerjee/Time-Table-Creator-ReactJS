import MiniStateContainer from '../Components/MiniStateContainer'
import Menubar from '../Components/Menubar'
import Cards from '../Components/Cards'
import "../Style/Teachers.css"
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import SearchBar from '../Components/SearchBar'
import { deleteTeacher, getTeacher, getTeacherList, saveTeacher } from '../Script/TeachersDataFetcher'
import { getTimeTableStructure } from '../Script/TimeTableDataFetcher'
import { getSubjectList } from '../Script/SubjectsDataFetcher'
import "../Script/commonJS"
import { hasElement } from '../Script/util'
import TagInput from '../Components/TagInput'
import OwnerFooter from '../Components/OwnerFooter'
import Loader from '../Components/Loader'
import { verifyTeacherInputs } from '../Script/TeacherFormVerifier'

function TeachersPage() {
    return (
        <>
            <Menubar activeMenuIndex={1} />
            <div className='main-container teachers'>
                <MainComponents />
                <OwnerFooter />
            </div>
        </>
    )
}

function MainComponents() {
    const [teachersList, setTeahersList] = useState([]);
    const [teacherName, setTeacherName] = useState();
    const [displayLoader, setDisplayLoader] = useState(false);

    const teacherDeleteBtn = useRef()

    useEffect(() => {
        startUpFunction()
    }, [])
    const startUpFunction = useCallback(() => {
        getTeacherList(setTeahersList); // api call
        setTeacherName("");
        setDisplayLoader(false);
        try {
            let paramString = window.location.href.split('?')[1];
            let queryString = new URLSearchParams(paramString);
            let urlData;
            for (let pair of queryString.entries()) {
                urlData = [pair[0], pair[1].split("#")[0]];
                break;
            }
            if (urlData[0] === "click") {
                let clicked = false;
                let interval = setInterval(() => {
                    const cardsContainer = document.querySelector(".cards-container")
                    const card = cardsContainer.querySelector(".card.data[title=" + urlData[1] + "]")
                    if (!clicked) {
                        try {
                            card.click()
                            clicked = true
                        } catch (err) { }
                    } else {
                        clearInterval(interval)
                    }
                }, 500)
            }
        } catch (err) {
            console.log("%cNo Click Query Found", "color: green");
        }
    }, [])
    const teacherCardOnClickHandler = useCallback((event) => {
        setTeacherName(event.target.title);
        teacherDeleteBtn.current.style.cssText = "display: block";
    }, [])
    const addTeacherCardClickHandler = useCallback(() => {
        setTeacherName("")
        teacherDeleteBtn.current.style.cssText = "display: none;";
    }, [])
    return (
        <>
            <Loader display={displayLoader} />
            <div className='top-sub-container'>
                <div className='left-sub-container'>
                    <div className='tools-container'>
                        <MiniStateContainer callBackAfterStateUpdate={startUpFunction} />
                        <SearchBar />
                    </div>
                    <Cards
                        cardDetails={teachersList}
                        cardClassName={"teacher-card"}
                        cardClickHandler={teacherCardOnClickHandler}
                        addBtnClickHandler={addTeacherCardClickHandler}
                    />
                </div>
                <div className='right-sub-container'>
                    <DetailsContainer
                        outerTeacherName={teacherName}
                        teachersList={teachersList}
                        onSubmitCallBack={startUpFunction}

                        teacherDeleteBtnRef={teacherDeleteBtn}
                        setDisplayLoader={setDisplayLoader}
                    />
                </div>
            </div>
        </>
    )
}

function DetailsContainer({
    outerTeacherName = "",
    teachersList,
    onSubmitCallBack,

    teacherDeleteBtnRef,
    setDisplayLoader
}) {
    const [teacherName, setTeacherName] = useState("");
    const [teacherDetails, setTeacherDetails] = useState({
        freeTime: [],
        subjects: [],
    })
    const subjectList = useRef();
    useEffect(() => {
        getSubjectList(data => subjectList.current = data) // api call
    }, [])
    useEffect(() => {
        if (!outerTeacherName) {
            setTeacherName("")
            setTeacherDetails({
                freeTime: [],
                subjects: [],
            })
        } else {
            setTeacherName(outerTeacherName)
            getTeacher(outerTeacherName, setTeacherDetails); // api call
        }
    }, [outerTeacherName])
    const modifyTheValueOfInputBox = useCallback((time, isSelected) => {
        let newDetails = { ...teacherDetails };
        time = JSON.parse(time)
        if (isSelected) {
            let found = -1;
            for (let index = 0; index < newDetails.freeTime.length; index++) {
                if (newDetails.freeTime[index][0] === time[0] && newDetails.freeTime[index][1] === time[1]) {
                    found = index;
                    break
                }
            }
            newDetails.freeTime.splice(found, 1);
        } else {
            newDetails.freeTime.push(time)
        }
        setTeacherDetails(newDetails)
    }, [teacherDetails])
    const inputOnChangeHandler = useCallback((event) => {
        if (event.target.name === 'teacherName') setTeacherName(event.target.value.toUpperCase())
        else setTeacherDetails(value => ({ ...value, [event.target.name]: event.target.value }))
    }, [])
    const checkIfAlreadyExist = useCallback((teacher) => {
        if (hasElement(teachersList, teacher)) teacherDeleteBtnRef.current.style.cssText = "display: block;"; // if teacher exist show delete btn
        else teacherDeleteBtnRef.current.style.cssText = "display: none;"; // if not teacher exist show delete btn
    }, [teachersList])
    const teacherFormSubmitHandler = useCallback((event) => {
        event.preventDefault();
        //verification of inputs
        let verifiedData = verifyTeacherInputs(teacherName, teacherDetails, subjectList)
        if (verifiedData)
            if (hasElement(teachersList, verifiedData.newTeacherName)) { // checking if the teacher exsist or not
                if (window.confirm("Are you want to overwrite " + teacherName)) // if exist show a confirmation box
                    saveData(verifiedData.newTeacherName, verifiedData.teacherData); // if yes then save else do nothing
            } else saveData(verifiedData.newTeacherName, verifiedData.teacherData);
    }, [teacherName, teacherDetails, teachersList])
    const saveData = useCallback((teacherName, teacherData) => {
        setDisplayLoader(true)
        let data = new Map();
        data[teacherName] = teacherData;
        saveTeacher(data, () => { // api call
            alert(JSON.stringify(data) + "---------- is added")
            onSubmitCallBack(); // referenced to start up function

            // reseting form fields
            setTeacherName("");
            setTeacherDetails({
                freeTime: [],
                subjects: [],
            })
        }, () => {
            setDisplayLoader(false)
        })
    }, [])
    const deleteTeacherBtnClickHandler = useCallback((event) => {
        event.preventDefault();
        if (hasElement(teachersList, teacherName)) // checking if the teacher exsist or not
            if (window.confirm("Are you sure? Want to Delete " + teacherName + " ?")) { // if exist show a confirmation box
                deleteTeacher(teacherName, () => { // api call
                    onSubmitCallBack();  // referenced to start up function
                    teacherDeleteBtnRef.current.style.cssText = "display: none;"; // hide delete btn
                }, () => {
                    setDisplayLoader(false) // if failed only hide loader
                });
            }
    }, [teacherName])
    return (
        <form className='details-container' onSubmit={teacherFormSubmitHandler}>
            <div className='inputs-container-heading'>Details</div>
            <div className="input-container">
                <div className="input-box-heading">Teacher Name</div>
                <input
                    type="text"
                    className="input-box"
                    name='teacherName'
                    value={teacherName}
                    placeholder='Ex. ABC'
                    onChange={event => {
                        checkIfAlreadyExist(event.target.value.trim().toUpperCase())
                        inputOnChangeHandler(event)
                    }}></input>
            </div>
            <div className="input-container">
                <div className="input-box-heading">Subject Names</div>
                {subjectList.current && <TagInput
                    tagList={subjectList.current}
                    inputName={'subjects'}
                    details={teacherDetails}
                    updateWithNewValues={(data) => {
                        let newTeacherDetails = { ...teacherDetails }
                        newTeacherDetails.subjects = data;
                        setTeacherDetails(newTeacherDetails)
                    }}
                />}
            </div>
            <div className='input-container'>
                <div>Available Times</div>
                <TimeSelector
                    modifyTheValueOfInputBox={modifyTheValueOfInputBox}
                    teacherDetails={teacherDetails} />
            </div>
            <div className='save-btn-container'>
                <button className='teacher-save-btn' type='submit'>Save</button>
                <button className='teacher-delete-btn' onClick={deleteTeacherBtnClickHandler} ref={teacherDeleteBtnRef}>Delete</button>
            </div>
        </form>
    )
}

const TimeSelector = memo(({ modifyTheValueOfInputBox, teacherDetails }) => {
    const [periodCount, setPeriodCount] = useState(8);
    useEffect(() => {
        getTimeTableStructure((timeTableStructure) => { setPeriodCount(timeTableStructure.periodCount) }); // api call
    }, [])
    let noOfDays = 5;
    let timeTable = [];
    let newTeacherDetailsFreeTime = teacherDetails.freeTime
    for (let day = 0; day < noOfDays; day++) {
        let teacherDetailsFreeTimeOfThatDay = [];
        for (let index = 0; index < newTeacherDetailsFreeTime.length; index++) {
            if (newTeacherDetailsFreeTime[index][0] === (day + 1))
                teacherDetailsFreeTimeOfThatDay.push(newTeacherDetailsFreeTime[index][1])
        }
        timeTable.push(
            <Periods
                noOfPeriods={periodCount}
                day={day}
                modifyTheValueOfInputBox={modifyTheValueOfInputBox}
                key={day}
                teacherDetailsFreeTimeOfThatDay={teacherDetailsFreeTimeOfThatDay}
            ></Periods>
        )
    }
    return (
        <div className='time-selector'>
            <div className='time-table-container'>
                {timeTable}
            </div>
        </div>
    )
})

const Periods = memo(({ noOfPeriods, day, modifyTheValueOfInputBox, teacherDetailsFreeTimeOfThatDay }) => {
    let periods = []
    for (let period = 0; period < noOfPeriods; period++) {
        let selectClass = "";
        if (hasElement(teacherDetailsFreeTimeOfThatDay, (period + 1))) {
            selectClass = "selected";
        }
        periods.push(
            <div
                key={period}
                className={'period ' + selectClass}
                onClick={event => periodClickHandler(event, period)}>
                {period + 1}
            </div>
        )
    }
    const periodClickHandler = useCallback((event, period) => {
        let isSelected = hasElement(event.target.classList, "selected");
        modifyTheValueOfInputBox(`[${day + 1},${[period + 1]}]`, isSelected);
    }, [modifyTheValueOfInputBox])

    return (
        <div className='periods-container' >
            {periods}
        </div>
    )
})

export default memo(TeachersPage)