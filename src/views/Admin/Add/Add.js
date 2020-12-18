import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup'
import './ValidationForms.css'
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
    Input
} from 'reactstrap';

import {createUserWithEmailAndPasswordHandler} from '../../../firebase';

const validationSchema = function (values) {
    return Yup.object().shape({
        name: Yup.string()
            .min(2, `Name has to be at least 2 characters`)
            .required('Name is required'),
        userName: Yup.string()
            .min(5, `Username has to be at least 5 characters`)
            .required('Username is required'),
        password: Yup.string()
            .min(6, `Password has to be at least ${6} characters!`)
            .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/, 'Password must contain: numbers, uppercase and lowercase letters\n')
            .required('Password is required'),
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
    name: "",
    userName: "",
    password: "",
    type: "1"
};


const  AddUser = props => {

     const onSubmit = async (values, { setSubmitting, setErrors })  =>{
        let result = await createUserWithEmailAndPasswordHandler(values);
        setSubmitting(false);
        if(!result.success){
            setErrors({name: result.error});
        }else{
            props.history.replace('/requests');
        }
    };


    return (
      <div className="animated fadeIn">
          <Row>
              <Col md={4}/>
              <Col md={4} className="text-center">
                  <Card>
                      <CardHeader>
                          <i className="icon-user"/><strong>Add User</strong>
                      </CardHeader>
                      <CardBody>
                          <hr />
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
                                       handleReset,
                                       setTouched
                                   }) => (
                                      <Row>
                                          <Col>
                                              <Form onSubmit={handleSubmit} noValidate name='simpleForm'>
                                                  <FormGroup>
                                                      <Input type="text"
                                                             name="name"
                                                             id="name"
                                                             placeholder="Name"
                                                             autoComplete="name"
                                                             valid={!errors.name}
                                                             invalid={touched.name && !!errors.name}
                                                             required
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                             value={values.name} />
                                                      <FormFeedback>{errors.name}</FormFeedback>
                                                  </FormGroup>
                                                  <FormGroup>
                                                      <Input type="text"
                                                             name="userName"
                                                             id="userName"
                                                             placeholder="User Name"
                                                             autoComplete="username"
                                                             valid={!errors.userName}
                                                             invalid={touched.userName && !!errors.userName}
                                                             required
                                                             onChange={handleChange}
                                                             onBlur={handleBlur}
                                                             value={values.userName} />
                                                      <FormFeedback>{errors.userName}</FormFeedback>
                                                  </FormGroup>
                                                  <Row>
                                                      <Col>
                                                          <FormGroup>
                                                              <Input type="password"
                                                                     name="password"
                                                                     id="password"
                                                                     placeholder="Password"
                                                                     autoComplete="new-password"
                                                                     valid={!errors.password}
                                                                     invalid={touched.password && !!errors.password}
                                                                     required
                                                                     onChange={handleChange}
                                                                     onBlur={handleBlur}
                                                                     value={values.password} />
                                                              <FormFeedback>{errors.password}</FormFeedback>
                                                          </FormGroup>
                                                      </Col>
                                                  </Row>
                                                  <Row>
                                                      <Col>
                                                          <FormGroup>
                                                              <Input type="select"
                                                                     name="type"
                                                                     id="type"
                                                                     required
                                                                     onChange={handleChange}
                                                                     onBlur={handleBlur}
                                                                     value={values.type}>
                                                                  <option value="1">Admin</option>
                                                                  <option value="2">User</option>
                                                              </Input>
                                                          </FormGroup>
                                                      </Col>
                                                  </Row>
                                                  <FormGroup>
                                                      <Button type="submit" color="primary" className="mr-1" disabled={isSubmitting || !isValid}>{isSubmitting ? 'Wait...' : 'Submit'}</Button>
                                                  </FormGroup>
                                              </Form>
                                          </Col>
                                      </Row>
                                  )} />
                      </CardBody>
                  </Card>
              </Col>
          </Row>
      </div>
    );

}

export default AddUser;