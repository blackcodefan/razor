import React, { useContext} from 'react';
import {
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap';
import {UserContext} from "../../providers/UserProvider";


const Dashboard = props => {

    const user = useContext(UserContext);

    if(user.type === "1"){
        props.history.replace('/user');
    }else{
        props.history.replace('/add')
    }

    return (
      <div className="animated fadeIn">

        <Row>
          <Col md={3}/>
          <Col md={6} className="text-center">
            <Card>
              <CardBody>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );

};

export default Dashboard;
