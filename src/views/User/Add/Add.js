import React, { useContext, useEffect, useState} from 'react';
import * as Yup from 'yup';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Col,
    Row,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Badge
} from 'reactstrap';

import {Formik} from "formik";
import {UserContext} from "../../../providers/UserProvider";
import {database, realtimedb} from "../../../firebase";

const validationSchema = function (values) {
    return Yup.object().shape({
        serial: Yup.string()
            .min(3, `Serial has to be at least 3 characters`)
            .required('Serial is required'),
        pin: Yup.string()
            .min(3, `Pin has to be at least 3 characters`)
            .required('Pin is required'),
        pinValue: Yup.string()
            .required('Value is required'),
    })
};

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values);
        try {
            validationSchema.validateSync(values, { abortEarly: false });
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
};

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0;
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
};

const initialValues = {
    serial: "",
    pin: "",
    pinValue: ""
};

const Add = props => {

    const user = useContext(UserContext);

    const [pinData, setPinData] = useState(null);
    const [counter, setCounter] = useState(null);

    useEffect(() => {
        const unsubscribe = database.collection('pins')
        .where('userId', '==', user.id)
            .onSnapshot(onPinCollectionUpdate);
        return () => unsubscribe();
    }, []);

    useEffect(() =>{
        const sub = realtimedb.ref('/count').on('value', snapshot =>{
            setCounter(parseInt(snapshot.val()) + 1);
            return () => sub();
        });
    });

    const onPinCollectionUpdate = snapshot => {
        let pinData = [];
        snapshot.forEach(doc => pinData.unshift(doc.data()));
        setPinData(pinData);
    };

    const formatDate =(date) =>{
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        return [day, month, year].join('-');
    };

    const onSubmit = async (values, { setSubmitting, setErrors })  =>{
        const id = Date.now().toString();
        const date = formatDate(Date.now());

        const pinDocument = await database.collection('pins')
            .where('pin', '==', values.pin)
            .get();

        if(pinDocument.docs.length > 0){
            setErrors({pin: "Pin duplicated"});
            setSubmitting(false);
            return;
        }

        const serialDocument = await database.collection('pins')
            .where('serial', '==', values.serial)
            .get();

        if(serialDocument.docs.length > 0){
            setErrors({serial: "Serial duplicated"});
            setSubmitting(false);
            return;
        }

        const pinRef = database.doc(`pins/${id}`);

        await pinRef.set({
            "date": date,
            "pin": values.pin,
            "pinId": id,
            "serial": values.serial,
            "stat": "0",
            "userId":user.id,
            "userName": user.name,
            "value": values.pinValue,
            "trafficNo": counter.toString()
        });

        await realtimedb.ref('/count').set(counter.toString());
        setSubmitting(false);

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

    return (
      <div className="animated fadeIn">
          <Row>
              <Col md={2}/>
              <Col md={8} className="text-center">
                  <Card>
                      <CardHeader>
                          <strong>Add Pin</strong>
                      </CardHeader>
                      <CardBody>
                          <Formik
                              initialValues={initialValues}
                              validate={validate(validationSchema)}
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
                                       isSubmitting,
                                       isValid,
                                   }) => (
                                      <Row>
                                          <Col lg={4} md={4}>
                                              <Form onSubmit={handleSubmit} noValidate name='simpleForm'>
                                                  <FormGroup>
                                                      <Input type="text"
                                                             name="serial"
                                                             id="serial"
                                                             placeholder="serial"
                                                             autoComplete="serial"
                                                             valid={!errors.serial}
                                                             invalid={touched.serial && !!errors.serial}
                                                             required
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                             value={values.serial} />
                                                      <FormFeedback>{errors.serial}</FormFeedback>
                                                  </FormGroup>
                                                  <FormGroup>
                                                      <Input type="text"
                                                             name="pin"
                                                             id="pin"
                                                             placeholder="Pin"
                                                             autoComplete="pin"
                                                             valid={!errors.pin}
                                                             invalid={touched.pin && !!errors.pin}
                                                             required
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                             value={values.pin} />
                                                      <FormFeedback>{errors.pin}</FormFeedback>
                                                  </FormGroup>
                                                  <Row>
                                                      <Col>
                                                          <FormGroup>
                                                              <Input type="text"
                                                                     name="pinValue"
                                                                     id="pinValue"
                                                                     placeholder="pinValue"
                                                                     autoComplete="pinValue"
                                                                     valid={!errors.pinValue}
                                                                     invalid={touched.pinValue && !!errors.pinValue}
                                                                     required
                                                                     onChange={handleChange}
                                                                     onBlur={handleBlur}
                                                                     value={values.pinValue} />
                                                              <FormFeedback>{errors.pinValue}</FormFeedback>
                                                          </FormGroup>
                                                      </Col>
                                                  </Row>
                                                  <FormGroup>
                                                      <Button
                                                          type="submit"
                                                          color="primary"
                                                          className="mr-1"
                                                          disabled={isSubmitting || !isValid}>{isSubmitting ? 'Wait...' : 'Add'}</Button>
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

export default Add;
