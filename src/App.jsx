import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './Pages/DashboardPage'
import SubjectsPage from './Pages/SubjectsPage';
import TeachersPage from './Pages/TeachersPage';
import TimeTablesPage from './Pages/TimeTablesPage';
import TimeTableStructurePage from './Pages/TimeTableStructurePage';
import FilesPage from './Pages/FilesPage';
import "./Style/BasicComponents.css"
import ContactUs from './Pages/ContactUs';

function App() {
	return (
		<BrowserRouter>
			<div className='app'>
				<Routes>
					<Route path="/" exact element={<DashboardPage />} />
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

export default App