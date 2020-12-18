import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from "../../../providers/UserProvider";
import {database} from "../../../firebase";
import {Formik} from "formik";
import {
    Form,
    FormGroup,
    Input,
    Button,
    Card,
    CardHeader,
    CardBody,
    Col,
    Row,
    Badge,

} from 'reactstrap';

const Pins = props => {

    const user = useContext(UserContext);

    const [pinData, setPinData] = useState([]);
    const [searchKey, setSearchKey] = useState({
        startDate: null,
        endDate: null,
        serial: null,
        status: null
    });

    useEffect(() => {
        const unsubscribe = database.collection('pins')
            .where('userId', '==', user.id)
            .onSnapshot(onPinCollectionUpdate);
        return () => unsubscribe();
    }, [searchKey]);

    const dateFilter =(date) =>{
        if (!searchKey.startDate || !searchKey.endDate) return true;
        let d = new Date(parseInt(date));
        let startDate = new Date(searchKey.startDate);
        let endDate = new Date(searchKey.endDate);

        return startDate <= d && d <= endDate;
    };

    const onPinCollectionUpdate = snapshot => {
        let pinData = [];

        snapshot.forEach(
            doc => {
                let data = doc.data();
                if(dateFilter(data.pinId)
                    && (!searchKey.serial || searchKey.serial === data.serial)
                    && (!searchKey.status || searchKey.status === data.stat))
                    pinData.unshift(data)
            }
        );
        setPinData(pinData);
    };

    const PinCard = props => {
        return <Card className="text-center">
            <CardBody>
                <Row>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="text-info">Name:</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="form-control-static">{props.pin.userName}</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="text-info">Serial:</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="form-control-static">{props.pin.serial}</span>
                    </Col>
                </Row>
                <Row>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="text-info">Pin:</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="form-control-static">{props.pin.pin}</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="text-info">Value:</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="form-control-static">{props.pin.value}</span>
                    </Col>
                </Row>
                <Row>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="text-info">Date:</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="form-control-static">{props.pin.date}</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="text-info">Status:</span>
                    </Col>
                    <Col lg={3} sm={6} xs={6}>
                        <span className="form-control-static">
                            <Badge color={props.pin.stat === '0'
                                ?"secondary"
                                :props.pin.stat === "1"
                                    ?"success":"danger"}>
                                {props.pin.stat === '0'
                                    ?"Pending"
                                    :props.pin.stat === "1"
                                        ?"Approved":"Rejected"}</Badge>
                        </span>
                    </Col>
                </Row>
            </CardBody>
        </Card>;
    };

    const onSubmit = async (values, { setSubmitting, setErrors })  =>{
        setSearchKey(values);
        setSubmitting(false);
    };

    const sum = () =>{
        let totalApproved = 0;
        for(let i = 0; i < pinData.length; i++){
            if(pinData[i].stat === "1")
                totalApproved += parseInt(pinData[i].value);
        }
        return totalApproved;
    };

    return (
      <div className="animated fadeIn">
          <Row>
              <Col md={2}/>
              <Col md={8} className="text-center">
                  <Card>
                      <CardHeader>
                          <strong>Accepted pin Sum: {sum()}</strong>
                      </CardHeader>
                      <CardBody>
                          <hr />
                          <Formik
                              onSubmit={onSubmit}
                              render={
                                  ({
                                       values,
                                       errors,
                                       touched,
                                       status,
                                       dirty,
                                       handleChange,
                                       handleBlur,
                                       handleSubmit,
                                       isSubmitting
                                   }) => (
                                      <Row>
                                          <Col lg={4} md={4}>
                                              <Form onSubmit={handleSubmit} noValidate name='simpleForm'>
                                                  <FormGroup>
                                                      <Input type="text"
                                                             name="serial"
                                                             id="serial"
                                                             placeholder="Serial Number"
                                                             autoComplete="serial"
                                                             required
                                                             onChange={handleChange}
                                                      />
                                                  </FormGroup>
                                                  <FormGroup>
                                                      <Input type="select"
                                                             name="status"
                                                             id="status"
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                      >
                                                          <option value="">Select Status</option>
                                                          <option value="0">Pending</option>
                                                          <option value="1">Approved</option>
                                                          <option value="2">Rejected</option>
                                                      </Input>
                                                  </FormGroup>
                                                  <p style={{textAlign:'left'}}>
                                                      From:
                                                  </p>
                                                  <FormGroup>
                                                      <Input type="date"
                                                             id="startDate"
                                                             name="startDate"
                                                             placeholder="startDate"
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                      />
                                                  </FormGroup>
                                                  <p style={{textAlign:'left'}}>
                                                      To:
                                                  </p>
                                                  <FormGroup>
                                                      <Input type="date"
                                                             id="endDate"
                                                             name="endDate"
                                                             placeholder="endDate"
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                      />
                                                  </FormGroup>
                                                  <FormGroup>
                                                      <Button type="submit" color="primary" className="mr-1" disabled={isSubmitting}>{isSubmitting ? 'Wait...' : 'Search'}</Button>
                                                  </FormGroup>
                                              </Form>
                                          </Col>
                                          <Col lg={8} md={8} style={{maxHeight: 700, overflowY:"scroll"}}>
                                              {
                                                  pinData !== null &&
                                                      pinData.map((pin, pinIndex) => (
                                                          <PinCard  key={pinIndex} pin={pin}/>
                                                      ))
                                              }
                                          </Col>
                                      </Row>
                                  )} />
                      </CardBody>
                  </Card>
              </Col>
          </Row>
      </div>
    );

};

export default Pins;
