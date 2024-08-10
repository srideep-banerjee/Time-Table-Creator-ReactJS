import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './Pages/DashboardPage.tsx'
import SubjectsPage from './Pages/SubjectsPage.tsx';
import TeachersPage from './Pages/TeachersPage.tsx';
import TimeTablesPage from './Pages/TimeTablesPage.tsx';
import TimeTableStructurePage from './Pages/TimeTableStructurePage.tsx';
import FilesPage from './Pages/FilesPage.tsx';
import "./Style/BasicComponents.css"
import ContactUs from './Pages/ContactUs.tsx';
import { useEffect, useRef } from 'react';

function App() {
	const app = useRef<HTMLDivElement | null>(null)

	function autoToggleInResize() {
		if(window.innerWidth <= 1250) {
			if(app.current)
				app.current.classList.add("active");
		} else {
			if(app.current)
				app.current.classList.remove("active");
		}
	}
	useEffect(() => {
		autoToggleInResize();
		window.onresize = () => {
			autoToggleInResize()
		}
	}, [])
	return (
		<BrowserRouter>
			<div className='app' ref={app}>
				<Routes>
					<Route path="/" element={<DashboardPage />} />
					<Route path="/Subjects" element={<SubjectsPage />} />
					<Route path="/Teachers" element={<TeachersPage />} />
					<Route path="/TimeTables" element={<TimeTablesPage />} />
					<Route path="/TimeTableStructure" element={<TimeTableStructurePage />} />
					<Route path="/Files" element={<FilesPage />} />
					<Route path="/ContactUs" element={<ContactUs />} />
				</Routes>
			</div>
		</BrowserRouter>
	)
}

// Remote typescript branch tracking test 2
export default App