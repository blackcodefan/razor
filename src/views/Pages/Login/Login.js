import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup'
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row,FormFeedback } from 'reactstrap';
import { signInWithEmailAndPasswordHandler} from '../../../firebase/index';

const validationSchema = function (values) {
    return Yup.object().shape({
        username: Yup.string()
            .min(5, `Username has to be at least 5 characters`)
            .required('Username is required'),
        password: Yup.string()
            .min(6, `Password has to be at least ${6} characters!`)
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
    username: "",
    password: ""
};

const Login = props => {

    const onSubmit = async (values, { setSubmitting, setErrors })  =>{
        let result = await signInWithEmailAndPasswordHandler(values);
        setSubmitting(false);
        if(!result.success){
            setErrors({username: result.error});
        }
    };

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
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
                                  isValid
                          }) =>(
                              <Form onSubmit={handleSubmit} noValidate name='simpleForm'>
                                  <h1>Login</h1>
                                  <p className="text-muted">Sign In to your account</p>
                                  <InputGroup className="mb-3">
                                      <InputGroupAddon addonType="prepend">
                                          <InputGroupText>
                                              <i className="icon-user"/>
                                          </InputGroupText>
                                      </InputGroupAddon>
                                      <Input
                                          type="text"
                                          placeholder="Username"
                                          autoComplete="username"
                                          name="username"
                                          valid={!errors.username}
                                          invalid={touched.username && !!errors.username}
                                          required
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          value={values.username}
                                      />
                                      <FormFeedback>{errors.username}</FormFeedback>
                                  </InputGroup>
                                  <InputGroup className="mb-4">
                                      <InputGroupAddon addonType="prepend">
                                          <InputGroupText>
                                              <i className="icon-lock"/>
                                          </InputGroupText>
                                      </InputGroupAddon>
                                      <Input
                                          type="password"
                                          placeholder="Password"
                                          autoComplete="current-password"
                                          name="password"
                                          valid={!errors.password}
                                          invalid={touched.password && !!errors.password}
                                          required
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          value={values.password}
                                      />
                                      <FormFeedback>{errors.password}</FormFeedback>
                                  </InputGroup>
                                  <Row>
                                      <Col xs={3} md={3}/>
                                      <Col xs="6" className={"text-center"}>
                                          <Button
                                              type="submit"
                                              color="primary"
                                              className="px-4"
                                              disabled={isSubmitting || !isValid}
                                             >{isSubmitting ? 'Wait...' : 'Submit'}</Button>
                                      </Col>
                                  </Row>
                              </Form>
                              ) }
                      />

                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );

};

export default Login;
