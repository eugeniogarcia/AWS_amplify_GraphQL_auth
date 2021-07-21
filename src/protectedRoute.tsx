import React, { useEffect, FunctionComponent  } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { Auth } from 'aws-amplify'

type TParams = {};

const protectedRoute = (Comp: FunctionComponent<RouteComponentProps<TParams>>, route = '/profile') => (props:RouteComponentProps<TParams>) => {
    async function checkAuthState() {
        try {
            await Auth.currentAuthenticatedUser()
        } catch (err) {
            props.history.push(route)
        }
    }

    useEffect(() => {
        checkAuthState()
    }, [])
    return <Comp {...props} />
}

export default protectedRoute