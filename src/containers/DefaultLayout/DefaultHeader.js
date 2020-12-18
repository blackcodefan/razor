import React, { Component } from 'react';
import {Button} from 'reactstrap';
import PropTypes from 'prop-types';
import {  AppSidebarToggler } from '@coreui/react';
import './style.css'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  render() {

    return (
      <React.Fragment>
          <div style={{
              backgroundColor:'#5172FE',
              color:'white',
              fontSize:'26px',
              width:'200px',
              height: '55px',
              verticalAlign:'middle',
              fontWeight:'bold',
              paddingTop: '5px'}}
               className="text-center custom-brand">EZ-Razor</div>
          <AppSidebarToggler className="d-lg-none" display="md" mobile />
          <Button className="btn-youtube btn-brand"
                  onClick={this.props.onLogout}><i className="fa fa-lock"/><span>Logout</span></Button>
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
