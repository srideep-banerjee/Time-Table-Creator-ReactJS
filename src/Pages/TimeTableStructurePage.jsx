import MiniStateContainer from '../Components/MiniStateContainer'
import Menubar from '../Components/Menubar'
import "../Style/TimeTableStructure.css"
import { memo, useCallback, useEffect, useState } from 'react'
import { getTimeTableStructure, saveTimeTableStructure } from '../Script/TimeTableDataFetcher'
import "../Script/commonJS"
import OwnerFooter from '../Components/OwnerFooter'
import verifyTimeTableStructureInputs from '../Script/TimeTableStructureVerifier'

function TimeTableStructurePage() {
    return (
        <>
            <Menubar activeMenuIndex={4} />
            <div className='main-container time-table-structure'>
                <MainComponents />
                <OwnerFooter />
            </div>
        </>
    )
}

function MainComponents() {
    const [fileChange, setFileChange] = useState(false)
    return (
        <div className='top-sub-container'>
            <MiniStateContainer callBackAfterStateUpdate={() => { setFileChange(val => !val) }} />
            <TimeTableStructureInputContainer fileChange={fileChange} />
        </div>
    )
}

function TimeTableStructureInputContainer({ fileChange }) {

    const [timeTableStructureFieldValues, setTimeTableStructureFieldValues] = useState({
        breaksPerSemester: "",
        periodCount: "0",
        sectionsPerSemester: "",
        semesterCount: "0"
    })

    const updateFieldsFromObject = useCallback((obj) => {
        let fieldValues = {
            breaksPerSemester: JSON.stringify(obj.breaksPerSemester).slice(1, -1),
            periodCount: JSON.stringify(obj.periodCount),
            sectionsPerSemester: JSON.stringify(obj.sectionsPerSemester).slice(1, -1),
            semesterCount: JSON.stringify(obj.semesterCount)
        }
        setTimeTableStructureFieldValues(fieldValues)
    }, [])

    useEffect(() => {
        getTimeTableStructure(updateFieldsFromObject) // api call
    }, [fileChange])

    const inputOnChangeHandler = useCallback((event) => {
        setTimeTableStructureFieldValues(value => ({ ...value, [event.target.name]: event.target.value }))
    }, [])

    const timeTableStructureOnSubmitHandler = useCallback((event) => {
        event.preventDefault();

        let timeTableStructure = verifyTimeTableStructureInputs(timeTableStructureFieldValues)
        if (timeTableStructure) {
            saveTimeTableStructure(timeTableStructure, () => { // api call
                alert(JSON.stringify(timeTableStructure) + "----------- is saved")
            })
        }
    }, [timeTableStructureFieldValues])
    return (
        <form className='time-table-structure-inputs-container' onSubmit={timeTableStructureOnSubmitHandler}>
            <div className='top-input-container'>
                <div className="input-container">
                    <div className="input-box-heading">Number of Year</div>
                    <input
                        type='number'
                        className='input-box'
                        min={0}
                        name='semesterCount'
                        value={timeTableStructureFieldValues.semesterCount}
                        onChange={inputOnChangeHandler} />
                </div>
                <div className="input-container">
                    <div className="input-box-heading">Number of Periods per Day</div>
                    <input
                        type='number'
                        className='input-box'
                        min={0} name='periodCount'
                        value={timeTableStructureFieldValues.periodCount}
                        onChange={inputOnChangeHandler} />
                </div>
            </div>

            <div className='mid-input-container'>
                <div className="input-container">
                    <div className="input-box-heading">Number of Sections per Year</div>
                    <input
                        type='text'
                        className='input-box'
                        name='sectionsPerSemester'
                        value={timeTableStructureFieldValues.sectionsPerSemester}
                        onChange={inputOnChangeHandler} />
                </div>
            </div>
            <div className='bottom-input-container'>
                <div className="input-container">
                    <div className="input-box-heading">Break Times per Year</div>
                    <input
                        type='text'
                        className='input-box'
                        name='breaksPerSemester'
                        value={timeTableStructureFieldValues.breaksPerSemester}
                        onChange={inputOnChangeHandler} />
                </div>
            </div>
            <div className='save-btn-container'>
                <button className='time-table-structure-save-btn' type='submit'>Update</button>
            </div>
        </form>
    )
}
export default memo(TimeTableStructurePage)