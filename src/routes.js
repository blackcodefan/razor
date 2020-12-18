import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Pins = React.lazy(() => import('./views/User/Pins'));
const AddPin = React.lazy(() => import('./views/User/Add'));
const Dashboard = React.lazy(() => import('./views/Dashboard'));
const AddUser = React.lazy(() => import('./views/Admin/Add'));
const Requests = React.lazy(() => import('./views/Admin/Requests'));

const routes = [
  { path: '/', name: 'Home', component: DefaultLayout, exact: true },
  { path: '/dash', name: 'Dashboard', component: Dashboard},
  { path: '/user', name: 'Add User', component: AddUser, exact: true },
  { path: '/requests', name: 'Requests', component: Requests, exact: true},
  { path: '/add', name: 'Add Pin', component: AddPin, exact: true },
  { path: '/pins', name: 'Pins', component: Pins, exact: true },
];

export default routes;
