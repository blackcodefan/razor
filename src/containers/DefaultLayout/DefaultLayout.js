import React, {Suspense, useContext} from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import {logout} from '../../firebase/index';

import {
  AppAside,
  AppBreadcrumb,
  AppFooter,
  AppHeader,
} from '@coreui/react';


import routes from '../../routes';
import {UserContext} from "../../providers/UserProvider";
import AppSidebar from "@coreui/react/es/Sidebar";
import AppSidebarHeader from "@coreui/react/es/SidebarHeader";
import AppSidebarNav from "@coreui/react/es/SidebarNav";
import AppSidebarFooter from "@coreui/react/es/SidebarFooter";
import AppSidebarMinimizer from "@coreui/react/es/SidebarMinimizer";
import {adminNav, userNav} from '../../_nav';
const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const DefaultLayout = (props) => {

    const user = useContext(UserContext);

    const loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"/></div>;

    const signOut = async (e) => {
        await logout(e);
        props.history.replace('/');
    };

    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={loading()}>
            <DefaultHeader onLogout={(event) => signOut(event)}/>
          </Suspense>
        </AppHeader>
        <div className="app-body">
            <AppSidebar fixed display="lg">
                <AppSidebarHeader />
                <Suspense>
                    <AppSidebarNav navConfig={user.type === "1"?adminNav:userNav} {...props} />
                </Suspense>
                <AppSidebarFooter />
                <AppSidebarMinimizer />
            </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes}/>
            <Container fluid>
              <Suspense fallback={loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        render={props => (
                          <route.component {...props} />
                        )} />
                    ) : (null);
                  })}
                  <Redirect from="/" to="/dash" />
                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <Suspense fallback={loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter>
      </div>
    );

};


export default DefaultLayout;
