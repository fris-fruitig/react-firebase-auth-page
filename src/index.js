// @flow
import React from 'react';
import firebase from 'firebase';
import {
  Segment,
  Header,
  Message,
  Form,
  Grid,
  Container
} from 'semantic-ui-react';
import { validate as validateEmail } from 'email-validator';

const errorCodes = {
  'invalid-email': { email: 'Dit is geen geldig emailadres' },
  'no-password': { password: 'Je hebt geen wachtwoord ingevuld' },
  'auth/invalid-email': { email: 'Dit is geen geldig emailadres' },
  'auth/user-disabled': {
    login: 'Je hebt geen toegang meer tot je account. Neemt contact op met Planl.'
  },
  'auth/wrong-password': {
    password: 'Je wachtwoord is klopt niet. Probeer het opnieuw.'
  },
  'auth/user-not-found': {
    login: 'Deze combinatie klopt niet, probeer het opnieuw.'
  },
  default: {
    login: 'Er is een fout opgetreden. Controleer je verbinding en probeer het opnieuw.'
  }
};

const mergeError = (errors: Object, code: string) => ({
  ...errors,
  ...(errorCodes[code] || errorCodes.default)
});

function preventEvent(event: SyntheticEvent) {
  event.preventDefault();
}

type State = {
  email: string,
  password: string,
  errors: {
    email?: string,
    password?: string,
    login?: string
  },
  isLoading?: boolean
};

export default class Auth extends React.Component {
  state: State = {
    email: '',
    password: '',
    errors: {}
  };

  props: {
    header: string
  };

  validate = ({
    email,
    password
  }: {
    email: string,
    password: string
  }): { email?: string, password?: string } => {
    let errors = {};
    if (!validateEmail(email)) {
      errors = mergeError(errors, 'invalid-email');
    }
    if (!password) {
      errors = mergeError(errors, 'no-password');
    }
    return errors;
  };

  login = async (credentials: { email: string, password: string }) => {
    this.setState({ isLoading: true });

    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(credentials.email, credentials.password);
    } catch (error) {
      this.setState(({ errors }) => ({
        errors: mergeError(errors, error.code),
        isLoading: false
      }));
    }
  };

  handleSubmit = () => {
    const credentials = {
      email: this.state.email,
      password: this.state.password
    };
    const errors = this.validate(credentials);
    if (Object.keys(errors).length) {
      return this.setState({ errors });
    }

    this.login(credentials);
  };

  handleChangeEmail = (e: SyntheticInputEvent) =>
    this.setState({ email: e.target.value });
  handleChangePassword = (e: SyntheticInputEvent) =>
    this.setState({ password: e.target.value });

  render() {
    const { errors, isLoading, email, password } = this.state;

    return (
      <Grid verticalAlign="middle" centered style={{ height: '100%' }}>
        <Grid.Row>
          <Grid.Column>
            <Container className="loginform">
              <Grid centered verticalAlign="middle">
                <Grid.Column>
                  <Segment
                    padded="very"
                    color="blue"
                    style={{ maxWidth: 500, margin: '0 auto' }}
                  >
                    <Header as="h1">
                      <Header.Content>
                        {this.props.header}
                        <Header.Subheader>
                          Login met je gegevens
                        </Header.Subheader>
                      </Header.Content>
                    </Header>
                    <Message
                      error
                      hidden={!errors.login}
                      content={errors.login}
                    />
                    <Form onSubmit={preventEvent} loading={isLoading}>
                      <Form.Input
                        name="email"
                        placeholder="Email"
                        error={!!errors.email}
                        label={errors.email}
                        value={email}
                        onChange={this.handleChangeEmail}
                      />
                      <Form.Input
                        name="password"
                        placeholder="Wachtwoord"
                        type="password"
                        error={!!errors.password}
                        label={errors.password}
                        value={password}
                        onChange={this.handleChangePassword}
                      />
                      <Form.Button
                        color="blue"
                        fluid
                        onClick={this.handleSubmit}
                      >
                        Login
                      </Form.Button>
                    </Form>
                  </Segment>
                </Grid.Column>
              </Grid>
            </Container>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
