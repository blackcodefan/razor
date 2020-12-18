import React, {useEffect, useState} from 'react';
import {Formik} from "formik";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Col,
    Row,
    Form,
    FormGroup,
    Input,
    Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';
import {database} from "../../../firebase";
import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const Requests = (props) => {

    const [selectedPin, selectPin] = useState(null);
    const [userData, setUserData] = useState(null);
    const [pinData, setPinData] = useState([]);
    const [searchKey, setSearchKey] = useState({
        user: null,
        startDate: null,
        endDate: null,
        serial: null,
        status: null
    });

    const [modal, setModal] = useState(false);
    const [decrease, setDecreaseModal] = useState(false);

    useEffect(() => {
        const unsubscribe = database.collection('users').onSnapshot(onUserCollectionUpdate);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = database.collection('pins')
            .onSnapshot(onPinCollectionUpdate);
        return () => unsubscribe();
    }, [searchKey]);

    const onUserCollectionUpdate = snapshot => {
        let userData = [];
        snapshot.forEach(doc => userData.push(doc.data()));
        setUserData(userData);
    };

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
                if((!searchKey.user || searchKey.user === data.userId)
                    && dateFilter(data.pinId)
                    &&(!searchKey.status || searchKey.status === data.stat)
                    && (!searchKey.serial || searchKey.serial === data.serial))
                pinData.unshift(doc.data())
            }
        );
        setPinData(pinData);
    };

    const onSubmit = async (values, { setSubmitting })  =>{
        setSearchKey(values);
        setSubmitting(false);
    };

    const toggleModal = () => setModal(!modal);
    const toggleDecrease = () => setDecreaseModal(!decrease);

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
                            <Button className="btn-sm" color={props.pin.stat === '0'
                                ?"secondary"
                                :props.pin.stat === "1"
                                    ?"success":"danger"} onClick={() => {selectPin(props.pin); setModal(true);}}>
                                {props.pin.stat === '0'
                                    ?"Pending"
                                    :props.pin.stat === "1"
                                        ?"Approved":"Rejected"}</Button>
                        </span>
                    </Col>
                </Row>
            </CardBody>
        </Card>;
    };

    const updatePin = async (status) =>{
        toggleModal();
        const pinRef = database.doc(`pins/${selectedPin.pinId}`);
        await pinRef.update({
            "stat": status
        });
        if(status === '1'){
            const userRef = database.doc(`users/${selectedPin.userId}`);
            let doc = (await userRef.get()).data();
            let value = doc.value?doc.value:0;

            if(typeof value === 'string')
                value = parseFloat(value);

            await userRef.update({
                "value": (value + parseFloat(selectedPin.value)).toFixed(1)
            });
        }

    };

    const decreaseValue = async  () =>{
        toggleDecrease();
        let decrement = parseFloat(document.getElementById('dec').value);
        if(decrement < 0) {alert('Please input valid value');return}

        const userRef = database.doc(`users/${searchKey.user}`);
        let doc = (await userRef.get()).data();
        let value = doc.value?doc.value:0;

        if(typeof value === 'string')
            value = parseFloat(value);

        if(value < decrement){alert('You can not process!');return}

        await userRef.update({
            "value": (value - decrement).toFixed(1)
        });
    };

    const Download = props =>{

        return (
            <ExcelFile element={<Button type="button" color="success" className="mr-1">Save</Button>}>
                <ExcelSheet data={props.dataset} name="Report">
                    <ExcelColumn label="Pin" value="pin"/>
                    <ExcelColumn label="Pin Id" value="pinId"/>
                    <ExcelColumn label="Serial" value="serial"/>
                    <ExcelColumn label="User Name" value="userName"/>
                    <ExcelColumn label="User Id" value="userId"/>
                    <ExcelColumn label="Value" value="value"/>
                    <ExcelColumn label="Status" value="stat"/>
                    <ExcelColumn label="Traffic Number" value="trafficNo"/>
                    <ExcelColumn label="Date" value="date"/>
                </ExcelSheet>
            </ExcelFile>
        );

    };

    const sum = () =>{
        if(!searchKey.user) return 0;
        let newArray = userData.filter(function(item) {
            return item.id === searchKey.user;
        });

        return newArray[0].value?newArray[0].value:0;
    };

    return (
      <div className="animated fadeIn">
          <Row>
              <Col md={2}/>
              <Col md={8} className="text-center">
                  <Card>
                      <CardHeader>
                          <i className="icon-note"/><strong>Accepted pin Sum: {sum()}</strong>
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
                                                             name="user"
                                                             id="user"
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                             >
                                                          <option value="">Select Username</option>
                                                          {
                                                              userData !== null &&
                                                              userData.map((user, userIndex) => (
                                                                  <option value={user.id} key={userIndex}>{user.name}</option>
                                                              ))
                                                          }
                                                      </Input>
                                                  </FormGroup>
                                                  <FormGroup>
                                                      <Input type="select"
                                                             name="status"
                                                             id="status"
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}>
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
                                                      <Button type="submit"
                                                              color="primary"
                                                              className="mr-1"
                                                              disabled={isSubmitting}
                                                      >{isSubmitting ? 'Wait...' : 'Search'}
                                                      </Button>
                                                      <Download dataset={pinData}/>
                                                      <Button type="button"
                                                              color="warning"
                                                              className="mr-1"
                                                              disabled={!searchKey.user || sum() <= 0}
                                                              onClick={() => setDecreaseModal(true)}
                                                      >Decrease</Button>
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
          <Modal isOpen={modal} toggle={toggleModal}>
              <ModalHeader toggle={toggleModal}>Please choose</ModalHeader>
              <ModalBody>
                  <Button color="success" onClick={() =>updatePin("1")}>Approve</Button>{' '}
                  <Button color="danger" onClick={() =>updatePin("2")}>Reject</Button>
              </ModalBody>
          </Modal>
          <Modal isOpen={decrease} toggle={toggleDecrease}>
                  <ModalHeader toggle={toggleDecrease}>Please input value</ModalHeader>
                  <ModalBody>
                      <FormGroup>
                          <Input type="number"
                                 min={1}
                                 name="dec"
                                 id="dec"
                                 placeholder="Input value"
                                 autoComplete="dec"
                                 required
                          />
                      </FormGroup>
                      <Button color="danger" onClick={() => decreaseValue()}>Decrease</Button>
                  </ModalBody>
          </Modal>
      </div>
    );
};

export default Requests;
