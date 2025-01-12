import { ToastContainer, toast } from 'react-toastify';
import {Routes, Route,BrowserRouter as Router} from 'react-router-dom'
import DefaultLayout from './layout/user/defaultLayout/defaultLayout'
import { publicRoutes, adminRoutes } from './router/index';
import AdminLayout from './layout/admin/Layout'
import SuccessPayment from './pages/public/SuccessPayment';
function App() {
  // let checkAdmin = window.location.pathname.startsWith("/admin")
  // let checkEmployee = window.location.pathname.startsWith("/employee")
  return (
    <Router>
      <div className="App">
          <Routes>
            {publicRoutes.map((route, index) => {
              const Layout = route.layout || DefaultLayout
              const Page = route.component
              return <Route key={index} path={route.path} element={
                <Layout>
                  <Page/>
                </Layout>
              }/>
            })}
    <Route path="/success-payment" element={<SuccessPayment />} />

            {adminRoutes.map((route, index) => {
              const Layout = route.layout || AdminLayout
              const Page = route.component
              return <Route key={index} path={route.path} element={
                <Layout>
                  <Page/>
                </Layout>
              }/>
            })}

          </Routes>
      </div>
      <ToastContainer/>
    </Router>

);

}

export default App;
