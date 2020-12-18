import React, {Component, createContext} from 'react';
import {auth, getUserDocument} from '../firebase';

export const UserContext = createContext({ user: null });

class UserProvider extends Component {
    state = {
        user: null
    };

    componentDidMount = async () => {
        auth.onAuthStateChanged(async userAuth => {
            if(userAuth !== null && !userAuth.isAnonymous) {
                const user = await getUserDocument(userAuth.email.match(/^([^@]*)@/)[1]);
                this.setState({user: user});
            }else{
                this.setState({user: null});
            }
        });
    };

    render() {
        return (
            <UserContext.Provider value={this.state.user}>
                {this.props.children}
            </UserContext.Provider>
        );
    }
}

export default UserProvider;