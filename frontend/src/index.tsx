import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import 'semantic-ui-css/semantic.min.css'
import { BrowserRouter as Router, Routes ,Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

// import pages
import Home from './Home'
import FoodList from './FoodList';
import FoodAdd from './FoodAdd';
import Detail from './Detail';
import AdminWaitFoodList from './AdminWaitFoodList';

// Router
const router = 
<Router>
  <Routes>
    <Route path='/' element={ <Home /> } />
    <Route path='/foodsAdd' element={ <FoodAdd /> } />
    <Route path='/details/:url' element={ <Detail/> } />
    <Route path='/foodsList' element={ <FoodList/> } />
    <Route path='/waitFoodsList' element={ <AdminWaitFoodList/> } />
  </Routes>
</Router> 

ReactDOM.render( router,document.getElementById('root') );
reportWebVitals();
