import React, { useEffect, FunctionComponent  } from 'react';
import { RouteComponentProps } from 'react-router-dom';


import { Auth } from 'aws-amplify'
import Container from './Container'

type TParams = {  };
const Protected: FunctionComponent<RouteComponentProps<TParams>> = function (props: RouteComponentProps<TParams>) {
    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .catch(() => {
                props.history.push('/profile')
            })
        }, [])

    return (
        <Container>
            <h1>Protected route</h1>
        </Container>
    );
}

export default Protected